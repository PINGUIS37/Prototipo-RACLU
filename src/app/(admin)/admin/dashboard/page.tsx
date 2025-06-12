import { PageTitle } from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Routes } from "@/lib/constants";
import { getClubs, getEnrollments } from "@/lib/data";
import { ShieldCheck, Users, Settings, ScrollText, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const clubs = await getClubs();
  const enrollments = await getEnrollments(); // Get all enrollments

  const totalClubs = clubs.length;
  const totalEnrollments = enrollments.length;
  const averageEnrollmentPerClub = totalClubs > 0 ? (totalEnrollments / totalClubs).toFixed(1) : 0;

  return (
    <div>
      <PageTitle title="Panel de Administración" icon={ShieldCheck} />
      <p className="mb-6 text-muted-foreground">
        Bienvenido al Panel de Administración de Clubes.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div></div>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-large">Clubes Totales</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClubs}</div>
            <p className="text-xs text-muted-foreground">Clubes actualmente activos</p>
          </CardContent>
        </Card>
        <div></div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary"/>Gestión de Clubes</CardTitle>
            <CardDescription>Añade, edita o elimina clubes universitarios. Actualiza sus descripciones, horarios y capacidades.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={Routes.ADMIN_CLUBS}>Gestionar Clubes <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-primary"/>Resumen de Inscripciones</CardTitle>
            <CardDescription>Visualiza listas detalladas de estudiantes inscritos en cada club. Monitorea las tendencias de inscripción.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={Routes.ADMIN_ENROLLMENTS}>Ver Inscripciones <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
