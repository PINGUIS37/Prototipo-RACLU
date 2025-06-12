"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createClubAction, updateClubAction } from "@/lib/actions/admin.actions";
import type { Club, ClubFormData, DayOfWeek, TimeSlot, TimeSlotFormData } from "@/lib/types";
import { useState, useEffect } from "react";
import { Loader2, Save, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Routes, DAYS_OF_WEEK } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TimeSlotManager } from "./TimeSlotManager"; // Import the new component

const IconOptions = ["Rompecabezas", "Microfono", "Brocha", "Codigo", "Usuario", "Gráfico de barras", "Musica", "Libro abierto", "Pelicula", "Computadora", "Mando de juego", "Trofeo"];


const TimeSlotSchema = z.object({
  id: z.string().optional(), 
  dayOfWeek: z.enum(DAYS_OF_WEEK as [DayOfWeek, ...DayOfWeek[]]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora de inicio inválido (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora de fin inválido (HH:MM)"),
  capacity: z.coerce.number().int().min(0, "La capacidad debe ser un entero no negativo."),
  enrolledCount: z.coerce.number().int().optional(),
}).refine(data => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return endH > startH || (endH === startH && endM > startM);
}, { message: "La hora de fin debe ser posterior a la hora de inicio.", path: ["endTime"] });


const ClubFormInternalSchema = z.object({
  name: z.string().min(3, "El nombre del club debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  categoryIcon: z.string().optional(),
  timeSlots: z.array(TimeSlotSchema).min(0), 
});


type ClubFormValues = z.infer<typeof ClubFormInternalSchema>;

interface ClubFormProps {
  club?: Club; 
}

export function ClubForm({ club }: ClubFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClubFormValues>({
    resolver: zodResolver(ClubFormInternalSchema),
    defaultValues: {
      name: club?.name || "",
      description: club?.description || "",
      categoryIcon: club?.categoryIcon || IconOptions[0],
      timeSlots: club?.timeSlots || [],
    },
  });

  async function onSubmit(data: ClubFormValues) {
    setIsSubmitting(true);
    let result;
    const clubData = {name: data.name, description: data.description, categoryIcon: data.categoryIcon};
    const timeSlotsData = data.timeSlots;

    if (club) {
      result = await updateClubAction(club.id, clubData, timeSlotsData);
    } else {
      result = await createClubAction(clubData, timeSlotsData as TimeSlotFormData[]);
    }
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: club ? "Club Actualizado" : "Club Creado",
        description: result.message,
      });
      router.push(Routes.ADMIN_CLUBS);
    } else {
      toast({
        variant: "destructive",
        title: "Operación Fallida",
        description: result.message || "Ocurrió un error inesperado.",
      });
      if(result.errors) console.log(result.errors); 
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Club</CardTitle>
            <CardDescription>Proporciona la información principal del club.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Club</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., Club de Fotografía" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Una breve descripción de las actividades y objetivos del club." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryIcon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icono de Categoría (Nombre de Lucide)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un icono" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {IconOptions.map(iconName => (
                        <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Elige un icono que represente al club.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <TimeSlotManager clubForm={form} />

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" /> {club ? "Guardar Cambios" : "Crear Club"}
        </Button>
         {form.formState.errors.timeSlots && typeof form.formState.errors.timeSlots === 'object' && 'message' in form.formState.errors.timeSlots && (
            <p className="text-sm font-medium text-destructive">{(form.formState.errors.timeSlots as any).message}</p>
        )}
      </form>
    </Form>
  );
}
