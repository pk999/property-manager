'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, User, Globe, CheckCircle2 } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Landlord } from '@/lib/types/database';

export default function Header() {
  const [landlord, setLandlord] = useState<Landlord | null>(null);

  useEffect(() => {
    setLandlord(dataService.getLandlord());
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Building2 className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-lg font-black tracking-tight text-white">PropertyManager</h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Rental & Ledger SaaS</p>
          </div>
        </div>

        {/* Profile & Security Badge */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RLS Active</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-full py-1 px-3">
            <User className="w-4 h-4 text-slate-300" />
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
              {landlord?.full_name?.split(' ')[0] || 'Landlord'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
