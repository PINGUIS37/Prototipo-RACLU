import type { Club } from "@/lib/types";
import { StudentClubCard } from "./StudentClubCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListCollapse } from "lucide-react";

interface StudentClubListProps {
  clubs: Club[];
}

export function StudentClubList({ clubs }: StudentClubListProps) {
  if (!clubs || clubs.length === 0) {
    return (
      <Alert className="mt-8">
        <ListCollapse className="h-4 w-4" />
        <AlertTitle>No Clubs Available</AlertTitle>
        <AlertDescription>
          There are currently no clubs open for registration. Please check back later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clubs.map((club) => (
        <StudentClubCard key={club.id} club={club} />
      ))}
    </div>
  );
}
