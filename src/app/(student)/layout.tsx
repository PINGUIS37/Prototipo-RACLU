"use client";
import { Navbar } from "@/components/shared/Navbar";
import { ProtectedRoute } from "@/hooks/use-auth";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="py-4 text-center text-sm text-muted-foreground border-t">
          © {new Date().getFullYear()} ClubConecta. Todos los derechos reservados.
        </footer>
      </div>
    </ProtectedRoute>
  );
}
