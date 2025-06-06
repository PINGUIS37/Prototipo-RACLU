"use client";
import type { Enrollment } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { removeEnrollmentAction } from "@/lib/actions/admin.actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from 'date-fns';

interface EnrollmentTableProps {
  enrollments: (Enrollment & { clubName?: string, dayOfWeek?: string, timeRange?: string })[];
}

export function EnrollmentTable({ enrollments }: EnrollmentTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of enrollment being deleted

  const handleDelete = async (enrollmentId: string, clubId: string) => {
    setIsDeleting(enrollmentId);
    const result = await removeEnrollmentAction(enrollmentId, clubId);
    setIsDeleting(null);
    if (result.success) {
      toast({ title: "Enrollment Removed", description: result.message });
      // Data will be revalidated by action
    } else {
      toast({ variant: "destructive", title: "Removal Failed", description: result.message });
    }
  };

  if (!enrollments || enrollments.length === 0) {
    return <p className="text-muted-foreground">No enrollments found.</p>;
  }

  return (
    <div className="rounded-md border shadow-sm">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Club</TableHead>
          <TableHead>Slot</TableHead>
          <TableHead>Enrolled At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => (
          <TableRow key={enrollment.id}>
            <TableCell>{enrollment.studentMatricula}</TableCell>
            <TableCell>{enrollment.studentFirstName} {enrollment.studentLastName}</TableCell>
            <TableCell>{enrollment.studentGroup}</TableCell>
            <TableCell>{enrollment.clubName || 'N/A'}</TableCell>
            <TableCell>{enrollment.dayOfWeek || 'N/A'}, {enrollment.timeRange || 'N/A'}</TableCell>
            <TableCell>{format(new Date(enrollment.enrolledAt), "MMM dd, yyyy HH:mm")}</TableCell>
            <TableCell className="text-right">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting === enrollment.id}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will remove the student {enrollment.studentFirstName} {enrollment.studentLastName} from {enrollment.clubName}. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting === enrollment.id}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(enrollment.id, enrollment.clubId)} disabled={isDeleting === enrollment.id}>
                      {isDeleting === enrollment.id ? "Removing..." : "Confirm Removal"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
       {enrollments.length > 5 && <TableCaption>A list of all student enrollments.</TableCaption>}
    </Table>
    </div>
  );
}
