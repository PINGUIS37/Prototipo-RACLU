"use server";

import { z } from "zod";
import { addClub, deleteClub, getClubById, removeEnrollment, updateClub } from "@/lib/data";
import type { ClubFormData, DayOfWeek, TimeSlot, TimeSlotFormData } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { Routes, DAYS_OF_WEEK } from "../constants";
import { v4 as uuidv4 } from "uuid";

const TimeSlotSchema = z.object({
  id: z.string().optional(), 
  dayOfWeek: z.enum(DAYS_OF_WEEK as [DayOfWeek, ...DayOfWeek[]]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora de inicio inválido (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora de fin inválido (HH:MM)"),
  capacity: z.coerce.number().int().min(0, "La capacidad no puede ser negativa."),
  enrolledCount: z.coerce.number().int().optional(), 
}).refine(data => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return endH > startH || (endH === startH && endM > startM);
}, { message: "La hora de fin debe ser posterior a la hora de inicio.", path: ["endTime"] });


const ClubFormSchema = z.object({
  name: z.string().min(3, "El nombre del club debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  categoryIcon: z.string().optional(),
  timeSlots: z.array(TimeSlotSchema).min(0, "Se recomienda al menos un horario."),
});

export async function createClubAction(formData: ClubFormData, timeSlotsData: TimeSlotFormData[]) {
  const clubDataWithSlots = {
    ...formData,
    timeSlots: timeSlotsData.map(ts => ({...ts})) 
  };
  const validatedFields = ClubFormSchema.safeParse(clubDataWithSlots);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. No se pudo crear el club.",
    };
  }

  const { name, description, categoryIcon, timeSlots } = validatedFields.data;

  try {
    const newClubData = { name, description, categoryIcon, timeSlots: timeSlots.map(ts => ({...ts, id: uuidv4(), enrolledCount: 0})) };
    await addClub(newClubData);
    revalidatePath(Routes.ADMIN_CLUBS);
    revalidatePath(Routes.STUDENT_DASHBOARD);
    return { success: true, message: "Club creado exitosamente." };
  } catch (error) {
    return { message: "Error de Base de Datos: No se pudo crear el club." };
  }
}

export async function updateClubAction(clubId: string, formData: ClubFormData, timeSlotsData: TimeSlot[]) {
   const clubDataWithSlots = {
    ...formData,
    timeSlots: timeSlotsData.map(ts => ({
        id: ts.id || uuidv4(), 
        dayOfWeek: ts.dayOfWeek,
        startTime: ts.startTime,
        endTime: ts.endTime,
        capacity: Number(ts.capacity), 
        enrolledCount: Number(ts.enrolledCount || 0), 
    }))
  };

  const validatedFields = ClubFormSchema.safeParse(clubDataWithSlots);

  if (!validatedFields.success) {
    console.log("Errores de validación:", validatedFields.error.flatten());
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. No se pudo actualizar el club.",
    };
  }
  
  const { name, description, categoryIcon, timeSlots } = validatedFields.data;

  try {
    const existingClub = await getClubById(clubId);
    if (existingClub) {
        for (const updatedSlot of timeSlots) {
            const existingSlot = existingClub.timeSlots.find(es => es.id === updatedSlot.id);
            if (existingSlot && updatedSlot.capacity < existingSlot.enrolledCount) {
                return { message: `No se puede reducir la capacidad para el horario ${existingSlot.dayOfWeek} ${existingSlot.startTime}-${existingSlot.endTime} por debajo del número actual de inscritos (${existingSlot.enrolledCount}).` };
            }
        }
    }

    await updateClub(clubId, { name, description, categoryIcon, timeSlots });
    revalidatePath(Routes.ADMIN_CLUBS);
    revalidatePath(Routes.ADMIN_CLUBS_EDIT(clubId));
    revalidatePath(Routes.STUDENT_DASHBOARD);
    revalidatePath(Routes.STUDENT_SIGNUP(clubId));
    return { success: true, message: "Club actualizado exitosamente." };
  } catch (error) {
    console.error(error);
    return { message: "Error de Base de Datos: No se pudo actualizar el club." };
  }
}

export async function deleteClubAction(clubId: string) {
  try {
    await deleteClub(clubId);
    revalidatePath(Routes.ADMIN_CLUBS);
    revalidatePath(Routes.STUDENT_DASHBOARD);
    return { success: true, message: "Club eliminado exitosamente." };
  } catch (error) {
    return { message: "Error de Base de Datos: No se pudo eliminar el club." };
  }
}


export async function removeEnrollmentAction(enrollmentId: string, clubId: string) {
  try {
    await removeEnrollment(enrollmentId);
    revalidatePath(Routes.ADMIN_ENROLLMENTS);
    revalidatePath(Routes.ADMIN_CLUBS_EDIT(clubId)); 
    revalidatePath(Routes.STUDENT_DASHBOARD); 
    return { success: true, message: "Inscripción eliminada exitosamente." };
  } catch (error) {
    return { message: "Error de Base de Datos: No se pudo eliminar la inscripción." };
  }
}

export async function fetchClubForEditing(clubId: string) {
    return getClubById(clubId);
}
