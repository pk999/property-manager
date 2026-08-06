'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  Store, 
  Phone, 
  Calendar, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Tenant, Property } from '@/lib/types/database';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoticeDrawer, setShowNoticeDrawer] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [unitNo, setUnitNo] = useState('');
  const [rent, setRent] = useState('');
  const [propertyId, setPropertyId] = useState('');

  useEffect(() => {
    const fetchedTenants = dataService.getTenants();
    const fetchedProps = dataService.getProperties();
    setTenants(fetchedTenants);
    setProperties(fetchedProps);
    if (fetchedProps.length > 0) setPropertyId(fetchedProps[0].id);
  }, []);

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !unitNo || !rent) return;

    try {
      const newTenant = dataService.addTenant({
        property_id: propertyId,
        full_name: fullName,
        phone_number: phone,
        unit_no: unitNo,
        base_rent: Number(rent),
        due_day: 1,
        grace_period_days: 10,
        lease_start_date: '2026-08-01',
        lease_end_date: '2027-07-31',
        notice_period_months: 2,
        status: 'active',
      });

      setTenants([newTenant, ...tenants]);
      setShowAddModal(false);
      setFullName('');
      setPhone('');
      setUnitNo('');
      setRent('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleNotice = (tenant: Tenant) => {
    const newStatus = tenant.status === 'notice_given' ? 'active' : 'notice_given';
    const updated = dataService.updateTenant(tenant.id, {
      status: newStatus,
      notice_given_date: newStatus === 'notice_given' ? new Date().toISOString().split('T')[0] : undefined,
    });

    setTenants(tenants.map(t => t.id === tenant.id ? updated : t));
    setShowNoticeDrawer(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Tenant Management
          </h2>
          <p className="text-sm text-slate-500 font-medium">Sirisha Amma's 4 Commercial Shop Tenants</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Tenant Cards List */}
      <div className="space-y-4">
        {tenants.map((t) => {
          const isNotice = t.status === 'notice_given';
          return (
            <div key={t.id} className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {t.unit_no}
                    </span>
                    {isNotice && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> 2-Month Vacating Notice
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{t.full_name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold block">Monthly Rent</span>
                  <span className="text-xl font-black text-slate-900 flex items-center justify-end">
                    <IndianRupee className="w-5 h-5" /> {t.base_rent.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">{t.phone_number}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Due by 10th Monthly</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedTenant(t);
                    setShowNoticeDrawer(true);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isNotice
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isNotice ? 'Notice Active (Click to Cancel)' : 'Mark 2-Month Notice'}
                </button>

                <a
                  href={`https://wa.me/91${t.phone_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add New Tenant / Shop</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTenant} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tenant & Shop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh (Grocery Shop 5)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (10 digits)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit / Shop No</label>
                  <input
                    type="text"
                    required
                    placeholder="Shop 5"
                    value={unitNo}
                    onChange={(e) => setUnitNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="12000"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md mt-2"
              >
                Save Tenant & Generate Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notice Period Drawer */}
      {showNoticeDrawer && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-sm bg-white border border-slate-200 space-y-4 shadow-xl text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">2-Month Notice Window</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to {selectedTenant.status === 'notice_given' ? 'cancel' : 'mark'} 2-month vacating notice period for <strong>{selectedTenant.full_name}</strong>?
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowNoticeDrawer(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleNotice(selectedTenant)}
                className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md"
              >
                Confirm Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
