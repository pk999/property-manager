'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Bot,
  Zap,
  ArrowRight,
  BookOpen,
  Lock
} from 'lucide-react';
import { dataService, QuotaExceededError } from '@/lib/services/data-service';
import { agentEngine, AgentAlertSummary } from '@/lib/services/agent-engine';
import { Property, Tenant, MonthlyLedger, Landlord } from '@/lib/types/database';
import UpgradePaywallModal from '@/components/UpgradePaywallModal';
import QuickDiaryImportModal from '@/components/QuickDiaryImportModal';

export default function Dashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [ledgers, setLedgers] = useState<MonthlyLedger[]>([]);
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [agentSummary, setAgentSummary] = useState<AgentAlertSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    // MANDATORY AUTH GUARD: Redirect unauthenticated first-time visitors to /auth
    if (!dataService.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    refreshData();
    setLoading(false);
  }, []);

  const refreshData = () => {
    const l = dataService.getLandlord();
    if (!l) {
      router.push('/auth');
      return;
    }
    setLandlord(l);
    setProperties(dataService.getProperties(true));
    setTenants(dataService.getTenants(false));
    setLedgers(dataService.getLedgers());
    setAgentSummary(agentEngine.auditAndGenerateAlerts());
  };

  if (loading || !landlord) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold text-sm">
        Authenticating session...
      </div>
    );
  }

  // Calculation Metrics
  const totalPaid = ledgers.filter(l => l.status === 'paid').reduce((sum, l) => sum + Number(l.amount_paid), 0);
  const totalPending = ledgers.filter(l => l.status === 'pending' || l.status === 'overdue' || l.status === 'partial').reduce((sum, l) => sum + Number(l.balance_due || 0), 0);
  const overdueCount = ledgers.filter(l => l.status === 'overdue').length;
  const partialCount = ledgers.filter(l => l.status === 'partial').length;

  const handleAddPropertyClick = () => {
    try {
      dataService.addProperty({
        title: 'New Commercial Complex',
        property_type: 'shop',
      });
      router.push('/properties');
    } catch (err: any) {
      if (err instanceof QuotaExceededError) {
        setPaywallReason(err.message);
        setPaywallOpen(true);
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-4 text-slate-900">
      {/* Streamlined Compact Header Banner */}
      <div className="glass-card rounded-3xl p-4.5 border border-slate-200 bg-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                {landlord.full_name}'s Complex
              </h2>
              {landlord.is_pro_member && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  PRO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-semibold">August 2026 Rent Cycle</p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> RLS Secure
          </span>
        </div>

        {/* Compact Proactive Agent Alert Strip */}
        {agentSummary && agentSummary.hasActionRequired && (
          <Link
            href="/reminders"
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="truncate">{agentSummary.alertHeadline} (₹{agentSummary.totalBalanceDue.toLocaleString('en-IN')})</span>
            </div>

            <div className="flex items-center space-x-1 font-extrabold flex-shrink-0">
              <span>Send 1-Tap Reminders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        )}
      </div>

      {/* KPI Cards Grid - Prominently Displayed Near Top */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Collected */}
        <div className="glass-card rounded-3xl p-4 border-l-4 border-l-emerald-500 space-y-1 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-extrabold uppercase tracking-wider">Rent Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 flex items-center">
            <IndianRupee className="w-6 h-6 mr-0.5" />
            {totalPaid.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Received in August</p>
        </div>

        {/* Pending & Overdue */}
        <div className="glass-card rounded-3xl p-4 border-l-4 border-l-amber-500 space-y-1 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-extrabold uppercase tracking-wider">Pending Rent</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 flex items-center">
            <IndianRupee className="w-6 h-6 mr-0.5" />
            {totalPending.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-800 font-extrabold">
            {overdueCount} Overdue • {partialCount} Partial
          </p>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setQuickAddOpen(true)}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-sm shadow-sm transition-all min-h-[52px]"
        >
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <span>10-Sec Quick Add</span>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-700" />
        </button>

        <button
          onClick={handleAddPropertyClick}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-sm shadow-sm transition-all min-h-[52px]"
        >
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>Add New Property</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Primary Navigation Button */}
      <Link
        href="/tenants"
        className="flex items-center justify-between p-4.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all min-h-[52px]"
      >
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6" />
          <span>Manage Tenants & Partial Ledgers</span>
        </div>
        <ChevronRight className="w-5 h-5" />
      </Link>

      {/* Active Shop Units List / Clean Empty State */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Active Shop Units ({tenants.length})
          </h3>
          <Link href="/tenants" className="text-xs font-bold text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {tenants.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center bg-white border border-slate-200 space-y-3">
            <Building2 className="w-12 h-12 text-blue-600 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">No Shops or Properties Added Yet</h4>
            <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
              Start building your portfolio! Click <strong>"10-Sec Quick Add"</strong> or <strong>"Add New Property"</strong> to onboard your first shop and tenant.
            </p>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md inline-flex items-center gap-2 min-h-[48px]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Your First Shop (30 Secs)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tenants.map((t) => {
              const ledger = ledgers.find(l => l.tenant_id === t.id && l.month_year === '2026-08');
              const balance = ledger?.balance_due !== undefined ? ledger.balance_due : t.base_rent;
              const isPaid = ledger?.status === 'paid';
              const isPartial = ledger?.status === 'partial';
              const isOverdue = ledger?.status === 'overdue';

              return (
                <div key={t.id} className="glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{t.full_name}</h4>
                      <p className="text-xs text-slate-600 font-semibold">{t.unit_no} • ₹{t.base_rent}/mo</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
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
                    <span className="text-xs font-extrabold text-slate-900 block mt-1">
                      {isPaid ? '₹0 Due' : `₹${balance.toLocaleString('en-IN')} Due`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust & Privacy Manifesto Footer */}
      <div className="pt-3 pb-2 text-center border-t border-slate-200/80">
        <p className="text-xs text-slate-600 font-semibold flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your data is 100% private. We never share or sell phone numbers.</span>
        </p>
      </div>

      {/* Modals */}
      <UpgradePaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={paywallReason}
      />

      <QuickDiaryImportModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={refreshData}
        onQuotaExceeded={(reason) => {
          setPaywallReason(reason);
          setPaywallOpen(true);
        }}
      />
    </div>
  );
}
