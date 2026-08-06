'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  IndianRupee, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  Building2, 
  ChevronRight,
  Calculator,
  UserCheck
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Tenant, Property } from '@/lib/types/database';

export default function LeasePage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [renewingTenant, setRenewingTenant] = useState<Tenant | null>(null);
  const [escalationPercent, setEscalationPercent] = useState<number>(10); // Default +10% rent revision
  const [newRent, setNewRent] = useState<number>(0);
  const [newLeaseEndDate, setNewLeaseEndDate] = useState<string>('2027-08-31');

  useEffect(() => {
    const fetchedTenants = dataService.getTenants();
    const fetchedProps = dataService.getProperties();
    setTenants(fetchedTenants);
    setProperties(fetchedProps);
  }, []);

  const handleOpenRenewModal = (tenant: Tenant) => {
    setRenewingTenant(tenant);
    const revised = Math.round(tenant.base_rent * 1.10);
    setNewRent(revised);
  };

  const handlePercentChange = (percent: number) => {
    setEscalationPercent(percent);
    if (renewingTenant) {
      const revised = Math.round(renewingTenant.base_rent * (1 + percent / 100));
      setNewRent(revised);
    }
  };

  const handleConfirmRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingTenant) return;

    const today = new Date().toISOString().split('T')[0];
    const updated = dataService.updateTenant(renewingTenant.id, {
      base_rent: newRent,
      lease_start_date: today,
      lease_end_date: newLeaseEndDate,
      status: 'active',
    });

    setTenants(tenants.map(t => t.id === updated.id ? updated : t));
    setRenewingTenant(null);
  };

  // Helper calculations
  const todayDate = new Date('2026-08-06');
  
  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const diffTime = end.getTime() - todayDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const expiringSoonTenants = tenants.filter(t => {
    const days = getDaysRemaining(t.lease_end_date);
    return days <= 60 && days >= 0;
  });

  const noticeTenants = tenants.filter(t => t.status === 'notice_given');

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
          <FileText className="w-5 h-5 text-indigo-400" /> Lease & Notice Period Tracker
        </h2>
        <p className="text-xs text-slate-400">60-Day lease expiry warnings, 2-month notice status & rent revisions</p>
      </div>

      {/* 60-Day Expiry Warnings Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> 60-Day Expiry Warnings ({expiringSoonTenants.length})
          </h3>
        </div>

        {expiringSoonTenants.map((t) => {
          const daysLeft = getDaysRemaining(t.lease_end_date);
          const prop = properties.find(p => p.id === t.property_id);

          return (
            <div key={t.id} className="glass-card rounded-xl p-4 border border-amber-500/30 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">{t.full_name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {daysLeft} Days Left
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.unit_no} • {prop?.title || 'Commercial Shop'}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400 block">₹{t.base_rent}/mo</span>
                  <span className="text-[10px] text-slate-400">Ends {t.lease_end_date}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Notice Period: {t.notice_period_months} Months</span>
                
                <button
                  onClick={() => handleOpenRenewModal(t)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renew & Escalated Rent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active 2-Month Notice Period Tracker */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" /> Active 2-Month Notice Periods ({noticeTenants.length})
          </h3>
        </div>

        {noticeTenants.map((t) => {
          const prop = properties.find(p => p.id === t.property_id);
          return (
            <div key={t.id} className="glass-card rounded-xl p-4 border border-indigo-500/30 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{t.full_name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.unit_no} • {prop?.title}</p>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Notice Active
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Notice Given Date:</span>
                  <strong className="text-white">{t.notice_given_date || '2026-07-15'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Vacating Date (2-Mo):</span>
                  <strong className="text-amber-300">2026-09-15</strong>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-1">
                  <span>Security Deposit Refund:</span>
                  <strong className="text-emerald-400">₹{(t.base_rent * 2).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rent Escalation & Lease Renewal Modal */}
      {renewingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-base font-bold text-white">Lease Renewal & Escalation</h3>
                <p className="text-xs text-slate-400">{renewingTenant.full_name} ({renewingTenant.unit_no})</p>
              </div>
              <Calculator className="w-5 h-5 text-indigo-400" />
            </div>

            <form onSubmit={handleConfirmRenewal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Current Base Rent</label>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold">
                  ₹{renewingTenant.base_rent.toLocaleString('en-IN')}/month
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Annual Rent Escalation Rate</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => handlePercentChange(pct)}
                      className={`py-2 rounded-xl font-bold transition-all ${
                        escalationPercent === pct
                          ? 'bg-indigo-600 text-white border border-indigo-400'
                          : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">New Escalated Rent (₹)</label>
                <input
                  type="number"
                  value={newRent}
                  onChange={(e) => setNewRent(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-black text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">New Lease Expiry Date</label>
                <input
                  type="date"
                  value={newLeaseEndDate}
                  onChange={(e) => setNewLeaseEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenewingTenant(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Confirm 1-Yr Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
