'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  X,
  Trash2,
  RotateCcw,
  History,
  Tag,
  Filter
} from 'lucide-react';
import { dataService, QuotaExceededError } from '@/lib/services/data-service';
import { Tenant, Property, MonthlyLedger, Landlord } from '@/lib/types/database';
import UpgradePaywallModal from '@/components/UpgradePaywallModal';

function TenantsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPropertyFilter = searchParams.get('propertyId') || 'all';

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [landlord, setLandlord] = useState<Landlord | null>(null);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>(initialPropertyFilter);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoticeDrawer, setShowNoticeDrawer] = useState(false);
  const [showReinstateModal, setShowReinstateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantHistory, setTenantHistory] = useState<MonthlyLedger[]>([]);

  // Re-instate Form State
  const [reinstatePropertyId, setReinstatePropertyId] = useState('');
  const [reinstateUnitNo, setReinstateUnitNo] = useState('');
  const [reinstateRent, setReinstateRent] = useState('');

  // Paywall State
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState('');

  // Add Tenant Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [unitNo, setUnitNo] = useState('');
  const [rent, setRent] = useState('');
  const [propertyId, setPropertyId] = useState('');

  useEffect(() => {
    const fetchedTenants = dataService.getTenants(true);
    const fetchedProps = dataService.getProperties(true);
    setTenants(fetchedTenants);
    setProperties(fetchedProps);
    setLandlord(dataService.getLandlord());
    if (fetchedProps.length > 0) {
      setPropertyId(fetchedProps[0].id);
      setReinstatePropertyId(fetchedProps[0].id);
    }
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
      if (err instanceof QuotaExceededError) {
        setPaywallReason(err.message);
        setPaywallOpen(true);
      } else {
        alert(err.message);
      }
    }
  };

  const handleArchiveTenant = (tenant: Tenant) => {
    const updated = dataService.archiveTenant(tenant.id);
    setTenants(tenants.map(t => t.id === tenant.id ? updated : t));
    setShowDeleteConfirmModal(false);
  };

  const handleOpenReinstate = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setReinstateUnitNo(tenant.unit_no);
    setReinstateRent(String(tenant.base_rent));
    setShowReinstateModal(true);
  };

  const handleConfirmReinstate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !reinstatePropertyId || !reinstateUnitNo || !reinstateRent) return;

    try {
      const updated = dataService.reinstateTenant(
        selectedTenant.id,
        reinstatePropertyId,
        reinstateUnitNo,
        Number(reinstateRent)
      );
      setTenants(tenants.map(t => t.id === selectedTenant.id ? updated : t));
      setShowReinstateModal(false);
    } catch (err: any) {
      if (err instanceof QuotaExceededError) {
        setPaywallReason(err.message);
        setPaywallOpen(true);
      } else {
        alert(err.message);
      }
    }
  };

  const handleOpenHistory = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    const history = dataService.getTenantLedgerHistory(tenant.id);
    setTenantHistory(history);
    setShowHistoryModal(true);
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

  // Filtered List
  const filteredTenants = tenants.filter(t => {
    const matchesTab = activeTab === 'archived' ? t.status === 'archived' : t.status !== 'archived';
    const matchesProperty = selectedPropertyFilter === 'all' || t.property_id === selectedPropertyFilter;
    return matchesTab && matchesProperty;
  });

  const activePropertyObj = properties.find(p => p.id === selectedPropertyFilter);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Tenant Management
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {selectedPropertyFilter !== 'all' && activePropertyObj
              ? `Filtered by: ${activePropertyObj.title}`
              : 'All Tenants Across All Commercial Properties'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Main Tabs & Property Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-xl text-center transition-all ${
              activeTab === 'active'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Tenants ({tenants.filter(t => t.status !== 'archived').length})
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-2.5 rounded-xl text-center transition-all ${
              activeTab === 'archived'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past / Archived ({tenants.filter(t => t.status === 'archived').length})
          </button>
        </div>

        {/* Property Filter Dropdown */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-4 h-4 text-blue-600" /> Filter by Property:
          </span>
          <select
            value={selectedPropertyFilter}
            onChange={(e) => {
              setSelectedPropertyFilter(e.target.value);
              router.push(e.target.value === 'all' ? '/tenants' : `/tenants?propertyId=${e.target.value}`);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenant Cards List */}
      <div className="space-y-4">
        {filteredTenants.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center bg-white border border-slate-200 text-slate-500 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-400" />
            <h4 className="text-base font-bold text-slate-800">No Tenants Found</h4>
            <p className="text-xs">
              {activeTab === 'archived'
                ? 'No past or archived tenants in history.'
                : 'No active tenants match the selected property filter.'}
            </p>
          </div>
        ) : (
          filteredTenants.map((t) => {
            const isNotice = t.status === 'notice_given';
            const isArchived = t.status === 'archived';
            const propertyObj = properties.find(p => p.id === t.property_id);

            return (
              <div
                key={t.id}
                className={`glass-card rounded-3xl p-5 border space-y-3.5 ${
                  isArchived
                    ? 'border-slate-300 bg-slate-100/90'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                {/* Header Tag with Property Name & Unit */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {propertyObj?.title || 'Commercial Complex'} • {t.unit_no}
                    </span>

                    {isNotice && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> 2-Month Vacating Notice
                      </span>
                    )}

                    {isArchived && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
                        Archived / Deleted
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-black text-slate-900">
                    ₹{t.base_rent.toLocaleString('en-IN')}/mo
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t.full_name}</h3>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> +91 {t.phone_number}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenHistory(t)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5 text-blue-600" />
                    <span>1-Yr Ledger History</span>
                  </button>
                </div>

                {/* Details List */}
                <div className="pt-1 grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Due by 10th Monthly</span>
                  </div>

                  {isArchived && t.deleted_at && (
                    <div className="text-right text-slate-500 font-semibold">
                      Archived on: {new Date(t.deleted_at).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  {isArchived ? (
                    <button
                      onClick={() => handleOpenReinstate(t)}
                      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Re-instate Tenant to Property</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedTenant(t);
                          setShowNoticeDrawer(true);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isNotice
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isNotice ? 'Cancel Notice' : '2-Month Notice'}
                      </button>

                      <a
                        href={`https://wa.me/91${t.phone_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                      >
                        WhatsApp
                      </a>

                      <button
                        onClick={() => {
                          setSelectedTenant(t);
                          setShowDeleteConfirmModal(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200"
                        title="Delete & Archive Tenant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
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
                <label className="block font-semibold text-slate-700 mb-1">Select Property Building</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

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

      {/* Delete / Archive Confirm Modal */}
      {showDeleteConfirmModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-sm bg-white border border-slate-200 space-y-4 shadow-xl text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Archive Tenant Record</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Are you sure you want to delete and archive <strong>"{selectedTenant.full_name}"</strong>?
            </p>
            <p className="text-xs text-slate-500">
              💡 Their 1-year payment history will remain preserved under the <strong>Past / Archived</strong> tab, and you can re-instate them anytime!
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveTenant(selectedTenant)}
                className="w-1/2 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md"
              >
                Archive Tenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-instate Tenant Drawer/Modal */}
      {showReinstateModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" /> Re-instate Tenant
              </h3>
              <button onClick={() => setShowReinstateModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReinstate} className="space-y-3.5 text-sm">
              <p className="text-xs text-slate-600 font-medium">
                Re-instating <strong>{selectedTenant.full_name}</strong>. Choose the property and unit to assign them to:
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Property / Building</label>
                <select
                  value={reinstatePropertyId}
                  onChange={(e) => setReinstatePropertyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit / Shop No</label>
                  <input
                    type="text"
                    required
                    value={reinstateUnitNo}
                    onChange={(e) => setReinstateUnitNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={reinstateRent}
                    onChange={(e) => setReinstateRent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md mt-2"
              >
                Confirm Re-instatement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1-Year Ledger History Drawer */}
      {showHistoryModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedTenant.full_name}</h3>
                <p className="text-xs text-slate-500">1-Year Payment History & Ledgers</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {tenantHistory.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No previous ledger entries found.</p>
              ) : (
                tenantHistory.map(l => (
                  <div key={l.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{l.month_year} Ledger</span>
                      <span className="text-slate-500">Due: {l.due_date}</span>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        l.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status.toUpperCase()}
                      </span>
                      <span className="font-extrabold text-slate-900 block text-sm mt-0.5">
                        ₹{l.amount_due}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notice Period Drawer */}
      {showNoticeDrawer && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-sm bg-white border border-slate-200 space-y-4 shadow-xl text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">2-Month Notice Window</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Are you sure you want to {selectedTenant.status === 'notice_given' ? 'cancel' : 'mark'} 2-month vacating notice period for <strong>{selectedTenant.full_name}</strong>?
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowNoticeDrawer(false)}
                className="w-1/2 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleNotice(selectedTenant)}
                className="w-1/2 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md"
              >
                Confirm Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Paywall Modal */}
      <UpgradePaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={paywallReason}
      />
    </div>
  );
}

export default function TenantsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Loading Tenants...</div>}>
      <TenantsContent />
    </Suspense>
  );
}
