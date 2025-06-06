"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppLogo } from "./AppLogo";
import { useAuth } from "@/hooks/use-auth";
import { Routes } from "@/lib/constants";
import { Home, Users, ShieldCheck, LogOut, ScrollText, UserPlus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: ('student' | 'admin')[];
}

const navItems: NavItem[] = [
  { href: Routes.STUDENT_DASHBOARD, label: "Clubs", icon: Home, roles: ['student'] },
  // Student sign up is usually part of club interaction, not a direct nav link.
  // { href: Routes.STUDENT_SIGNUP_BASE, label: "Sign Up", icon: UserPlus, roles: ['student'] }, // Example if needed
  { href: Routes.ADMIN_DASHBOARD, label: "Overview", icon: ShieldCheck, roles: ['admin'] },
  { href: Routes.ADMIN_CLUBS, label: "Manage Clubs", icon: Settings, roles: ['admin'] },
  { href: Routes.ADMIN_ENROLLMENTS, label: "Enrollments", icon: ScrollText, roles: ['admin'] },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) {
    return null; // Or a minimal public navbar if needed
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    // router.push(Routes.LOGIN); // logout() in useAuth already handles this
  };

  return (
    <nav className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <AppLogo size="small" />
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="inline-block h-4 w-4 mr-1.5 mb-0.5" />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-3 hidden sm:inline">
              Hi, {user.name} ({user.role})
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Nav (Optional - for simplicity, keeping it desktop focused based on current ShadCN sidebar complexitites) */}
    </nav>
  );
}
