'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building, Users, BookOpenCheck, MessageCircle, FileText } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Properties', href: '/properties', icon: Building },
    { label: 'Tenants', href: '/tenants', icon: Users },
    { label: 'Ledgers', href: '/ledgers', icon: BookOpenCheck },
    { label: 'Lease', href: '/lease', icon: FileText },
    { label: 'Reminders', href: '/reminders', icon: MessageCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-200 min-w-[52px] ${
                isActive
                  ? 'text-emerald-400 bg-emerald-950/40 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[9px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
