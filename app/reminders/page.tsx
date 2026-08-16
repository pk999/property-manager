'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  AlertCircle,
  FileText,
  Zap,
  Bot,
  CreditCard,
  QrCode,
  DollarSign
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { whatsAppAutomation, WhatsAppAutoConfig } from '@/lib/services/whatsapp-automation';
import { agentEngine, AgentAlertSummary } from '@/lib/services/agent-engine';
import { Tenant, MonthlyLedger, Landlord } from '@/lib/types/database';

export default function RemindersPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [ledgers, setLedgers] = useState<MonthlyLedger[]>([]);
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [language, setLanguage] = useState<'hi' | 'en' | 'hinglish'>('hi');
  const [templateType, setTemplateType] = useState<'reminder' | 'overdue' | 'receipt' | 'next_month' | 'partial'>('reminder');
  const [copied, setCopied] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [customText, setCustomText] = useState('');
  const [agentSummary, setAgentSummary] = useState<AgentAlertSummary | null>(null);
  const [runningAuto, setRunningAuto] = useState(false);

  useEffect(() => {
    const fetchedTenants = dataService.getTenants(false);
    const fetchedLedgers = dataService.getLedgers();
    const fetchedLandlord = dataService.getLandlord();

    setTenants(fetchedTenants);
    setLedgers(fetchedLedgers);
    setLandlord(fetchedLandlord);
    setAgentSummary(agentEngine.auditAndGenerateAlerts());

    if (fetchedTenants.length > 0) setSelectedTenantId(fetchedTenants[0].id);
  }, []);

  const tenant = tenants.find(t => t.id === selectedTenantId);
  const ledger = ledgers.find(l => l.tenant_id === selectedTenantId && l.month_year === '2026-08');

  // Auto-generate message text when selections change
  useEffect(() => {
    if (!tenant) return;
    const baseRent = tenant.base_rent;
    const lateFee = ledger?.late_fee || 0;
    const amountPaid = ledger?.amount_paid || 0;
    const balanceDue = ledger?.balance_due !== undefined ? ledger.balance_due : (baseRent + lateFee);
    const upiId = landlord?.upi_id || 'sirisha.amma@upi';
    const owner = landlord?.full_name || 'Sirisha Amma';
    const currentMonth = 'August 2026';
    const nextMonth = 'September 2026';
    const dueDate = ledger?.due_date || `${tenant.grace_period_days}th August 2026`;
    const nextDueDate = `10th October 2026`;

    // Standard Direct UPI Payment Deep-Link (0% Transaction Fees)
    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${balanceDue}&pn=${encodeURIComponent(owner)}&cu=INR`;

    let text = '';

    if (templateType === 'partial' || ledger?.status === 'partial') {
      text = `Namaste ${tenant.full_name} ji 🙏\n\nThank you for ₹${amountPaid.toLocaleString('en-IN')} received for ${currentMonth} rent (${tenant.unit_no}).\n\nGentle Reminder: A balance of ₹${balanceDue.toLocaleString('en-IN')} is pending.\n\nKindly pay via Direct UPI (0% Fee):\n${upiId}\n\nPay Direct UPI Link:\n${upiDeepLink}\n\nRegards,\n- ${owner}`;
    } else if (templateType === 'next_month') {
      text = `Namaste ${tenant.full_name} ji 🙏\n\n${currentMonth} rent received. Thank you!\n\nNext month (${nextMonth}) rent ₹${baseRent} (${tenant.unit_no}) will be due by ${nextDueDate}.\n\nDirect UPI ID: ${upiId}\n\nRegards,\n${owner}`;
    } else if (templateType === 'receipt') {
      text = `Namaste ${tenant.full_name} ji 🙏\n\nPayment of ₹${baseRent} for ${currentMonth} rent (${tenant.unit_no}) received with thanks!\n\nNext month (${nextMonth}) due date: ${nextDueDate}.\n\n- ${owner}`;
    } else if (templateType === 'overdue' || ledger?.status === 'overdue') {
      text = `Namaste ${tenant.full_name} ji 🙏\n\nUrgent: Rent for ${tenant.unit_no} (${currentMonth}) is overdue (Due date: ${dueDate}).\n\nTotal Due (incl. Late Fine): ₹${balanceDue.toLocaleString('en-IN')}\n\nPlease transfer immediately via Direct UPI (0% Fee):\n${upiId}\n\nPay Direct UPI Link:\n${upiDeepLink}\n\nThank you,\n- ${owner}`;
    } else {
      // Default Rent Reminder
      text = `Namaste ${tenant.full_name} ji 🙏\n\nFriendly reminder: ${currentMonth} rent for ${tenant.unit_no} (₹${balanceDue.toLocaleString('en-IN')}) is due on ${dueDate}.\n\nPay Bank-to-Bank via Direct UPI (0% Fee):\n${upiId}\n\nPay Direct UPI Link:\n${upiDeepLink}\n\nThank you,\n- ${owner}`;
    }

    setCustomText(text);
  }, [selectedTenantId, language, templateType, landlord, ledger, tenant]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUpi = () => {
    if (landlord?.upi_id) {
      navigator.clipboard.writeText(landlord.upi_id);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const cleanPhone = tenant ? tenant.phone_number.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(customText)}`
    : '#';

  const upiId = landlord?.upi_id || 'sirisha.amma@upi';
  const ownerName = landlord?.full_name || 'Sirisha Amma';
  const balance = ledger?.balance_due !== undefined ? ledger.balance_due : (tenant?.base_rent || 0);
  const upiPayLink = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${balance}&pn=${encodeURIComponent(ownerName)}&cu=INR`;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-emerald-600" /> WhatsApp Engine & Direct UPI
        </h2>
        <p className="text-sm text-slate-600 font-semibold">1-Tap WhatsApp dispatches with zero-fee direct bank payment links</p>
      </div>

      {/* Proactive Agent 1-Tap Batch Alert */}
      {agentSummary && agentSummary.hasActionRequired && (
        <div className="glass-card rounded-3xl p-5 border-2 border-emerald-500 bg-emerald-50/50 space-y-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">1-Tap Batch Reminder Dispatches</h3>
              <p className="text-xs text-slate-600 font-semibold">{agentSummary.batchReminders.length} tenant reminders ready to send</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {agentSummary.batchReminders.map(item => (
              <div key={item.tenant.id} className="p-3 rounded-2xl bg-white border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block text-sm">{item.tenant.full_name} ({item.tenant.unit_no})</span>
                  <span className="text-xs text-slate-600 font-semibold">Balance Due: ₹{item.ledger.balance_due?.toLocaleString('en-IN')}</span>
                </div>
                <a
                  href={item.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct UPI Payment Details Box */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">Landlord Direct UPI Payment (0% Fees)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
            Direct Bank-to-Bank
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Configured UPI ID</span>
            <span className="text-base font-black text-slate-900">{upiId}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyUpi}
              className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 min-h-[44px]"
            >
              {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
            </button>

            <a
              href={upiPayLink}
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 min-h-[44px]"
            >
              Test UPI Pay
            </a>
          </div>
        </div>
      </div>

      {/* Tenant & Template Selection Card */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1.5">Select Tenant / Shop</label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 text-base font-bold focus:outline-none focus:border-blue-600"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name} ({t.unit_no}) — Rent: ₹{t.base_rent}/mo
              </option>
            ))}
          </select>
        </div>

        {/* Template Options */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Message Template</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-sm">
            {[
              { id: 'reminder', label: 'Rent Reminder', icon: Clock },
              { id: 'partial', label: 'Partial Balance', icon: DollarSign },
              { id: 'overdue', label: 'Overdue Notice', icon: AlertCircle },
              { id: 'receipt', label: 'Payment Receipt', icon: CheckCircle2 },
              { id: 'next_month', label: 'Next Month Due', icon: Sparkles },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = templateType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplateType(t.id as any)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all min-h-[48px] ${
                    isActive
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-extrabold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Preview & WhatsApp Launch */}
      <div className="glass-card rounded-3xl p-5 border border-emerald-300 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between text-sm text-emerald-800 font-bold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" /> WhatsApp Message Preview
          </span>
          <button
            onClick={handleCopyText}
            className="text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-bold min-h-[40px]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>

        <textarea
          rows={7}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-emerald-600"
        />

        {/* 1-Click WhatsApp Action Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-lg shadow-emerald-600/30 transition-all min-h-[56px]"
        >
          <Send className="w-5 h-5" />
          <span>Send via WhatsApp to +91 {cleanPhone}</span>
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}
