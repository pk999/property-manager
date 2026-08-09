'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Zap, X, CheckCircle2 } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';

interface UpgradePaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
}

export default function UpgradePaywallModal({ isOpen, onClose, reason }: UpgradePaywallModalProps) {
  if (!isOpen) return null;

  const handleUpgradeMock = () => {
    dataService.updateLandlord({ is_pro_member: true });
    alert("🎉 Congratulations! You have upgraded to PropertyManager Pro! Unlimited properties and tenants enabled.");
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
            Free Plan Limit Reached
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900">Upgrade to PropertyManager Pro</h3>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-semibold text-slate-700">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Unlimited Commercial Properties & Buildings</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Unlimited Shop Tenants & Automated Monthly Ledgers</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Daily 9:00 AM Automated WhatsApp Rent & Late Fine Reminders</span>
          </div>
        </div>

        {/* Price Card */}
        <div className="p-4 rounded-2xl bg-blue-600 text-white text-center space-y-1 shadow-lg shadow-blue-500/20">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Special Launch Offer</span>
          <div className="text-3xl font-black">
            ₹299 <span className="text-sm font-semibold text-blue-200">/ month</span>
          </div>
          <p className="text-xs text-blue-100 font-medium">Cancel anytime • Or ₹2,499 / year (Save 30%)</p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleUpgradeMock}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            <span>Upgrade to Pro Now</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl text-slate-500 hover:text-slate-900 font-bold text-xs"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
