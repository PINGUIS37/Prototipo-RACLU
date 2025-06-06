import type { Club } from "@/lib/types";
import { AdminClubCard } from "./AdminClubCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListCollapse } from "lucide-react";

interface AdminClubListProps {
  clubs: Club[];
}

export function AdminClubList({ clubs }: AdminClubListProps) {
  if (!clubs || clubs.length === 0) {
    return (
      <Alert>
        <ListCollapse className="h-4 w-4" />
        <AlertTitle>No Clubs Found</AlertTitle>
        <AlertDescription>
          There are no clubs created yet. Click "Add New Club" to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clubs.map((club) => (
        <AdminClubCard key={club.id} club={club} />
      ))}
    </div>
  );
}
