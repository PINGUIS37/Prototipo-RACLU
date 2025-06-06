import { SignUpForm } from "@/components/student/SignUpForm";
import { fetchClubForSignup } from "@/lib/actions/student.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";

interface ClubSignUpPageProps {
  params: {
    clubId: string;
  };
}

export default async function ClubSignUpPage({ params }: ClubSignUpPageProps) {
  const club = await fetchClubForSignup(params.clubId);

  if (!club) {
    return (
      <div className="container mx-auto py-8">
        <PageTitle title="Club Not Found" icon={AlertTriangle} />
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The club you are trying to sign up for could not be found. It might have been removed or the link is incorrect.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <SignUpForm club={club} />
    </div>
  );
}
