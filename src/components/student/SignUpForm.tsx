"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchClubForSignup, signUpForClubAction, fetchStudentDetailsForForm } from "@/lib/actions/student.actions";
import type { Club, SignUpFormData, TimeSlot } from "@/lib/types";
import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Routes } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

const SignUpFormSchema = z.object({
  matricula: z.string().min(1, "La matrícula es obligatoria."),
  firstName: z.string().min(1, "El nombre es obligatorio."),
  lastName: z.string().min(1, "El apellido es obligatorio."),
  group: z.string().min(1, "El grupo es obligatorio."),
  clubId: z.string(), // Hidden field, pre-filled
  timeSlotId: z.string().min(1, "Por favor selecciona un horario disponible."),
});

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

interface SignUpFormProps {
  club: Club;
}

export function SignUpForm({ club }: SignUpFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user: loggedInUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      matricula: "",
      firstName: "",
      lastName: "",
      group: "",
      clubId: club.id,
      timeSlotId: "",
    },
  });

  useEffect(() => {
    if (loggedInUser && loggedInUser.role === 'student' && loggedInUser.matricula) {
      fetchStudentDetailsForForm(loggedInUser.matricula, loggedInUser).then(details => {
        if (details) {
          form.reset({
            ...form.getValues(),
            matricula: details.studentMatricula || "",
            firstName: details.studentFirstName || "",
            lastName: details.studentLastName || "",
            group: details.studentGroup || "",
            clubId: club.id,
          });
        }
      });
    }
  }, [loggedInUser, form, club.id]);

  useEffect(() => {
    // Filter time slots that are not full
    setAvailableTimeSlots(club.timeSlots.filter(ts => ts.enrolledCount < ts.capacity));
  }, [club.timeSlots]);

  async function onSubmit(data: SignUpFormValues) {
    setIsSubmitting(true);
    const result = await signUpForClubAction(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "¡Inscripción Exitosa!",
        description: result.message,
      });
      router.push(Routes.STUDENT_DASHBOARD); // Or a success page
    } else {
      toast({
        variant: "destructive",
        title: "Fallo en la Inscripción",
        description: result.message || "Ocurrió un error inesperado.",
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UserPlus className="h-6 w-6 text-primary" />
          Inscribirse en: {club.name}
        </CardTitle>
        <CardDescription>{club.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="matricula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula (ID Estudiante)</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu ID de estudiante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo / Clase</FormLabel>
                    <FormControl>
                      <Input placeholder="ej., CS101, Grupo A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre(s)</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre(s)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input placeholder="Tus apellidos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="timeSlotId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día y Hora Disponibles</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un horario disponible" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.dayOfWeek}, {slot.startTime} - {slot.endTime} 
                            (Disponibles: {slot.capacity - slot.enrolledCount})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-slots" disabled>No hay horarios disponibles para este club.</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Elige tu día y hora preferidos para asistir al club.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField name="clubId" control={form.control} render={({ field }) => <Input type="hidden" {...field} />} />

            <Button type="submit" className="w-full" disabled={isSubmitting || availableTimeSlots.length === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Inscribiendo..." : "Inscribirse Ahora"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
            Asegúrate de que tus datos sean correctos antes de enviar. La inscripción está sujeta a disponibilidad.
        </p>
      </CardFooter>
    </Card>
  );
}
