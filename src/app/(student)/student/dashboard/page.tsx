import { StudentClubList } from "@/components/student/StudentClubList";
import { getClubs } from "@/lib/data";
import { PageTitle } from "@/components/shared/PageTitle";
import { LayoutGrid } from "lucide-react";

export default async function StudentDashboardPage() {
  const clubs = await getClubs();

  return (
    <div>
      <PageTitle title="Catálogo de Clubes" icon={LayoutGrid} />
      <p className="mb-6 text-muted-foreground">
        Explora los clubes disponibles e inscríbete en los que te interesen. Haz clic en un club para ver más detalles e inscribirte.
      </p>
      <StudentClubList clubs={clubs} />
    </div>
  );
}

// Revalidate data every 60 seconds, or use on-demand revalidation after admin actions
export const revalidate = 60;
