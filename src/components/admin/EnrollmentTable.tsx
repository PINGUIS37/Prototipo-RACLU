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
import { es } from 'date-fns/locale';

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
      toast({ title: "Inscripción Eliminada", description: result.message });
      // Data will be revalidated by action
    } else {
      toast({ variant: "destructive", title: "Fallo al Eliminar", description: result.message });
    }
  };

  if (!enrollments || enrollments.length === 0) {
    return <p className="text-muted-foreground">No se encontraron inscripciones.</p>;
  }

  return (
    <div className="rounded-md border shadow-sm">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matrícula Estudiante</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Grupo</TableHead>
          <TableHead>Club</TableHead>
          <TableHead>Horario</TableHead>
          <TableHead>Inscrito en</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => (
          <TableRow key={enrollment.id}>
            <TableCell>{enrollment.studentMatricula}</TableCell>
            <TableCell>{enrollment.studentFirstName} {enrollment.studentLastName}</TableCell>
            <TableCell>{enrollment.studentGroup}</TableCell>
            <TableCell>{enrollment.clubName || 'N/D'}</TableCell>
            <TableCell>{enrollment.dayOfWeek || 'N/D'}, {enrollment.timeRange || 'N/D'}</TableCell>
            <TableCell>{format(new Date(enrollment.enrolledAt), "MMM dd, yyyy HH:mm", { locale: es })}</TableCell>
            <TableCell className="text-right">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting === enrollment.id}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará al estudiante {enrollment.studentFirstName} {enrollment.studentLastName} de {enrollment.clubName}. Esto no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting === enrollment.id}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(enrollment.id, enrollment.clubId)} disabled={isDeleting === enrollment.id}>
                      {isDeleting === enrollment.id ? "Eliminando..." : "Confirmar Eliminación"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
       {enrollments.length > 5 && <TableCaption>Una lista de todas las inscripciones de estudiantes.</TableCaption>}
    </Table>
    </div>
  );
}
