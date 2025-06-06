"use server";

import { z } from "zod";
import { addEnrollment, getClubById, getStudentDetailsByMatricula } from "@/lib/data";
import type { SignUpFormData, User } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { Routes } from "../constants";

const SignUpFormSchema = z.object({
  matricula: z.string().min(1, "Matricula is required."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  group: z.string().min(1, "Group is required."),
  clubId: z.string().min(1, "Club selection is required."),
  timeSlotId: z.string().min(1, "Time slot selection is required."),
});

export async function signUpForClubAction(formData: SignUpFormData) {
  const validatedFields = SignUpFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Sign Up.",
    };
  }

  const { matricula, firstName, lastName, group, clubId, timeSlotId } = validatedFields.data;

  try {
    const result = await addEnrollment({
      studentMatricula: matricula,
      studentFirstName: firstName,
      studentLastName: lastName,
      studentGroup: group,
      clubId,
      timeSlotId,
    });

    if (typeof result === 'string') { // Error message returned
        return { message: result };
    }
    
    // Revalidate paths that show club lists or enrollment counts
    revalidatePath(Routes.STUDENT_DASHBOARD);
    revalidatePath(Routes.STUDENT_SIGNUP(clubId)); // Revalidate the specific signup page if needed
    revalidatePath(Routes.ADMIN_ENROLLMENTS);
    revalidatePath(Routes.ADMIN_CLUBS_EDIT(clubId));


    return { success: true, message: "Successfully enrolled in the club!" };
  } catch (error) {
    console.error("Sign up error:", error);
    return { message: "Database Error: Failed to sign up for club." };
  }
}

export async function fetchStudentDetailsForForm(matricula: string, user: User | null) {
    // This function should be secured in a real app to prevent arbitrary student data lookup
    // For now, it uses the logged-in user's context if available
    return getStudentDetailsByMatricula(matricula, user);
}

export async function fetchClubForSignup(clubId: string) {
    return getClubById(clubId);
}
