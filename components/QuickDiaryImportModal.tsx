'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, X, CheckCircle2, Zap } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { QuotaExceededError } from '@/lib/services/data-service';

interface QuickDiaryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onQuotaExceeded: (reason: string) => void;
}

export default function QuickDiaryImportModal({
  isOpen,
  onClose,
  onSuccess,
  onQuotaExceeded,
}: QuickDiaryImportModalProps) {
  const [shopName, setShopName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [phone, setPhone] = useState('');
  const [rent, setRent] = useState('');

  if (!isOpen) return null;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !tenantName || !phone || !rent) return;

    try {
      // 1. Get or create default property
      const properties = dataService.getProperties(true);
      let targetProperty = properties[0];

      if (!targetProperty) {
        targetProperty = dataService.addProperty({
          title: 'Commercial Complex',
          property_type: 'shop',
          address: 'Main Market Road',
        });
      }

      // 2. Add Tenant
      dataService.addTenant({
        property_id: targetProperty.id,
        full_name: tenantName,
        phone_number: phone,
        unit_no: shopName,
        base_rent: Number(rent),
        due_day: 1,
        grace_period_days: 10,
        lease_start_date: '2026-08-01',
        lease_end_date: '2027-07-31',
        notice_period_months: 2,
        status: 'active',
      });

      // Clear & Close
      setShopName('');
      setTenantName('');
      setPhone('');
      setRent('');
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err instanceof QuotaExceededError) {
        onQuotaExceeded(err.message);
        onClose();
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-900">
      <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">10-Sec Quick Add</h3>
              <p className="text-xs text-slate-500 font-semibold">Continuous paper-diary style import</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleQuickAdd} className="space-y-3.5 text-sm">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Shop / Unit Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Shop 5 (Sonu Electronics)"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Tenant Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Mobile Number</label>
              <input
                type="text"
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Monthly Rent (₹)</label>
              <input
                type="number"
                required
                placeholder="15000"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md mt-2 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Zap className="w-5 h-5" />
            <span>Save & Onboard Shop (1 Tap)</span>
          </button>
        </form>
      </div>
    </div>
  );
}
