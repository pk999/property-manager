'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  IndianRupee, 
  Store,
  X
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Tenant } from '@/lib/types/database';

export default function LeasePage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationPercent, setEscalationPercent] = useState<number>(10);

  useEffect(() => {
    setTenants(dataService.getTenants());
  }, []);

  const handleApplyEscalation = () => {
    if (!selectedTenant) return;
    const newRent = Math.round(selectedTenant.base_rent * (1 + escalationPercent / 100));
    const updated = dataService.updateTenant(selectedTenant.id, { base_rent: newRent });
    setTenants(tenants.map(t => t.id === selectedTenant.id ? updated : t));
    setShowEscalationModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" /> Lease & Notice Manager
        </h2>
        <p className="text-sm text-slate-500 font-medium">Agreement expirations, notice period trackers & annual rent escalations</p>
      </div>

      {/* Expiry Warning Summary Banner */}
      <div className="glass-card rounded-3xl p-5 border border-amber-200 bg-amber-50/50 space-y-2 shadow-sm">
        <div className="flex items-center space-x-2 text-amber-800 font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Lease Expiry Warning Alert</span>
        </div>
        <p className="text-sm text-amber-900 leading-relaxed font-medium">
          <strong>Bhagya (Shop 1)</strong> lease expires on <strong>31st August 2026</strong>. 2-month renewal notice active.
        </p>
      </div>

      {/* Tenant Lease Cards */}
      <div className="space-y-4">
        {tenants.map((t) => {
          const isNotice = t.status === 'notice_given';
          const isExpiringSoon = t.unit_no === 'Shop 1';

          return (
            <div key={t.id} className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {t.unit_no}
                    </span>

                    {isExpiringSoon && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Expiring Soon
                      </span>
                    )}

                    {isNotice && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        Notice Given
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1">{t.full_name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold block">Current Rent</span>
                  <span className="text-xl font-black text-slate-900 flex items-center justify-end">
                    <IndianRupee className="w-5 h-5" /> {t.base_rent.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Lease Dates */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                <div>
                  <span className="text-slate-400 block">Lease Start:</span>
                  <span className="font-bold text-slate-800">{t.lease_start_date}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">Lease Expiry:</span>
                  <span className="font-bold text-slate-800">{t.lease_end_date}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedTenant(t);
                    setShowEscalationModal(true);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Annual Escalation (+5%, +10%)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Escalation Calculator Modal */}
      {showEscalationModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Rent Escalation Calculator</h3>
              <button onClick={() => setShowEscalationModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-slate-600 font-medium">
                Calculate annual rent increase for <strong>{selectedTenant.full_name}</strong> ({selectedTenant.unit_no}).
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Rent: ₹{selectedTenant.base_rent}</label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setEscalationPercent(pct)}
                      className={`py-2.5 rounded-xl font-bold border text-sm ${
                        escalationPercent === pct
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
                <span className="text-xs text-blue-700 font-bold uppercase tracking-wider block">New Revised Rent</span>
                <span className="text-2xl font-black text-blue-900">
                  ₹{Math.round(selectedTenant.base_rent * (1 + escalationPercent / 100)).toLocaleString('en-IN')} / mo
                </span>
              </div>

              <button
                onClick={handleApplyEscalation}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md mt-2"
              >
                Apply Revised Rent to Lease
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
