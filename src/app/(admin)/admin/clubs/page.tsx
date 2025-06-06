import { AdminClubList } from "@/components/admin/AdminClubList";
import { PageTitle } from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { getClubs } from "@/lib/data";
import Link from "next/link";
import { Routes } from "@/lib/constants";
import { PlusCircle, Settings } from "lucide-react";

export default async function AdminClubsPage() {
  const clubs = await getClubs();

  return (
    <div>
      <PageTitle 
        title="Manage Clubs" 
        icon={Settings}
        actions={
          <Button asChild>
            <Link href={Routes.ADMIN_CLUBS_NEW}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Club
            </Link>
          </Button>
        }
      />
      <p className="mb-6 text-muted-foreground">
        Here you can create new clubs, edit existing ones, or remove them. 
        Changes will be reflected immediately for students.
      </p>
      <AdminClubList clubs={clubs} />
    </div>
  );
}

export const revalidate = 0; // Ensure data is fresh, or use on-demand revalidation
