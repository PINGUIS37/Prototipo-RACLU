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
  matricula: z.string().min(1, "Matricula is required."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  group: z.string().min(1, "Group is required."),
  clubId: z.string(), // Hidden field, pre-filled
  timeSlotId: z.string().min(1, "Please select an available time slot."),
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
        title: "Enrollment Successful!",
        description: result.message,
      });
      router.push(Routes.STUDENT_DASHBOARD); // Or a success page
    } else {
      toast({
        variant: "destructive",
        title: "Enrollment Failed",
        description: result.message || "An unexpected error occurred.",
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UserPlus className="h-6 w-6 text-primary" />
          Enroll in: {club.name}
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
                    <FormLabel>Matricula (Student ID)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your student ID" {...field} />
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
                    <FormLabel>Group / Class</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CS101, Group A" {...field} />
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
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your first name" {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your last name" {...field} />
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
                  <FormLabel>Available Day and Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an available slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.dayOfWeek}, {slot.startTime} - {slot.endTime} 
                            (Available: {slot.capacity - slot.enrolledCount})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-slots" disabled>No available slots for this club.</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your preferred day and time to attend the club.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField name="clubId" control={form.control} render={({ field }) => <Input type="hidden" {...field} />} />

            <Button type="submit" className="w-full" disabled={isSubmitting || availableTimeSlots.length === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Enrolling..." : "Enroll Now"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
            Ensure your details are correct before submitting. Enrollment is subject to availability.
        </p>
      </CardFooter>
    </Card>
  );
}
