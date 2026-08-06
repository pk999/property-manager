'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  IndianRupee, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  Search, 
  Store, 
  Home, 
  Edit3, 
  Clock, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Property, Tenant } from '@/lib/types/database';
import { TenantSchema } from '@/lib/security/zod-schemas';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form State
  const [propertyId, setPropertyId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [unitNo, setUnitNo] = useState('');
  const [baseRent, setBaseRent] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [gracePeriodDays, setGracePeriodDays] = useState('10');
  const [leaseStartDate, setLeaseStartDate] = useState('2025-09-01');
  const [leaseEndDate, setLeaseEndDate] = useState('2026-08-31');
  const [noticePeriodMonths, setNoticePeriodMonths] = useState('2');
  const [error, setError] = useState('');

  useEffect(() => {
    setTenants(dataService.getTenants());
    const props = dataService.getProperties();
    setProperties(props);
    if (props.length > 0) setPropertyId(props[0].id);
  }, []);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const rentNum = Number(baseRent);
    const validation = TenantSchema.safeParse({
      property_id: propertyId,
      full_name: fullName,
      phone_number: phoneNumber,
      unit_no: unitNo,
      base_rent: rentNum,
      due_day: Number(dueDay),
      grace_period_days: Number(gracePeriodDays),
      lease_start_date: leaseStartDate,
      lease_end_date: leaseEndDate,
      notice_period_months: Number(noticePeriodMonths),
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      const newTenant = dataService.addTenant({
        property_id: propertyId,
        full_name: fullName,
        phone_number: phoneNumber,
        unit_no: unitNo,
        base_rent: rentNum,
        due_day: Number(dueDay),
        grace_period_days: Number(gracePeriodDays),
        lease_start_date: leaseStartDate,
        lease_end_date: leaseEndDate,
        notice_period_months: Number(noticePeriodMonths),
        status: 'active',
      });

      setTenants([newTenant, ...tenants]);
      setFullName('');
      setPhoneNumber('');
      setUnitNo('');
      setBaseRent('');
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.message || 'Error onboarding tenant');
    }
  };

  const handleToggleNotice = (tenant: Tenant) => {
    const newStatus = tenant.status === 'notice_given' ? 'active' : 'notice_given';
    const updated = dataService.updateTenant(tenant.id, {
      status: newStatus,
      notice_given_date: newStatus === 'notice_given' ? new Date().toISOString().split('T')[0] : undefined,
    });
    setTenants(tenants.map(t => t.id === updated.id ? updated : t));
    if (selectedTenant && selectedTenant.id === tenant.id) {
      setSelectedTenant(updated);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.unit_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header & Onboard Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
            <Users className="w-5 h-5 text-indigo-400" /> Tenant Management
          </h2>
          <p className="text-xs text-slate-400">Shops, rent due dates, grace periods & lease tracking</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search tenant name or shop unit no..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Grace Period Clarification Banner */}
      <div className="glass-card rounded-xl p-3 border border-amber-500/20 bg-amber-950/10 flex items-start space-x-2.5">
        <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-slate-300 leading-relaxed">
          <strong className="text-amber-300">Grace Period Rule</strong>: 1st of month rent is due by the 10th (e.g. Jan rent due by Feb 10th). WhatsApp reminders trigger automatically.
        </p>
      </div>

      {/* Tenant List */}
      <div className="space-y-3">
        {filteredTenants.map((t) => {
          const prop = properties.find((p) => p.id === t.property_id);
          const isNotice = t.status === 'notice_given';

          return (
            <div key={t.id} className="glass-card glass-card-hover rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">{t.full_name}</h3>
                    {isNotice && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        2-Mo Notice
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <strong className="text-slate-200">{t.unit_no}</strong> • <span>{prop?.title || 'Commercial Property'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 flex items-center justify-end">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {t.base_rent.toLocaleString('en-IN')}/mo
                  </span>
                  <span className="text-[10px] text-slate-400 block">Due by {t.grace_period_days}th of month</span>
                </div>
              </div>

              {/* Action & Lease Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.phone_number}</span>
                </div>

                <button
                  onClick={() => setSelectedTenant(t)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-indigo-300 font-semibold text-[11px] flex items-center gap-1 hover:bg-slate-800"
                >
                  <FileText className="w-3 h-3" />
                  <span>Manage Lease</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedTenant.full_name}</h3>
                <p className="text-xs text-slate-400">{selectedTenant.unit_no}</p>
              </div>
              <span className="text-sm font-black text-emerald-400">₹{selectedTenant.base_rent}/mo</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-semibold text-white">{selectedTenant.phone_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Due Grace Date:</span>
                <span className="font-semibold text-amber-300">{selectedTenant.grace_period_days}th of every month</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Lease Period:</span>
                <span className="font-semibold text-white">{selectedTenant.lease_start_date} to {selectedTenant.lease_end_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Notice Period:</span>
                <span className="font-semibold text-indigo-300">{selectedTenant.notice_period_months} Months</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Current Status:</span>
                <span className={`font-bold capitalize ${selectedTenant.status === 'notice_given' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedTenant.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleToggleNotice(selectedTenant)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  selectedTenant.status === 'notice_given'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                    : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{selectedTenant.status === 'notice_given' ? 'Cancel Notice Period' : 'Start 2-Month Notice Period'}</span>
              </button>

              <button
                onClick={() => setSelectedTenant(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm border border-slate-800 space-y-4 my-8">
            <h3 className="text-base font-bold text-white">Onboard New Tenant</h3>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Property</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.property_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tenant Full Name / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar (Ramesh Electronics)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Shop / Unit No.</label>
                  <input
                    type="text"
                    placeholder="Shop No. 12"
                    value={unitNo}
                    onChange={(e) => setUnitNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Monthly Base Rent (₹)</label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={baseRent}
                    onChange={(e) => setBaseRent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Grace Due Day (Month)</label>
                  <input
                    type="number"
                    placeholder="10 (Due by 10th)"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lease Start</label>
                  <input
                    type="date"
                    value={leaseStartDate}
                    onChange={(e) => setLeaseStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lease End</label>
                  <input
                    type="date"
                    value={leaseEndDate}
                    onChange={(e) => setLeaseEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Onboard Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
