"use client"; // For using useRouter

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'student') {
          router.replace(Routes.STUDENT_DASHBOARD);
        } else if (user.role === 'admin') {
          router.replace(Routes.ADMIN_DASHBOARD);
        } else {
          router.replace(Routes.LOGIN);
        }
      } else {
        router.replace(Routes.LOGIN);
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Cargando ClubConecta...</p> {/* Or a branded loading spinner */}
    </div>
  );
}
