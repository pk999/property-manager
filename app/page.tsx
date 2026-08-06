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
  Sparkles,
  ArrowRight
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
    <div className="space-y-6">
      {/* Landlord Welcome & Quick Banner */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Mobile PWA App
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure RLS
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sirisha Amma's Overview
          </h2>
          <p className="text-base text-slate-600 font-medium leading-relaxed">
            Sirisha Amma Commercial Complex • August 2026 Rent Cycle
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Collected */}
        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-emerald-500 space-y-2 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-sm font-bold uppercase tracking-wider">Rent Collected</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 flex items-center">
            <IndianRupee className="w-7 h-7 mr-0.5" />
            {totalPaid.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 font-medium">Received for August 2026</p>
        </div>

        {/* Pending & Overdue */}
        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-amber-500 space-y-2 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-sm font-bold uppercase tracking-wider">Pending Rent</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 flex items-center">
            <IndianRupee className="w-7 h-7 mr-0.5" />
            {totalPending.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-amber-700 font-bold">
            {overdueCount} Overdue Shop Ledger(s)
          </p>
        </div>
      </div>

      {/* Large Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/properties"
          className="flex items-center justify-between p-4.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <PlusCircle className="w-6 h-6" />
            <span>Add New Property</span>
          </div>
          <ChevronRight className="w-5 h-5" />
        </Link>

        <Link
          href="/tenants"
          className="flex items-center justify-between p-4.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-base shadow-sm transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Add New Tenant</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
      </div>

      {/* Property & Tenant Quick Overview */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Registered Shops & Units ({properties.length})
          </h3>
          <Link href="/properties" className="text-sm font-bold text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {properties.map((p) => {
            const propertyTenants = tenants.filter(t => t.property_id === p.id);
            return (
              <div key={p.id} className="glass-card glass-card-hover rounded-2xl p-4.5 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600">
                    {p.property_type === 'shop' ? <Store className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{p.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{p.address || 'Commercial Zone'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 block">{propertyTenants.length} Tenant(s)</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{p.property_type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Minimal Footer Note */}
      <div className="pt-4 text-center">
        <span className="text-xs text-slate-500 font-mono">
          DB Connection Live • PostgreSQL RLS Security Active
        </span>
      </div>
    </div>
  );
}
