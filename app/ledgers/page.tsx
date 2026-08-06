'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpenCheck, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Calendar,
  MessageCircle,
  Sparkles,
  CreditCard,
  X
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { MonthlyLedger, Tenant } from '@/lib/types/database';

export default function LedgersPage() {
  const [ledgers, setLedgers] = useState<MonthlyLedger[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedLedger, setSelectedLedger] = useState<MonthlyLedger | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [paymentModeInput, setPaymentModeInput] = useState<'upi' | 'cash' | 'bank_transfer'>('upi');
  const [notesInput, setNotesInput] = useState('');

  useEffect(() => {
    setLedgers(dataService.getLedgers());
    setTenants(dataService.getTenants());
  }, []);

  const filteredLedgers = ledgers.filter(l => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  const handleOpenPayment = (l: MonthlyLedger) => {
    setSelectedLedger(l);
    setAmountPaidInput(String(l.amount_due));
    setNotesInput(l.notes || '');
    setShowPaymentModal(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLedger) return;

    const paidVal = Number(amountPaidInput);
    const isFullPaid = paidVal >= selectedLedger.amount_due;

    const updated = dataService.updateLedger(selectedLedger.id, {
      amount_paid: paidVal,
      status: isFullPaid ? 'paid' : 'pending',
      paid_date: new Date().toISOString().split('T')[0],
      payment_mode: paymentModeInput,
      notes: notesInput,
    });

    setLedgers(ledgers.map(l => l.id === selectedLedger.id ? updated : l));
    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-blue-600" /> Rent Ledgers
          </h2>
          <p className="text-sm text-slate-500 font-medium">August 2026 Monthly Rent Cycle</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 font-semibold block">Active Month</span>
          <span className="text-sm font-bold text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
            August 2026
          </span>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold">
        {[
          { id: 'all', label: 'All Ledgers' },
          { id: 'paid', label: 'Paid' },
          { id: 'pending', label: 'Pending' },
          { id: 'overdue', label: 'Overdue' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-center transition-all ${
              statusFilter === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ledgers List */}
      <div className="space-y-4">
        {filteredLedgers.map((l) => {
          const tenant = tenants.find(t => t.id === l.tenant_id);
          const isPaid = l.status === 'paid';
          const isOverdue = l.status === 'overdue';
          const hasLateFine = Boolean(l.late_fee && l.late_fee > 0);

          return (
            <div key={l.id} className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {tenant?.unit_no || 'Shop'}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOverdue
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isPaid ? '● Paid' : isOverdue ? '● Overdue' : '● Pending'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1">{tenant?.full_name || 'Tenant'}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold block">Base Rent</span>
                  <span className="text-xl font-black text-slate-900 flex items-center justify-end">
                    <IndianRupee className="w-5 h-5" /> {l.amount_due.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Late Fine Warning Badge */}
              {hasLateFine && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" /> ₹500 Weekly Late Fine Added
                  </span>
                  <span className="text-sm font-black">+₹{l.late_fee}</span>
                </div>
              )}

              {/* Due Date & Details */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-600" /> Due: {l.due_date}
                </span>

                {l.paid_date && (
                  <span className="text-emerald-700 font-bold">
                    Paid on {l.paid_date} ({l.payment_mode?.toUpperCase()})
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleOpenPayment(l)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all ${
                    isPaid
                      ? 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isPaid ? 'Edit Payment' : 'Record Payment'}
                </button>

                <a
                  href="/reminders"
                  className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Alert</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Record Rent Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  required
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-base font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'GPay / UPI' },
                    { id: 'cash', label: 'Cash' },
                    { id: 'bank_transfer', label: 'Bank Transfer' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentModeInput(mode.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold border ${
                        paymentModeInput === mode.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
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
                  placeholder="e.g. Paid via PhonePe"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md mt-2"
              >
                Save & Auto-Generate September Ledger
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
