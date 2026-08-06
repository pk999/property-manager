'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, User } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Landlord } from '@/lib/types/database';

export default function Header() {
  const [landlord, setLandlord] = useState<Landlord | null>(null);

  useEffect(() => {
    setLandlord(dataService.getLandlord());
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">PropertyManager</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Sirisha Amma's Commercial Complex</p>
          </div>
        </div>

        {/* Profile Badge */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-full py-1.5 px-3.5">
            <User className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold text-slate-800">
              {landlord?.full_name?.split(' ')[0] || 'Landlord'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
