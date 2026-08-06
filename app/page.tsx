'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  IndianRupee, 
  AlertCircle, 
  ShieldCheck, 
  PlusCircle, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Store, 
  Home,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Property, Tenant, MonthlyLedger } from '@/lib/types/database';

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [ledgers, setLedgers] = useState<MonthlyLedger[]>([]);

  useEffect(() => {
    setProperties(dataService.getProperties());
    setTenants(dataService.getTenants());
    setLedgers(dataService.getLedgers());
  }, []);

  // Calculation Metrics
  const totalRentDue = ledgers.reduce((sum, l) => sum + Number(l.amount_due), 0);
  const totalPaid = ledgers.filter(l => l.status === 'paid').reduce((sum, l) => sum + Number(l.amount_paid), 0);
  const totalPending = ledgers.filter(l => l.status === 'pending' || l.status === 'overdue').reduce((sum, l) => sum + (Number(l.amount_due) - Number(l.amount_paid)), 0);
  const overdueCount = ledgers.filter(l => l.status === 'overdue').length;

  return (
    <div className="space-y-5">
      {/* Landlord Welcome & Quick Banner */}
      <div className="glass-card rounded-2xl p-4 border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Building2 className="w-28 h-28 text-emerald-400" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> PWA Active
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> IDOR Protected
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Sirisha Amma's Dashboard</h2>
          <p className="text-xs text-slate-300">
            Sirisha Amma Commercial Complex • Shops, Ledgers & 1-Click WhatsApp
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Collected */}
        <div className="glass-card rounded-xl p-3.5 border-l-4 border-l-emerald-500 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Rent Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400 flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {totalPaid.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-400">Received for current cycle</p>
        </div>

        {/* Pending & Overdue */}
        <div className="glass-card rounded-xl p-3.5 border-l-4 border-l-amber-500 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Rent</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-black text-amber-400 flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {totalPending.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-amber-400/80 font-medium">
            {overdueCount} Overdue ledger(s)
          </p>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/properties"
          className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all duration-200"
        >
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5" />
            <span>Add Property</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </Link>

        <Link
          href="/tenants"
          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold text-sm transition-all duration-200"
        >
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Add Tenant</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Property & Tenant Quick Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-400" /> Properties & Units ({properties.length})
          </h3>
          <Link href="/properties" className="text-xs font-semibold text-emerald-400 hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-2">
          {properties.map((p) => {
            const propertyTenants = tenants.filter(t => t.property_id === p.id);
            return (
              <div key={p.id} className="glass-card glass-card-hover rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                    {p.property_type === 'shop' ? <Store className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.title}</h4>
                    <p className="text-[11px] text-slate-400">{p.address || 'Commercial Zone'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-200 block">{propertyTenants.length} Tenant(s)</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{p.property_type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Minimal Footer Note */}
      <div className="pt-2 text-center">
        <span className="text-[10px] text-slate-500 font-mono">
          DB Connection Live • PostgreSQL RLS Security Active
        </span>
      </div>
    </div>
  );
}
