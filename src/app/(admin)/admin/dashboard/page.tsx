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
      <PageTitle title="Admin Dashboard" icon={ShieldCheck} />
      <p className="mb-6 text-muted-foreground">
        Welcome to the Club Administration Panel. Manage clubs, view enrollments, and oversee university club activities.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClubs}</div>
            <p className="text-xs text-muted-foreground">Currently active clubs</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">Across all clubs</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Enrollment/Club</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEnrollmentPerClub}</div>
            <p className="text-xs text-muted-foreground">Average members per club</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary"/>Club Management</CardTitle>
            <CardDescription>Add, edit, or remove university clubs. Update their descriptions, schedules, and capacities.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={Routes.ADMIN_CLUBS}>Manage Clubs <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-primary"/>Enrollment Overview</CardTitle>
            <CardDescription>View detailed lists of students enrolled in each club. Monitor registration trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={Routes.ADMIN_ENROLLMENTS}>View Enrollments <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
