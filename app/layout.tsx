import type { Metadata } from 'next';
import { DM_Sans, Righteous, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProviderWrapper } from '@/components/shared/ThemeProviderWrapper';
import { QueryProvider } from '@/components/shared/QueryProvider';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
});

const righteous = Righteous({
  variable: '--font-righteous',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'RE Travel — Admin Dashboard',
  description: 'Admin dashboard for RE Travel tourism company.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${righteous.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full">
        <ThemeProviderWrapper>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProviderWrapper>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={3000}
        />
      </body>
    </html>
  );
}
