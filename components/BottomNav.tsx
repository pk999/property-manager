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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 py-2 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? 'text-blue-600 bg-blue-50 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span className="text-xs mt-1 font-semibold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
