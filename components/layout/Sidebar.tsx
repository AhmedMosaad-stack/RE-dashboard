'use client';

import {
  CalendarCheck,
  DollarSign,
  LayoutDashboard,
  MapPin,
  Plane,
  Settings,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SidebarLink } from '@/components/layout/SidebarLink';
import { cn } from '@/lib/utils';

export const navLinks = [
  { href: '/dashboard/overview',     label: 'Overview',     icon: LayoutDashboard, iconColor: 'var(--pop-blue)'   },
  { href: '/dashboard/bookings',     label: 'Bookings',     icon: CalendarCheck,   iconColor: 'var(--pop-blue)'   },
  { href: '/dashboard/destinations', label: 'Destinations', icon: MapPin,          iconColor: 'var(--pop-teal)'   },
  { href: '/dashboard/customers',    label: 'Customers',    icon: Users,           iconColor: 'var(--pop-orange)' },
  { href: '/dashboard/revenue',      label: 'Revenue',      icon: DollarSign,      iconColor: 'var(--pop-green)'  },
];

export interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

interface SidebarProps {
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({ collapsed = false, className }: SidebarProps) {
  return (
    <aside
      className={cn('app-sidebar flex h-full flex-col', className)}
      style={{ background: 'var(--background-2)' }}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-5 py-5',
          collapsed && 'justify-center px-0',
        )}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded"
          style={{
            background: 'var(--primary)',
            border: '2px solid var(--border)',
            color: 'var(--text-on-primary)',
          }}
        >
          <Plane className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="sidebar-logo">RE Travel</span>
            <span className="text-xs" style={{ color: 'var(--ink-muted)', fontFamily: "'Cabin', sans-serif" }}>
              Admin
            </span>
          </div>
        )}
      </div>

      <Separator style={{ background: 'var(--border-secondary)' }} />

      <nav
        className={cn(
          'flex-1 space-y-1 py-3',
          collapsed ? 'px-2' : 'pl-0 pr-3',
        )}
      >
        {navLinks.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            iconColor={link.iconColor}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <Separator style={{ background: 'var(--border-secondary)' }} />

      <div
        className={cn('space-y-2 p-3', collapsed && 'px-2')}
        style={{ borderTop: '2px solid var(--border-secondary)', paddingTop: '12px' }}
      >
        <SidebarLink
          href="/dashboard/settings"
          label="Settings"
          icon={Settings}
          iconColor="var(--ink-muted)"
          collapsed={collapsed}
        />
        <div
          className={cn(
            'flex items-center gap-3 rounded px-3 py-2',
            collapsed && 'justify-center px-0',
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin User" />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span
                className="truncate text-sm"
                style={{ color: 'var(--ink)', fontFamily: "'Cabin', sans-serif", fontWeight: 700 }}
              >
                Admin User
              </span>
              <span
                className="truncate"
                style={{ color: 'var(--ink-faint)', fontFamily: "'Cabin', sans-serif", fontSize: '11px' }}
              >
                Super Admin
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
