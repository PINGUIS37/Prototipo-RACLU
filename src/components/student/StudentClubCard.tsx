import type { Club, TimeSlot } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Routes } from "@/lib/constants";
import { CalendarDays, Clock, Users, BarChart, Puzzle, Mic, Paintbrush, Code, ArrowRight, AlertCircle } from "lucide-react";
import Image from "next/image";

// Helper to map categoryIcon string to actual Lucide icon component
const IconMap: { [key: string]: React.ElementType } = {
  Puzzle,
  Mic,
  Paintbrush,
  Code,
  Users, // Default/fallback
  BarChart, // For business/stats clubs
  // Add more as needed
};

interface StudentClubCardProps {
  club: Club;
}

function formatTimeSlots(timeSlots: TimeSlot[]): string {
  if (!timeSlots || timeSlots.length === 0) return "No schedule available.";
  // Show first 1-2 slots or a summary
  const summary = timeSlots.slice(0, 2).map(ts => `${ts.dayOfWeek.substring(0,3)} ${ts.startTime}-${ts.endTime}`).join(', ');
  return timeSlots.length > 2 ? `${summary}, ...` : summary;
}

function getTotalCapacity(timeSlots: TimeSlot[]): number {
  return timeSlots.reduce((sum, ts) => sum + ts.capacity, 0);
}

function getTotalEnrolled(timeSlots: TimeSlot[]): number {
  return timeSlots.reduce((sum, ts) => sum + ts.enrolledCount, 0);
}

export function StudentClubCard({ club }: StudentClubCardProps) {
  const ClubIcon = IconMap[club.categoryIcon || 'Users'] || Users;
  const totalCapacity = getTotalCapacity(club.timeSlots);
  const totalEnrolled = getTotalEnrolled(club.timeSlots);
  const isFull = totalEnrolled >= totalCapacity && totalCapacity > 0;
  const hasAvailableSlots = club.timeSlots.some(ts => ts.enrolledCount < ts.capacity);

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
            <ClubIcon className="h-6 w-6 text-primary" />
            {club.name}
          </CardTitle>
          {/* Placeholder for a small image or badge if desired */}
          {/* <Image src={`https://placehold.co/60x60.png?text=${club.name.charAt(0)}`} alt={club.name} width={40} height={40} className="rounded-md" /> */}
        </div>
        <CardDescription className="text-sm h-16 line-clamp-3 mt-1">{club.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-0 pb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
          <span>{formatTimeSlots(club.timeSlots)}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2 shrink-0" />
          <span>{totalEnrolled} / {totalCapacity > 0 ? totalCapacity : 'N/A'} members</span>
        </div>
      </CardContent>
      <CardFooter>
        {hasAvailableSlots ? (
          <Button asChild className="w-full" variant="default">
            <Link href={Routes.STUDENT_SIGNUP(club.id)}>
              Sign Up <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            <AlertCircle className="mr-2 h-4 w-4" />
            Currently Full
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
