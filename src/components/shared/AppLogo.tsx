import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { APP_NAME, Routes } from '@/lib/constants';

export function AppLogo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const textSizeClass = size === 'small' ? 'text-xl' : size === 'large' ? 'text-3xl' : 'text-2xl';
  const iconSize = size === 'small' ? 5 : size === 'large' ? 8 : 6;

  return (
    <Link href={Routes.HOME} className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
      <Building2 className={`h-${iconSize} w-${iconSize}`} />
      <span className={`font-bold ${textSizeClass} font-headline`}>{APP_NAME}</span>
    </Link>
  );
}
