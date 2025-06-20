"use client";
import type { Club } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Routes } from "@/lib/constants";
import { Edit, Trash2, Users, CalendarDays } from "lucide-react";
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
import { deleteClubAction } from "@/lib/actions/admin.actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminClubCardProps {
  club: Club;
}

export function AdminClubCard({ club }: AdminClubCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const totalEnrolled = club.timeSlots.reduce((sum, ts) => sum + ts.enrolledCount, 0);
  const totalCapacity = club.timeSlots.reduce((sum, ts) => sum + ts.capacity, 0);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteClubAction(club.id);
    setIsDeleting(false);
    if (result.success) {
      toast({ title: "Club Eliminado", description: result.message });
      // router.refresh(); // Or rely on revalidatePath from action
    } else {
      toast({ variant: "destructive", title: "Fallo al Eliminar", description: result.message });
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-headline">{club.name}</CardTitle>
        <CardDescription className="text-xs h-10 line-clamp-2">{club.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Users className="h-4 w-4 mr-2 shrink-0" />
          <span>{totalEnrolled} / {totalCapacity > 0 ? totalCapacity : 'N/D'} inscritos</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
          <span>{club.timeSlots.length} horario(s)</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el club
                "{club.name}" y todas sus inscripciones.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button asChild variant="outline" size="sm">
          <Link href={Routes.ADMIN_CLUBS_EDIT(club.id)}>
            <Edit className="h-4 w-4 mr-1" /> Editar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
