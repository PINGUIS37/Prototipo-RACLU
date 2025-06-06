import { ClubForm } from "@/components/admin/ClubForm";
import { PageTitle } from "@/components/shared/PageTitle";
import { PlusCircle } from "lucide-react";

export default function NewClubPage() {
  return (
    <div>
      <PageTitle title="Create New Club" icon={PlusCircle} />
      <ClubForm />
    </div>
  );
}
