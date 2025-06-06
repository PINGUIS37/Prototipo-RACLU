import { ClubForm } from "@/components/admin/ClubForm";
import { PageTitle } from "@/components/shared/PageTitle";
import { fetchClubForEditing } from "@/lib/actions/admin.actions";
import { AlertTriangle, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditClubPageProps {
  params: {
    id: string;
  };
}

export default async function EditClubPage({ params }: EditClubPageProps) {
  const club = await fetchClubForEditing(params.id);

  if (!club) {
    return (
      <div>
        <PageTitle title="Club No Encontrado" icon={AlertTriangle} />
        <Card>
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent><p>El club que intentas editar no pudo ser encontrado.</p></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title={`Editar Club: ${club.name}`} icon={Edit} />
      <ClubForm club={club} />
    </div>
  );
}
