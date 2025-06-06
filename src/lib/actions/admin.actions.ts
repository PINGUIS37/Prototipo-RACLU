"use server";

import { z } from "zod";
import { addClub, deleteClub, getClubById, removeEnrollment, updateClub } from "@/lib/data";
import type { ClubFormData, DayOfWeek, TimeSlot, TimeSlotFormData } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { Routes, DAYS_OF_WEEK } from "../constants";
import { v4 as uuidv4 } from "uuid";

const TimeSlotSchema = z.object({
  id: z.string().optional(), // Optional for new slots
  dayOfWeek: z.enum(DAYS_OF_WEEK as [DayOfWeek, ...DayOfWeek[]]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format (HH:MM)"),
  capacity: z.coerce.number().int().min(0, "Capacity cannot be negative."),
  enrolledCount: z.coerce.number().int().optional(), // For existing slots
}).refine(data => {
    // Basic validation: end time must be after start time
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return endH > startH || (endH === startH && endM > startM);
}, { message: "End time must be after start time.", path: ["endTime"] });


const ClubFormSchema = z.object({
  name: z.string().min(3, "Club name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categoryIcon: z.string().optional(),
  timeSlots: z.array(TimeSlotSchema).min(0, "At least one time slot is recommended."), // Allow zero for initial creation
});

export async function createClubAction(formData: ClubFormData, timeSlotsData: TimeSlotFormData[]) {
  const clubDataWithSlots = {
    ...formData,
    timeSlots: timeSlotsData.map(ts => ({...ts})) // create new objects, id and enrolledCount will be set in addClub
  };
  const validatedFields = ClubFormSchema.safeParse(clubDataWithSlots);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Failed to create club.",
    };
  }

  const { name, description, categoryIcon, timeSlots } = validatedFields.data;

  try {
    const newClubData = { name, description, categoryIcon, timeSlots: timeSlots.map(ts => ({...ts, id: uuidv4(), enrolledCount: 0})) };
    await addClub(newClubData);
    revalidatePath(Routes.ADMIN_CLUBS);
    revalidatePath(Routes.STUDENT_DASHBOARD);
    return { success: true, message: "Club created successfully." };
  } catch (error) {
    return { message: "Database Error: Failed to create club." };
  }
}

export async function updateClubAction(clubId: string, formData: ClubFormData, timeSlotsData: TimeSlot[]) {
   const clubDataWithSlots = {
    ...formData,
    timeSlots: timeSlotsData.map(ts => ({
        id: ts.id || uuidv4(), // ensure ID for new slots
        dayOfWeek: ts.dayOfWeek,
        startTime: ts.startTime,
        endTime: ts.endTime,
        capacity: Number(ts.capacity), // ensure number
        enrolledCount: Number(ts.enrolledCount || 0), // ensure number
    }))
  };

  const validatedFields = ClubFormSchema.safeParse(clubDataWithSlots);

  if (!validatedFields.success) {
    console.log("Validation errors:", validatedFields.error.flatten());
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Failed to update club.",
    };
  }
  
  const { name, description, categoryIcon, timeSlots } = validatedFields.data;

  try {
    // Check for capacity issues with existing enrollments if capacity is reduced for a timeslot
    const existingClub = await getClubById(clubId);
    if (existingClub) {
        for (const updatedSlot of timeSlots) {
            const existingSlot = existingClub.timeSlots.find(es => es.id === updatedSlot.id);
            if (existingSlot && updatedSlot.capacity < existingSlot.enrolledCount) {
                return { message: `Cannot reduce capacity for slot ${existingSlot.dayOfWeek} ${existingSlot.startTime}-${existingSlot.endTime} below current enrollment count (${existingSlot.enrolledCount}).` };
            }
        }
    }

    await updateClub(clubId, { name, description, categoryIcon, timeSlots });
    revalidatePath(Routes.ADMIN_CLUBS);
    revalidatePath(Routes.ADMIN_CLUBS_EDIT(clubId));
    revalidatePath(Routes.STUDENT_DASHBOARD);
    revalidatePath(Routes.STUDENT_SIGNUP(clubId));
    return { success: true, message: "Club updated successfully." };
  } catch (error) {
    console.error(error);
    return { message: "Database Error: Failed to update club." };
  }
}

export async function deleteClubAction(clubId: string) {
  try {
    await deleteClub(clubId);
    revalidatePath(Routes.ADMIN_CLUBS);
    revalidatePath(Routes.STUDENT_DASHBOARD);
    // Potentially revalidate student-specific views if they were enrolled
    return { success: true, message: "Club deleted successfully." };
  } catch (error) {
    return { message: "Database Error: Failed to delete club." };
  }
}


export async function removeEnrollmentAction(enrollmentId: string, clubId: string) {
  try {
    await removeEnrollment(enrollmentId);
    revalidatePath(Routes.ADMIN_ENROLLMENTS);
    revalidatePath(Routes.ADMIN_CLUBS_EDIT(clubId)); // Revalidate club details if it shows enrollment counts
    revalidatePath(Routes.STUDENT_DASHBOARD); // Student might see updated availability
    return { success: true, message: "Enrollment removed successfully." };
  } catch (error) {
    return { message: "Database Error: Failed to remove enrollment." };
  }
}

export async function fetchClubForEditing(clubId: string) {
    return getClubById(clubId);
}
