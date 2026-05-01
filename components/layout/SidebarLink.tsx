'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  iconColor?: string;
}

export function SidebarLink({
  href,
  label,
  icon: Icon,
  collapsed,
  iconColor,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch={false}
      title={collapsed ? label : undefined}
      data-active={isActive}
      data-collapsed={collapsed ? 'true' : 'false'}
      className={cn('sidebar-link', isActive && 'hand-border')}
    >
      <Icon
        className="h-4 w-4 shrink-0"
        style={{ color: iconColor ?? 'var(--ink-muted)' }}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
