import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'PropertyManager - Rental & Ledger SaaS PWA',
  description: 'Zero-cost rental property & ledger management PWA for Indian landlords',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PropertyManager',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased bg-[#f5f5f7] text-slate-900 min-h-screen selection:bg-blue-500 selection:text-white">
        <Header />
        <main className="max-w-lg mx-auto min-h-[calc(100vh-8rem)] p-4 sm:p-5">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
