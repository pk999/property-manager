'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ShieldCheck, User, Building, FileText, Settings, Sparkles, X, LogOut, Phone } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Landlord } from '@/lib/types/database';

export default function Header() {
  const router = useRouter();
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiInput, setUpiInput] = useState('');

  useEffect(() => {
    const l = dataService.getLandlord();
    setLandlord(l);
    setUpiInput(l.upi_id || 'sirisha.amma@upi');
  }, []);

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiInput) return;
    const updated = dataService.updateLandlord({ upi_id: upiInput });
    setLandlord(updated);
    setShowUpiModal(false);
    alert("✓ Landlord UPI ID updated successfully!");
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    router.push('/auth');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">PropertyManager</h1>
                {landlord?.is_pro_member ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                    PRO
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    FREE (1 Prop)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-semibold">{landlord?.full_name || 'Sirisha Amma'}</p>
            </div>
          </Link>

          {/* Secondary Actions Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 min-h-[44px]"
              title="Menu & Settings"
            >
              <Settings className="w-5 h-5 text-blue-600" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-slate-900 text-sm font-semibold space-y-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowUpiModal(true);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-blue-50 text-left flex items-center space-x-2 text-slate-800 font-bold"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Landlord Direct UPI Settings</span>
                </button>

                <Link
                  href="/properties"
                  onClick={() => setMenuOpen(false)}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 flex items-center space-x-2 text-slate-800"
                >
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Properties & Complexes</span>
                </Link>

                <Link
                  href="/lease"
                  onClick={() => setMenuOpen(false)}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 flex items-center space-x-2 text-slate-800"
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Lease & Notice Manager</span>
                </Link>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full p-2.5 rounded-xl hover:bg-red-50 text-left flex items-center space-x-2 text-red-600 font-bold"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Sign Out / Switch Number</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* UPI Settings Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-sm bg-white border border-slate-200 space-y-4 shadow-xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Landlord Direct UPI Settings</h3>
              <button onClick={() => setShowUpiModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpi} className="space-y-3.5 text-sm">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Enter your GPay / PhonePe / Paytm UPI ID. Direct 0% fee bank payments will be embedded into tenant WhatsApp reminders.
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Your UPI ID (VPA)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sirisha.amma@upi or 9876543210@ybl"
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-base focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md min-h-[48px]"
              >
                Save UPI ID (0% Transaction Fees)
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
