import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FloatingCalendarButton } from '@/components/calendar/FloatingCalendarButton';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      <aside className="fixed inset-y-0 left-0 z-20 hidden md:flex lg:hidden">
        <Sidebar collapsed className="w-16" />
      </aside>
      <aside className="fixed inset-y-0 left-0 z-20 hidden lg:flex">
        <Sidebar className="w-60" />
      </aside>

      <div className="flex w-full min-w-0 flex-col md:pl-16 lg:pl-60">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>

      <FloatingCalendarButton />
    </div>
  );
}
