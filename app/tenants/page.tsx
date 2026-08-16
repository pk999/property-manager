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
  Filter,
  CreditCard,
  Sparkles
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
  const [ledgers, setLedgers] = useState<MonthlyLedger[]>([]);
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedLedger, setSelectedLedger] = useState<MonthlyLedger | null>(null);
  const [tenantHistory, setTenantHistory] = useState<MonthlyLedger[]>([]);

  // Payment Recording State
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [paymentModeInput, setPaymentModeInput] = useState<'upi' | 'cash' | 'bank_transfer'>('upi');
  const [notesInput, setNotesInput] = useState('');

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
    const fetchedLedgers = dataService.getLedgers();
    setTenants(fetchedTenants);
    setProperties(fetchedProps);
    setLedgers(fetchedLedgers);
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
      setLedgers(dataService.getLedgers());
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

  const handleOpenPayment = (t: Tenant) => {
    const ledger = ledgers.find(l => l.tenant_id === t.id && l.month_year === '2026-08');
    if (!ledger) return;
    setSelectedTenant(t);
    setSelectedLedger(ledger);
    setAmountPaidInput(String(ledger.amount_paid || ledger.amount_due));
    setNotesInput(ledger.notes || '');
    setShowPaymentModal(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLedger) return;

    const paidVal = Number(amountPaidInput);
    const updated = dataService.updateLedger(selectedLedger.id, {
      amount_paid: paidVal,
      paid_date: new Date().toISOString().split('T')[0],
      payment_mode: paymentModeInput,
      notes: notesInput,
    });

    setLedgers(ledgers.map(l => l.id === selectedLedger.id ? updated : l));
    setShowPaymentModal(false);
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
    <div className="space-y-6 text-slate-900">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Tenants & Partial Ledgers
          </h2>
          <p className="text-sm text-slate-600 font-semibold">
            {selectedPropertyFilter !== 'all' && activePropertyObj
              ? `Filtered by: ${activePropertyObj.title}`
              : 'All Shop Units & Rent Payments'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center gap-2 min-h-[48px]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Main Tabs & Property Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-sm font-bold">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-xl text-center transition-all min-h-[44px] ${
              activeTab === 'active'
                ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Units ({tenants.filter(t => t.status !== 'archived').length})
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-3 rounded-xl text-center transition-all min-h-[44px] ${
              activeTab === 'archived'
                ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past / Archived ({tenants.filter(t => t.status === 'archived').length})
          </button>
        </div>

        {/* Property Filter Dropdown */}
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5 text-slate-600 font-bold">
            <Filter className="w-4 h-4 text-blue-600" /> Filter by Building:
          </span>
          <select
            value={selectedPropertyFilter}
            onChange={(e) => {
              setSelectedPropertyFilter(e.target.value);
              router.push(e.target.value === 'all' ? '/tenants' : `/tenants?propertyId=${e.target.value}`);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold text-xs focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenant Cards List with Partial Math */}
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
            const ledger = ledgers.find(l => l.tenant_id === t.id && l.month_year === '2026-08');

            const amountPaid = ledger?.amount_paid || 0;
            const balanceDue = ledger?.balance_due !== undefined ? ledger.balance_due : t.base_rent;
            const isPaid = ledger?.status === 'paid';
            const isPartial = ledger?.status === 'partial';
            const isOverdue = ledger?.status === 'overdue';

            return (
              <div
                key={t.id}
                className={`glass-card rounded-3xl p-5 border space-y-4 ${
                  isArchived
                    ? 'border-slate-300 bg-slate-100/90'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                {/* Header Tag with Property Name & Unit */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-700" />
                      {propertyObj?.title || 'Commercial Complex'} • {t.unit_no}
                    </span>

                    {isNotice && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> 2-Month Notice
                      </span>
                    )}

                    {isArchived && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
                        Archived / Deleted
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPartial
                        ? 'bg-blue-100 text-blue-800'
                        : isOverdue
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isPaid ? 'Paid' : isPartial ? 'Partial' : isOverdue ? 'Overdue' : 'Pending'}
                  </span>
                </div>

                {/* Tenant Info & Monthly Math */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{t.full_name}</h3>
                    <p className="text-sm text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                      <Phone className="w-4 h-4 text-blue-600" /> +91 {t.phone_number}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold block">Total Rent</span>
                    <span className="text-2xl font-black text-slate-900 flex items-center justify-end">
                      <IndianRupee className="w-5 h-5" /> {t.base_rent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* PARTIAL PAYMENT MATH BOX */}
                {!isArchived && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-xs block font-medium">Paid Amount</span>
                      <span className="text-emerald-700 text-base font-black">
                        ₹{amountPaid.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-slate-500 text-xs block font-medium">Balance Due</span>
                      <span className={`text-base font-black ${balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        ₹{balanceDue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Ledger Record & Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  {isArchived ? (
                    <button
                      onClick={() => handleOpenReinstate(t)}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md flex items-center justify-center gap-2 min-h-[48px]"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Re-instate Tenant to Property</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenPayment(t)}
                        className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-1.5 min-h-[48px]"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Record Payment</span>
                      </button>

                      <button
                        onClick={() => handleOpenHistory(t)}
                        className="px-3.5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1 min-h-[48px]"
                      >
                        <History className="w-4 h-4 text-blue-600" />
                        <span>History</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTenant(t);
                          setShowDeleteConfirmModal(true);
                        }}
                        className="p-3 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 min-h-[48px]"
                        title="Delete & Archive Tenant"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Payment Modal with Partial Support */}
      {showPaymentModal && selectedTenant && selectedLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Rent Payment</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedTenant.full_name} ({selectedTenant.unit_no})</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-sm">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="flex justify-between text-xs text-blue-900 font-semibold">
                  <span>Base Rent: ₹{selectedTenant.base_rent}</span>
                  <span>Late Fee: ₹{selectedLedger.late_fee || 0}</span>
                </div>
                <div className="flex justify-between text-base font-black text-blue-950 pt-1 border-t border-blue-200">
                  <span>Total Payable:</span>
                  <span>₹{((selectedLedger.amount_due || 0) + (selectedLedger.late_fee || 0)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Amount Paid Now (₹)</label>
                <input
                  type="number"
                  required
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-lg font-black focus:outline-none focus:border-blue-600"
                />
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Enter partial payment amount (e.g. ₹10,000) to log balance due automatically.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'GPay / UPI' },
                    { id: 'cash', label: 'Cash' },
                    { id: 'bank_transfer', label: 'Bank' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentModeInput(mode.id as any)}
                      className={`py-2.5 rounded-xl text-xs font-bold border ${
                        paymentModeInput === mode.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid ₹10,000 via GPay"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md mt-2 min-h-[48px]"
              >
                Save Payment & Update Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl text-slate-900">
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
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Strict 1-to-1 unit mapping</p>
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
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md mt-2 min-h-[48px]"
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
          <div className="glass-card rounded-3xl p-6 w-full max-w-sm bg-white border border-slate-200 space-y-4 shadow-xl text-center text-slate-900">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Archive Tenant Record</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Are you sure you want to delete and archive <strong>"{selectedTenant.full_name}"</strong>?
            </p>
            <p className="text-xs text-slate-500">
              💡 Their payment history remains preserved under the <strong>Past / Archived</strong> tab.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveTenant(selectedTenant)}
                className="w-1/2 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md min-h-[48px]"
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
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl text-slate-900">
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
                Re-instating <strong>{selectedTenant.full_name}</strong>. Choose the property building and unit:
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
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md mt-2 min-h-[48px]"
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
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto text-slate-900">
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
                  <div key={l.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{l.month_year} Ledger</span>
                      <span className="text-slate-600 font-medium">Paid: ₹{l.amount_paid} | Due: {l.due_date}</span>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] ${
                        l.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.status === 'partial'
                          ? 'bg-blue-100 text-blue-800'
                          : l.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status}
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
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Loading Tenants & Ledgers...</div>}>
      <TenantsContent />
    </Suspense>
  );
}
