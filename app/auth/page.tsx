'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Phone, ShieldCheck, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';

export default function AuthPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Login Sirisha Amma profile
      dataService.updateLandlord({
        full_name: 'Sirisha Amma',
        phone_number: phoneNumber,
      });
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-950/50">
          <Building2 className="w-8 h-8 text-slate-950 font-bold" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">PropertyManager</h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Low-friction mobile login for landlords to manage shops & tenants
        </p>
      </div>

      {/* Security Shield Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 max-w-sm mx-auto w-full">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold pb-2 border-b border-slate-800">
          <ShieldCheck className="w-4 h-4" />
          <span>PostgreSQL RLS & IDOR Protected</span>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-semibold">+91</span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm font-medium"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">No password needed. OTP will be sent via SMS.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-all"
            >
              <span>{loading ? 'Sending OTP...' : 'Get Login OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Enter 4-Digit OTP</label>
              <input
                type="text"
                maxLength={4}
                placeholder="1234"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-[1em] text-lg font-black py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1 text-center">OTP sent to +91 {phoneNumber}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-all"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Enter App'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
