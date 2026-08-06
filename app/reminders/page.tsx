'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  AlertCircle,
  FileText,
  Zap,
  Settings,
  Bot
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { whatsAppAutomation, WhatsAppAutoConfig } from '@/lib/services/whatsapp-automation';
import { Tenant, MonthlyLedger, Landlord } from '@/lib/types/database';

export default function RemindersPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [ledgers, setLedgers] = useState<MonthlyLedger[]>([]);
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [language, setLanguage] = useState<'hi' | 'en' | 'hinglish'>('hi');
  const [templateType, setTemplateType] = useState<'reminder' | 'overdue' | 'receipt' | 'next_month' | 'lease_notice'>('reminder');
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState('');

  // Auto-Reminder Configuration State
  const [autoConfig, setAutoConfig] = useState<WhatsAppAutoConfig>({
    autoSendEnabled: true,
    scheduledHour: 9,
    templateLanguage: 'hi',
  });
  const [autoRunLogs, setAutoRunLogs] = useState<string[]>([]);
  const [runningAuto, setRunningAuto] = useState(false);

  useEffect(() => {
    const fetchedTenants = dataService.getTenants();
    const fetchedLedgers = dataService.getLedgers();
    const fetchedLandlord = dataService.getLandlord();

    setTenants(fetchedTenants);
    setLedgers(fetchedLedgers);
    setLandlord(fetchedLandlord);
    setAutoConfig(whatsAppAutomation.getConfig());
    if (fetchedTenants.length > 0) setSelectedTenantId(fetchedTenants[0].id);
  }, []);

  const tenant = tenants.find(t => t.id === selectedTenantId);
  const ledger = ledgers.find(l => l.tenant_id === selectedTenantId && l.month_year === '2026-08');

  // Auto-generate message text when selections change
  useEffect(() => {
    if (!tenant) return;
    const baseRent = tenant.base_rent;
    const lateFee = ledger?.late_fee || (ledger?.status === 'overdue' ? 500 : 0);
    const totalPayable = baseRent + lateFee;
    const upiId = landlord?.upi_id || 'sirisha.amma@upi';
    const currentMonth = 'August 2026';
    const nextMonth = 'September 2026';
    const dueDate = ledger?.due_date || `${tenant.grace_period_days}th August 2026`;
    const nextDueDate = `10th October 2026`;
    const owner = landlord?.full_name || 'Sirisha Amma';

    let text = '';

    if (templateType === 'next_month') {
      if (language === 'hi') {
        text = `नमस्ते ${tenant.full_name} जी 🙏\n\n${currentMonth} का किराया प्राप्त हो चुका है, बहुत-बहुत धन्यवाद!\n\nअगले महीने (${nextMonth}) का किराया ₹${baseRent} (${tenant.unit_no}) की देय तिथि ${nextDueDate} होगी (10th Oct 2026 तक देय)।\n\nUPI ID: ${upiId}\n\nसादर,\n${owner}`;
      } else if (language === 'hinglish') {
        text = `Namaste ${tenant.full_name} ji 🙏\n\n${currentMonth} rent receive ho gaya hai, thank you!\n\nNext month (${nextMonth}) rent ₹${baseRent} (${tenant.unit_no}) ki due date ${nextDueDate} rahegi.\n\nUPI ID: ${upiId}\n\nRegards,\n- ${owner}`;
      } else {
        text = `Hello ${tenant.full_name},\n\nThank you for paying ${currentMonth} rent!\n\nAdvance Notice: ${nextMonth} rent for ${tenant.unit_no} (₹${baseRent}) will be due by ${nextDueDate}.\n\nUPI ID: ${upiId}\n\nRegards,\n${owner}`;
      }
    } else if (templateType === 'receipt') {
      if (language === 'hi') {
        text = `नमस्ते ${tenant.full_name} जी 🙏\n\n${currentMonth} महीने का किराया ₹${baseRent} (${tenant.unit_no}) प्राप्त हो गया है। आपका बहुत-बहुत धन्यवाद!\n\n${nextMonth} का किराया ${nextDueDate} तक देय होगा।\n\nसादर,\n${owner}`;
      } else if (language === 'hinglish') {
        text = `Namaste ${tenant.full_name} ji 🙏\n\nAapka ${currentMonth} ka rent ₹${baseRent} (${tenant.unit_no}) mil gaya hai. Thank you!\n\n${nextMonth} rent due date: ${nextDueDate}.\n\nRegards,\n${owner}`;
      } else {
        text = `Hello ${tenant.full_name},\n\nPayment of ₹${baseRent} for ${currentMonth} rent (${tenant.unit_no}) has been successfully received. Thank you!\n\n${nextMonth} rent due date: ${nextDueDate}.\n\nRegards,\n${owner}`;
      }
    } else if (templateType === 'overdue') {
      if (language === 'hi') {
        text = `नमस्ते ${tenant.full_name} जी 🙏\n\nअति आवश्यक सूचना: ${tenant.unit_no} का ${currentMonth} का किराया ₹${baseRent} देय तिथि (${dueDate}) से बिलंब हो गया है।\n\nविलंब शुल्क (Late Fine): +₹${lateFee > 0 ? lateFee : 500} (1 सप्ताह बिलंब नियम)\nकुल देय राशि: ₹${totalPayable}\n\nकृपया तुरंत भुगतान करें:\nUPI ID: ${upiId}\n\nधन्यवाद!\n- ${owner}`;
      } else if (language === 'hinglish') {
        text = `Namaste ${tenant.full_name} ji 🙏\n\nUrgent: ${tenant.unit_no} ka ${currentMonth} rent ₹${baseRent} overdue ho gaya hai (Due date thi: ${dueDate}).\n\nLate Fine added (+₹${lateFee > 0 ? lateFee : 500} after 1-week grace delay).\nTotal Payable: ₹${totalPayable}\n\nPlease transfer immediately to UPI ID: ${upiId}\n\nDhanyawad,\n- ${owner}`;
      } else {
        text = `Urgent Notice: ${currentMonth} rent for ${tenant.unit_no} (₹${baseRent}) is overdue (Due date: ${dueDate}).\n\nLate Delay Fine Added: +₹${lateFee > 0 ? lateFee : 500} (1-week delay rule).\nTotal Payable: ₹${totalPayable}.\n\nPlease transfer immediately to UPI ID: ${upiId}.\n\nThank you,\n${owner}`;
      }
    } else if (templateType === 'lease_notice') {
      if (language === 'hi') {
        text = `नमस्ते ${tenant.full_name} जी 🙏\n\n${tenant.unit_no} के लीज एग्रीमेंट की सूचना: आपकी दुकान का 2 महीने का नोटिस / नवीनीकरण समय चालू है (लीज समाप्ति: ${tenant.lease_end_date})।\n\nकृपया नए समझौते हेतु संपर्क करें।\n\n- ${owner}`;
      } else {
        text = `Hello ${tenant.full_name},\n\nLease Notice Update for ${tenant.unit_no}: Your 2-month notice/renewal window is active (Lease End: ${tenant.lease_end_date}).\n\nPlease contact for lease renewal.\n\nRegards,\n${owner}`;
      }
    } else {
      // Default Rent Reminder
      if (language === 'hi') {
        text = `नमस्ते ${tenant.full_name} जी 🙏\n\n${currentMonth} महीने का किराया ₹${baseRent} (${tenant.unit_no}) की देय तिथि ${dueDate} है।\n\nविलंब शुल्क नियम: देय तिथि के 1 सप्ताह बाद ₹500 प्रति सप्ताह फाइन लागू होगा।\n\nभुगतान हेतु UPI ID: ${upiId}\n\nधन्यवाद!\n- ${owner}`;
      } else if (language === 'hinglish') {
        text = `Namaste ${tenant.full_name} ji 🙏\n\nAapka ${currentMonth} rent ₹${baseRent} (${tenant.unit_no}) due by ${dueDate} hai.\n\nLate Fine Rule: Grace period ke 1 week baad ₹500/week fine shuru hoga.\n\nPay via GPay/UPI: ${upiId}\n\nDhanyawad,\n- ${owner}`;
      } else {
        text = `Hello ${tenant.full_name},\n\nThis is a friendly reminder that ${currentMonth} rent for ${tenant.unit_no} (₹${baseRent}) is due on ${dueDate}.\n\nNote: A late fine of ₹500/week applies starting 1 week after grace date.\n\nPay via UPI: ${upiId}\n\nThank you,\n${owner}`;
      }
    }

    setCustomText(text);
  }, [selectedTenantId, language, templateType, landlord, ledger, tenant]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAutoBatch = async () => {
    setRunningAuto(true);
    setAutoRunLogs(['Initiating automated WhatsApp reminder dispatch for Sirisha Amma...']);

    await new Promise(r => setTimeout(r, 600));

    const pendingTenants = tenants.filter(t => {
      const l = ledgers.find(led => led.tenant_id === t.id && led.month_year === '2026-08');
      return l?.status === 'pending' || l?.status === 'overdue';
    });

    const logs: string[] = [];
    for (const t of pendingTenants) {
      const l = ledgers.find(led => led.tenant_id === t.id && led.month_year === '2026-08');
      if (l && landlord) {
        const result = await whatsAppAutomation.triggerAutoReminder(
          t,
          l,
          landlord,
          l.status === 'overdue' ? 'overdue' : 'reminder'
        );
        logs.push(`✓ Auto-Triggered: ${t.full_name} (${t.unit_no}) — Mode: ${result.mode}`);
      }
    }

    setAutoRunLogs(['✓ Daily 9:00 AM Cron Completed Successfully!', ...logs]);
    setRunningAuto(false);
  };

  const cleanPhone = tenant ? tenant.phone_number.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(customText)}`
    : '#';

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-emerald-600" /> WhatsApp Automation Engine
        </h2>
        <p className="text-sm text-slate-500 font-medium">Daily 9:00 AM reminders & payment receipt alerts</p>
      </div>

      {/* Automatic Daily Trigger Card */}
      <div className="glass-card rounded-3xl p-5 border border-emerald-200 bg-emerald-50/40 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Automated Daily Scheduler</h3>
              <p className="text-xs text-slate-600 font-medium">Runs daily at 9:00 AM IST</p>
            </div>
          </div>

          <button
            onClick={handleRunAutoBatch}
            disabled={runningAuto}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Zap className="w-4 h-4" />
            <span>{runningAuto ? 'Running...' : 'Trigger Auto-Run Now'}</span>
          </button>
        </div>

        {autoRunLogs.length > 0 && (
          <div className="p-3 rounded-2xl bg-white border border-emerald-200 text-xs font-mono text-emerald-800 space-y-1">
            {autoRunLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        )}
      </div>

      {/* Tenant & Language Selection Card */}
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
                {t.full_name} ({t.unit_no}) — ₹{t.base_rent}/mo
              </option>
            ))}
          </select>
        </div>

        {/* Template Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Message Template</label>
          <div className="grid grid-cols-2 gap-2.5 text-sm">
            {[
              { id: 'reminder', label: 'Rent Reminder', icon: Clock },
              { id: 'overdue', label: 'Overdue + Fine', icon: AlertCircle },
              { id: 'receipt', label: 'Payment Receipt', icon: CheckCircle2 },
              { id: 'next_month', label: 'Next Month Due', icon: Sparkles },
              { id: 'lease_notice', label: 'Lease Renewal', icon: FileText },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = templateType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplateType(t.id as any)}
                  className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                    isActive
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs truncate font-bold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Language</label>
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-sm font-bold">
            {[
              { id: 'hi', label: 'Hindi (हिंदी)' },
              { id: 'hinglish', label: 'Hinglish' },
              { id: 'en', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id as any)}
                className={`flex-1 py-2 rounded-xl text-center transition-all ${
                  language === lang.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Preview */}
      <div className="glass-card rounded-3xl p-5 border border-emerald-300 bg-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-sm text-emerald-800 font-bold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" /> WhatsApp Message Preview
          </span>
          <button
            onClick={handleCopyText}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-bold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>

        <textarea
          rows={6}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-emerald-600"
        />

        {/* 1-Click WhatsApp Action Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md transition-all"
        >
          <Send className="w-5 h-5" />
          <span>Send via WhatsApp to +91 {cleanPhone}</span>
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}
