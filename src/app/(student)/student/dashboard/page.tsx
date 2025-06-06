import { StudentClubList } from "@/components/student/StudentClubList";
import { getClubs } from "@/lib/data";
import { PageTitle } from "@/components/shared/PageTitle";
import { LayoutGrid } from "lucide-react";

export default async function StudentDashboardPage() {
  const clubs = await getClubs();

  return (
    <div>
      <PageTitle title="Club Catalog" icon={LayoutGrid} />
      <p className="mb-6 text-muted-foreground">
        Browse available clubs and sign up for the ones that interest you. Click on a club to see more details and enroll.
      </p>
      <StudentClubList clubs={clubs} />
    </div>
  );
}

// Revalidate data every 60 seconds, or use on-demand revalidation after admin actions
export const revalidate = 60;
