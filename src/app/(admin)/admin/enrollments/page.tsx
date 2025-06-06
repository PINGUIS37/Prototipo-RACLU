import { EnrollmentTable } from "@/components/admin/EnrollmentTable";
import { PageTitle } from "@/components/shared/PageTitle";
import { getClubs, getEnrollments } from "@/lib/data";
import { ScrollText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";


// Server component to handle filtering
async function FilterableEnrollmentList({ clubId }: { clubId?: string }) {
  const enrollments = await getEnrollments(clubId);
  return <EnrollmentTable enrollments={enrollments} />;
}


// Server component for club filter select
async function ClubFilter({ currentClubId }: { currentClubId?: string }) {
  const clubs = await getClubs();
  return (
    <div className="mb-4 max-w-xs">
      <Select defaultValue={currentClubId || "all"}>
        <SelectTrigger id="club-filter">
          <SelectValue placeholder="Filter by club..." />
        </SelectTrigger>
        <SelectContent>
          <Link href="/admin/enrollments" passHref>
            <SelectItem value="all">All Clubs</SelectItem>
          </Link>
          {clubs.map(club => (
            <Link href={`?clubId=${club.id}`} key={club.id} passHref>
                <SelectItem value={club.id}>{club.name}</SelectItem>
            </Link>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


export default async function AdminEnrollmentsPage({
  searchParams
}: {
  searchParams?: { clubId?: string };
}) {
  const clubId = searchParams?.clubId;

  return (
    <div>
      <PageTitle title="Club Enrollments" icon={ScrollText} />
       <p className="mb-6 text-muted-foreground">
        View and manage student enrollments for all clubs. You can filter by a specific club.
      </p>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
            <h3 className="text-md font-medium">Filter Enrollments</h3>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p>Loading filters...</p>}>
             {/* @ts-expect-error Server Component */}
            <ClubFilter currentClubId={clubId} />
          </Suspense>
        </CardContent>
      </Card>
      
      <Suspense fallback={<p className="text-center py-8">Loading enrollments...</p>}>
         {/* @ts-expect-error Server Component */}
        <FilterableEnrollmentList clubId={clubId} />
      </Suspense>
    </div>
  );
}

export const revalidate = 0; // Ensure data is fresh, or use on-demand revalidation
