"use client";

import type { TimeSlot, DayOfWeek, TimeSlotFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, PlusCircle, Clock, CalendarDays, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { useFieldArray, useForm, Controller, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schema for a single TimeSlot input by admin
const AdminTimeSlotSchema = z.object({
  dayOfWeek: z.enum(DAYS_OF_WEEK as [DayOfWeek, ...DayOfWeek[]], { required_error: "El día es obligatorio."}),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora de inicio inválida (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora de fin inválida (HH:MM)"),
  capacity: z.coerce.number().int().min(0, "La capacidad debe ser un entero no negativo."),
}).refine(data => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return endH > startH || (endH === startH && endM > startM);
}, { message: "La hora de fin debe ser posterior a la hora de inicio.", path: ["endTime"] });


interface TimeSlotManagerProps {
  clubForm: UseFormReturn<any>; 
}

export function TimeSlotManager({ clubForm }: TimeSlotManagerProps) {
  const { fields, append, remove, update } = useFieldArray({
    control: clubForm.control,
    name: "timeSlots", 
  });

  const { register, handleSubmit, reset, control: timeSlotFormControl, formState: { errors } } = useForm<TimeSlotFormData>({
    resolver: zodResolver(AdminTimeSlotSchema),
    defaultValues: {
      dayOfWeek: "Lunes" as DayOfWeek,
      startTime: "10:00",
      endTime: "11:00",
      capacity: 10,
    },
  });

  const onAddTimeSlot = (data: TimeSlotFormData) => {
    append({ ...data, id: `new-${Date.now()}`, enrolledCount: 0 }); 
    reset(); 
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Horarios</CardTitle>
        <CardDescription>Añade, edita o elimina horarios disponibles para este club.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* List existing time slots */}
        {fields.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Horarios Actuales:</h4>
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4 bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <Controller
                    control={clubForm.control}
                    name={`timeSlots.${index}.dayOfWeek`}
                    render={({ field: dayField }) => (
                      <div className="space-y-1">
                        <Label htmlFor={`ts-day-${index}`}>Día</Label>
                        <Select onValueChange={dayField.onChange} defaultValue={dayField.value}>
                          <SelectTrigger id={`ts-day-${index}`}><SelectValue /></SelectTrigger>
                          <SelectContent>{DAYS_OF_WEEK.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                   <div className="space-y-1">
                      <Label htmlFor={`ts-start-${index}`}>Hora Inicio</Label>
                      <Input id={`ts-start-${index}`} type="time" {...clubForm.register(`timeSlots.${index}.startTime`)} />
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor={`ts-end-${index}`}>Hora Fin</Label>
                      <Input id={`ts-end-${index}`} type="time" {...clubForm.register(`timeSlots.${index}.endTime`)} />
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor={`ts-capacity-${index}`}>Capacidad</Label>
                      <Input id={`ts-capacity-${index}`} type="number" min="0" {...clubForm.register(`timeSlots.${index}.capacity`, { valueAsNumber: true })} />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} aria-label="Eliminar horario">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {(clubForm.formState.errors.timeSlots?.[index] as any)?.startTime && <p className="text-destructive text-xs mt-1">{(clubForm.formState.errors.timeSlots?.[index] as any)?.startTime.message}</p>}
                {(clubForm.formState.errors.timeSlots?.[index] as any)?.endTime && <p className="text-destructive text-xs mt-1">{(clubForm.formState.errors.timeSlots?.[index] as any)?.endTime.message}</p>}
                {(clubForm.formState.errors.timeSlots?.[index] as any)?.capacity && <p className="text-destructive text-xs mt-1">{(clubForm.formState.errors.timeSlots?.[index] as any)?.capacity.message}</p>}
              </Card>
            ))}
          </div>
        )}
        {fields.length === 0 && <p className="text-sm text-muted-foreground">Aún no se han añadido horarios.</p>}

        {/* Form to add a new time slot */}
        <form onSubmit={handleSubmit(onAddTimeSlot)} className="space-y-4 border-t pt-6">
          <h4 className="font-medium text-lg">Añadir Nuevo Horario</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Controller
              control={timeSlotFormControl}
              name="dayOfWeek"
              render={({ field }) => (
                <div className="space-y-1">
                  <Label htmlFor="new-ts-day">Día</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="new-ts-day"><SelectValue /></SelectTrigger>
                    <SelectContent>{DAYS_OF_WEEK.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.dayOfWeek && <p className="text-destructive text-xs">{errors.dayOfWeek.message}</p>}
                </div>
              )}
            />
            <div className="space-y-1">
              <Label htmlFor="new-ts-start">Hora Inicio</Label>
              <Input id="new-ts-start" type="time" {...register("startTime")} />
              {errors.startTime && <p className="text-destructive text-xs">{errors.startTime.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-ts-end">Hora Fin</Label>
              <Input id="new-ts-end" type="time" {...register("endTime")} />
              {errors.endTime && <p className="text-destructive text-xs">{errors.endTime.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-ts-capacity">Capacidad</Label>
              <Input id="new-ts-capacity" type="number" min="0" {...register("capacity", {valueAsNumber: true})} />
              {errors.capacity && <p className="text-destructive text-xs">{errors.capacity.message}</p>}
            </div>
          </div>
          <Button type="submit" variant="secondary">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Horario
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
