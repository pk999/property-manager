import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PwaInstallBanner from '@/components/PwaInstallBanner';

export const metadata: Metadata = {
  title: 'PropertyManager - Commercial Property & Rent Ledger Engine',
  description: 'Bank-grade commercial rental property & rent ledger management software for Indian landlords',
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
      <body className="antialiased text-slate-900 min-h-screen selection:bg-blue-600 selection:text-white">
        <Header />
        <main className="w-full max-w-xl mx-auto min-h-[calc(100vh-8rem)] p-4 sm:p-6 transition-all">
          <PwaInstallBanner />
          {children}
        </main>
        <BottomNav />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
