"use server";

import { z } from "zod";
import { addEnrollment, getClubById, getStudentDetailsByMatricula } from "@/lib/data";
import type { SignUpFormData, User } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { Routes } from "../constants";

const SignUpFormSchema = z.object({
  matricula: z.string().min(1, "La matrícula es obligatoria."),
  firstName: z.string().min(1, "El nombre es obligatorio."),
  lastName: z.string().min(1, "El apellido es obligatorio."),
  group: z.string().min(1, "El grupo es obligatorio."),
  clubId: z.string().min(1, "La selección del club es obligatoria."),
  timeSlotId: z.string().min(1, "La selección del horario es obligatoria."),
});

export async function signUpForClubAction(formData: SignUpFormData) {
  const validatedFields = SignUpFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campos Faltantes. Fallo al Inscribirse.",
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
    
    revalidatePath(Routes.STUDENT_DASHBOARD);
    revalidatePath(Routes.STUDENT_SIGNUP(clubId)); 
    revalidatePath(Routes.ADMIN_ENROLLMENTS);
    revalidatePath(Routes.ADMIN_CLUBS_EDIT(clubId));


    return { success: true, message: "¡Inscrito exitosamente en el club!" };
  } catch (error) {
    console.error("Error de inscripción:", error);
    return { message: "Error de Base de Datos: No se pudo inscribir al club." };
  }
}

export async function fetchStudentDetailsForForm(matricula: string, user: User | null) {
    return getStudentDetailsByMatricula(matricula, user);
}

export async function fetchClubForSignup(clubId: string) {
    return getClubById(clubId);
}
