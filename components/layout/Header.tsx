'use client';

import { Bell, LogOut, Menu, User as UserIcon, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Sidebar, navLinks } from '@/components/layout/Sidebar';

function pageTitleFromPath(pathname: string): string {
  const link = navLinks.find(
    (l) => pathname === l.href || pathname.startsWith(`${l.href}/`)
  );
  return link ? link.label : 'Dashboard';
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitleFromPath(pathname);

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-4 md:px-6"
      style={{
        background: 'var(--background)',
        borderBottom: '3px solid var(--ink)',
        borderRadius: 0,
      }}
    >
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h2
          className="font-marker"
          style={{ color: 'var(--ink)', fontSize: '1.8rem' }}
        >
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User menu">
              <Avatar className="h-7 w-7">
                <AvatarImage
                  src="https://i.pravatar.cc/150?u=admin"
                  alt="Admin User"
                />
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Admin User</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/settings')}>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/')}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
