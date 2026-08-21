'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, MessageCircle } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Tenants & Ledgers', href: '/tenants', icon: Users },
    { label: 'WhatsApp Engine', href: '/reminders', icon: MessageCircle },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 pt-2 shadow-lg"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="w-full max-w-xl mx-auto flex items-center justify-around min-h-[52px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 min-h-[48px] min-w-[90px] ${
                isActive
                  ? 'text-blue-700 bg-blue-50 font-bold scale-105'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-blue-700' : 'text-slate-600'}`} />
              <span className="text-xs mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
