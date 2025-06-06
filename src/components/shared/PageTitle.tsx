import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface PageTitleProps {
  title: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function PageTitle({ title, icon: Icon, actions }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-7 w-7 text-primary" />}
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
