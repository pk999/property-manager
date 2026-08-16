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
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { dataService, QuotaExceededError } from '@/lib/services/data-service';
import { agentEngine, AgentAlertSummary } from '@/lib/services/agent-engine';
import { Property, Tenant, MonthlyLedger, Landlord } from '@/lib/types/database';
import UpgradePaywallModal from '@/components/UpgradePaywallModal';

export default function Dashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [ledgers, setLedgers] = useState<MonthlyLedger[]>([]);
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [agentSummary, setAgentSummary] = useState<AgentAlertSummary | null>(null);

  // Paywall State
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState('');

  useEffect(() => {
    setProperties(dataService.getProperties(true));
    setTenants(dataService.getTenants(false));
    setLedgers(dataService.getLedgers());
    setLandlord(dataService.getLandlord());
    setAgentSummary(agentEngine.auditAndGenerateAlerts());
  }, []);

  // Calculation Metrics
  const totalPaid = ledgers.filter(l => l.status === 'paid').reduce((sum, l) => sum + Number(l.amount_paid), 0);
  const totalPending = ledgers.filter(l => l.status === 'pending' || l.status === 'overdue' || l.status === 'partial').reduce((sum, l) => sum + Number(l.balance_due || 0), 0);
  const overdueCount = ledgers.filter(l => l.status === 'overdue').length;
  const partialCount = ledgers.filter(l => l.status === 'partial').length;

  const handleAddPropertyClick = () => {
    try {
      dataService.addProperty({
        title: 'New Commercial Shop',
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
    <div className="space-y-6 text-slate-900">
      {/* Landlord Welcome & Quick Banner */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-700" /> Digital Rental Agent Active
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> 1-to-1 Unit Security
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {landlord?.full_name || 'Sirisha Amma'}'s Overview
          </h2>
          <p className="text-base text-slate-700 font-semibold leading-relaxed">
            Sirisha Amma Commercial Complex • August 2026 Rent Cycle
          </p>
        </div>
      </div>

      {/* Proactive Agent Action Alert Banner */}
      {agentSummary && agentSummary.hasActionRequired && (
        <div className="glass-card rounded-3xl p-6 border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 space-y-4 shadow-md">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30 flex-shrink-0">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {agentSummary.alertHeadline}
              </h3>
              <p className="text-base text-slate-700 font-semibold mt-1 leading-relaxed">
                {agentSummary.alertSubtext}
              </p>
            </div>
          </div>

          <Link
            href="/reminders"
            className="flex items-center justify-center space-x-2 w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-lg shadow-emerald-600/30 transition-all min-h-[56px]"
          >
            <Zap className="w-6 h-6" />
            <span>{agentSummary.actionButtonText}</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Collected */}
        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-emerald-500 space-y-2 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-sm font-extrabold uppercase tracking-wider">Rent Collected</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 flex items-center">
            <IndianRupee className="w-7 h-7 mr-0.5" />
            {totalPaid.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-600 font-bold">Received for August 2026</p>
        </div>

        {/* Pending & Overdue */}
        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-amber-500 space-y-2 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-sm font-extrabold uppercase tracking-wider">Pending Balance</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700 flex items-center">
            <IndianRupee className="w-7 h-7 mr-0.5" />
            {totalPending.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-amber-800 font-extrabold">
            {overdueCount} Overdue • {partialCount} Partial Payment(s)
          </p>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/tenants"
          className="flex items-center justify-between p-4.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all min-h-[56px]"
        >
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6" />
            <span>Manage Tenants & Ledgers</span>
          </div>
          <ChevronRight className="w-5 h-5" />
        </Link>

        <button
          onClick={handleAddPropertyClick}
          className="flex items-center justify-between p-4.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-base shadow-sm transition-all min-h-[56px]"
        >
          <div className="flex items-center space-x-3">
            <PlusCircle className="w-6 h-6 text-blue-600" />
            <span>Add Property (Chai Model)</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Registered Units Quick Overview */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Active Property Units ({tenants.length})
          </h3>
          <Link href="/tenants" className="text-sm font-bold text-blue-600 hover:underline">
            View All Ledgers
          </Link>
        </div>

        <div className="space-y-3">
          {tenants.map((t) => {
            const ledger = ledgers.find(l => l.tenant_id === t.id && l.month_year === '2026-08');
            const balance = ledger?.balance_due || t.base_rent;
            const isPaid = ledger?.status === 'paid';
            const isPartial = ledger?.status === 'partial';
            const isOverdue = ledger?.status === 'overdue';

            return (
              <div key={t.id} className="glass-card glass-card-hover rounded-2xl p-4.5 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 font-bold">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{t.full_name}</h4>
                    <p className="text-xs text-slate-600 font-semibold">{t.unit_no} • ₹{t.base_rent}/mo</p>
                  </div>
                </div>

                <div className="text-right">
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
                  <span className="text-sm font-extrabold text-slate-900 block mt-1">
                    {isPaid ? '₹0 Due' : `₹${balance.toLocaleString('en-IN')} Due`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Paywall Modal */}
      <UpgradePaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={paywallReason}
      />
    </div>
  );
}
