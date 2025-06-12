"use client";
import { LoginForm } from "@/components/auth/LoginForm";
import { AppLogo } from "@/components/shared/AppLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Routes } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // If user is already logged in, redirect them away from login page
      if (user.role === 'student') router.replace(Routes.STUDENT_DASHBOARD);
      else if (user.role === 'admin') router.replace(Routes.ADMIN_DASHBOARD);
    }
  }, [user, isLoading, router]);

  if (isLoading || (!isLoading && user)) {
    // Show loading or nothing if redirecting
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p>Cargando...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="mb-8">
        <AppLogo size="large" />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">¡Bienvenido a RACLU!</CardTitle>
          <CardDescription>Un lugar donde los alumnos pueden inscribirse a los clubs de manera más sencilla.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Portal de Clubes Universitarios. Conecta, participa y crece.
      </p>
    </div>
  );
}
