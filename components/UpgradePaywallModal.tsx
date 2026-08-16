'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Zap, X, CheckCircle2 } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';

interface UpgradePaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function UpgradePaywallModal({ isOpen, onClose, reason }: UpgradePaywallModalProps) {
  if (!isOpen) return null;

  const landlord = dataService.getLandlord();
  const upiId = landlord.upi_id || 'sirisha.amma@upi';
  const upiCheckoutUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&am=999&pn=${encodeURIComponent('PropertyManager Pro')}&cu=INR`;

  const handleUpgradeViaUPI = () => {
    // Launch mobile UPI payment deep link
    window.location.href = upiCheckoutUrl;

    // Simulate instant Pro upgrade
    setTimeout(() => {
      dataService.updateLandlord({ is_pro_member: true });
      alert("🎉 Upgrade Successful! PropertyManager Pro is now active. Unlimited properties & autonomous WhatsApp engine unlocked.");
      onClose();
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="glass-card rounded-3xl p-6 sm:p-7 w-full max-w-md bg-white border border-slate-200 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2.5 pt-1">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 uppercase tracking-wider">
            💎 PropertyManager Pro
          </span>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Unlock Unlimited Properties & Full Automation
          </h3>

          <p className="text-base text-slate-700 font-medium leading-relaxed">
            For just <strong>₹999/year</strong>, completely automate your rent collection, generate instant WhatsApp statements, and stop chasing payments.
          </p>
        </div>

        {/* Feature List */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-sm font-semibold text-slate-800">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Unlimited Properties, Buildings & Shops</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Partial Payment Ledger Math & History</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>1-Tap Autonomous WhatsApp Statements & Direct UPI</span>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center space-y-1 shadow-lg shadow-blue-500/20">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Annual Subscription</span>
          <div className="text-3xl sm:text-4xl font-black">
            ₹999 <span className="text-base font-medium text-blue-200">/ Year</span>
          </div>
          <p className="text-xs text-blue-100 font-medium">₹2.7 per day • 0% Transaction Fees</p>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            onClick={handleUpgradeViaUPI}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all min-h-[56px]"
          >
            <Zap className="w-6 h-6" />
            <span>Upgrade to Pro via UPI (₹999/Year)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl text-slate-500 hover:text-slate-900 font-bold text-sm"
          >
            Continue with Free Plan (1 Property / 4 Units)
          </button>
        </div>
      </div>
    </div>
  );
}
