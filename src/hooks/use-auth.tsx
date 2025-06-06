"use client";

import type { User, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Routes } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, role: UserRole) => Promise<void>; // Simplified login
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app, this would come from your auth provider / database
const MOCK_USERS: Record<string, User> = {
  student123: { id: 'std1', username: 'student123', name: 'Juan Pérez', role: 'student', matricula: '12345', group: 'CS101' },
  adminuser: { id: 'adm1', username: 'adminuser', name: 'Ana López', role: 'admin' },
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Try to load user from localStorage on initial load
    try {
      const storedUser = localStorage.getItem('clubconnect_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Fallo al cargar usuario de localStorage", error);
      localStorage.removeItem('clubconnect_user');
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, role: UserRole) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let foundUser: User | undefined;
    if (role === 'student' && username === 'student123') { // Example student username
        foundUser = MOCK_USERS['student123'];
    } else if (role === 'admin' && username === 'adminuser') { // Example admin username
        foundUser = MOCK_USERS['adminuser'];
    }


    if (foundUser && foundUser.role === role) {
      setUser(foundUser);
      localStorage.setItem('clubconnect_user', JSON.stringify(foundUser));
      setIsLoading(false);
      if (foundUser.role === 'student') {
        router.push(Routes.STUDENT_DASHBOARD);
      } else if (foundUser.role === 'admin') {
        router.push(Routes.ADMIN_DASHBOARD);
      }
    } else {
      setIsLoading(false);
      throw new Error("Credenciales inválidas o rol no coincide");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clubconnect_user');
    router.push(Routes.LOGIN);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export function ProtectedRoute({ children, allowedRoles }: { children: ReactNode, allowedRoles: UserRole[] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(Routes.LOGIN);
    } else if (!isLoading && user && !allowedRoles.includes(user.role)) {
      // If role mismatch, redirect to their respective dashboard or login
      if (user.role === 'student') router.replace(Routes.STUDENT_DASHBOARD);
      else if (user.role === 'admin') router.replace(Routes.ADMIN_DASHBOARD);
      else router.replace(Routes.LOGIN);
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando...</p> {/* Or a spinner component */}
      </div>
    );
  }

  return <>{children}</>;
}
