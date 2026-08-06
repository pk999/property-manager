'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpenCheck, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Edit3, 
  Calendar, 
  PlusCircle, 
  TrendingUp, 
  ShieldCheck,
  Send,
  Sparkles,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Tenant, MonthlyLedger } from '@/lib/types/database';
import Link from 'next/link';

export default function LedgersPage() {
  const [ledgers, setLedgers] = useState<MonthlyLedger[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Payment Modal State
  const [editingLedger, setEditingLedger] = useState<MonthlyLedger | null>(null);
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash' | 'bank_transfer' | 'other'>('upi');
  const [notes, setNotes] = useState('');
  
  // Post-payment WhatsApp Alert Trigger Modal
  const [postPaymentAlert, setPostPaymentAlert] = useState<{ tenant: Tenant; ledger: MonthlyLedger } | null>(null);

  useEffect(() => {
    setLedgers(dataService.getLedgers());
    setTenants(dataService.getTenants());
  }, []);

  const handleOpenPaymentModal = (ledger: MonthlyLedger) => {
    setEditingLedger(ledger);
    const totalDue = (ledger.amount_due || 0) + (ledger.late_fee || 0);
    setPaidAmount(String(totalDue));
    setNotes(ledger.notes || '');
  };

  const savePaymentRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLedger) return;

    const numPaid = Number(paidAmount);
    const totalRequired = (editingLedger.amount_due || 0) + (editingLedger.late_fee || 0);
    const isFull = numPaid >= totalRequired;
    const newStatus = isFull ? 'paid' : numPaid > 0 ? 'partially_paid' : editingLedger.status;

    const updated = dataService.updateLedger(editingLedger.id, {
      status: newStatus,
      amount_paid: numPaid,
      paid_date: new Date().toISOString().split('T')[0],
      payment_mode: paymentMode,
      notes: notes,
    });

    const tenant = tenants.find(t => t.id === editingLedger.tenant_id);

    setLedgers(dataService.getLedgers());
    setEditingLedger(null);

    // Trigger WhatsApp Next Month Due Alert modal if fully paid
    if (newStatus === 'paid' && tenant) {
      setPostPaymentAlert({ tenant, ledger: updated });
    }
  };

  const monthLedgers = ledgers.filter(l => l.month_year === selectedMonth);

  const filteredLedgers = monthLedgers.filter(l => {
    if (filterStatus === 'all') return true;
    return l.status === filterStatus;
  });

  // Calculate Metrics
  const monthTotalDue = monthLedgers.reduce((sum, l) => sum + Number(l.amount_due) + Number(l.late_fee || 0), 0);
  const monthTotalPaid = monthLedgers.filter(l => l.status === 'paid' || l.status === 'partially_paid').reduce((sum, l) => sum + Number(l.amount_paid), 0);
  const monthTotalPending = monthTotalDue - monthTotalPaid;
  const overdueCount = monthLedgers.filter(l => l.status === 'overdue').length;
  const totalLateFines = monthLedgers.reduce((sum, l) => sum + Number(l.late_fee || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header & Month Picker */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
            <BookOpenCheck className="w-5 h-5 text-emerald-400" /> Monthly Ledger Tracker
          </h2>
          <p className="text-xs text-slate-400">Automatic late fines & next month due scheduling</p>
        </div>

        {/* Month Selector */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
        >
          <option value="2026-08">August 2026</option>
          <option value="2026-07">July 2026</option>
          <option value="2026-09">September 2026</option>
        </select>
      </div>

      {/* Late Fine & Grace Rule Info Banner */}
      <div className="glass-card rounded-xl p-3 border border-indigo-500/30 bg-indigo-950/20 space-y-1">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-300">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Late Fine Policy Active (+₹500 / week)</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          1st week after grace period is buffer. If delay exceeds 7 days past grace date, <strong className="text-amber-300">₹500 fine per week</strong> is automatically added to total payable rent.
        </p>
      </div>

      {/* Month Metrics Summary Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-2.5 border-l-2 border-l-emerald-500">
          <span className="text-[10px] text-slate-400 block font-semibold">Collected</span>
          <span className="text-xs font-black text-emerald-400 flex items-center mt-0.5">
            <IndianRupee className="w-3 h-3" />
            {monthTotalPaid.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="glass-card rounded-xl p-2.5 border-l-2 border-l-amber-500">
          <span className="text-[10px] text-slate-400 block font-semibold">Pending</span>
          <span className="text-xs font-black text-amber-400 flex items-center mt-0.5">
            <IndianRupee className="w-3 h-3" />
            {monthTotalPending.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="glass-card rounded-xl p-2.5 border-l-2 border-l-rose-500">
          <span className="text-[10px] text-slate-400 block font-semibold">Late Fines</span>
          <span className="text-xs font-black text-rose-400 flex items-center mt-0.5">
            +₹{totalLateFines}
          </span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center justify-between gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
        {['all', 'pending', 'overdue', 'paid', 'partially_paid'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-all ${
              filterStatus === status
                ? 'bg-emerald-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ledgers List */}
      <div className="space-y-3">
        {filteredLedgers.map((l) => {
          const tenant = tenants.find(t => t.id === l.tenant_id);
          const isPaid = l.status === 'paid';
          const isOverdue = l.status === 'overdue';
          const isPartial = l.status === 'partially_paid';
          const hasLateFee = (l.late_fee || 0) > 0;
          const totalPayable = l.amount_due + (l.late_fee || 0);

          return (
            <div key={l.id} className="glass-card glass-card-hover rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{tenant?.full_name || 'Tenant Entry'}</h3>
                  <p className="text-xs text-slate-400">{tenant?.unit_no || 'Unit'} • Due by {l.due_date}</p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-white flex items-center justify-end">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {totalPayable.toLocaleString('en-IN')}
                  </span>
                  
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    {hasLateFee && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        +₹{l.late_fee} Fine
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isPartial
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-400" />
                      )}
                      {l.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Paid: <strong className="text-emerald-400">₹{l.amount_paid}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  {(isOverdue || !isPaid) && (
                    <Link
                      href="/reminders"
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-semibold text-[11px] flex items-center gap-1 hover:bg-slate-800"
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp Overdue</span>
                    </Link>
                  )}

                  {!isPaid && (
                    <button
                      onClick={() => handleOpenPaymentModal(l)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Payment Modal */}
      {editingLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Record Rent Payment</h3>
            
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Base Rent:</span>
                <span className="font-semibold text-white">₹{editingLedger.amount_due}</span>
              </div>
              {(editingLedger.late_fee || 0) > 0 && (
                <div className="flex justify-between text-rose-400 font-semibold">
                  <span>Late Delay Fine (Weekly):</span>
                  <span>+₹{editingLedger.late_fee}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-400 font-extrabold text-sm">
                <span>Total Payable:</span>
                <span>₹{(editingLedger.amount_due || 0) + (editingLedger.late_fee || 0)}</span>
              </div>
            </div>

            <form onSubmit={savePaymentRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-black text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={(e: any) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Received via GPay"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLedger(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold shadow-md"
                >
                  Confirm Paid & Schedule Next
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Payment WhatsApp Receipt & Next Month Alert Trigger Modal */}
      {postPaymentAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm border border-emerald-500/40 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            
            <div>
              <h3 className="text-base font-bold text-white">Payment Recorded Successfully!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Next month ledger (<strong className="text-emerald-400">September 2026</strong>) has been scheduled automatically for {postPaymentAlert.tenant.full_name}.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left text-slate-300 space-y-1">
              <div className="font-semibold text-emerald-400">Automated Next Action:</div>
              <div>Send payment receipt + advance notice for September rent due on Sep 10th over WhatsApp.</div>
            </div>

            <div className="space-y-2">
              <Link
                href="/reminders"
                onClick={() => setPostPaymentAlert(null)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950/60"
              >
                <Send className="w-4 h-4" />
                <span>Send WhatsApp Receipt & Next Month Alert</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setPostPaymentAlert(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-semibold hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
