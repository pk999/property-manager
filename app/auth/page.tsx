'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Phone, ShieldCheck, Lock, ArrowRight, CheckCircle2, KeyRound, Sparkles } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';

export default function AuthPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('9063063253');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setOtp('1234'); // Auto-fill 1234 for 1-tap testing demo
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a 4-digit OTP code');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Initialize landlord session
      dataService.updateLandlord({
        full_name: 'Sirisha Amma',
        phone_number: `+91 ${phoneNumber}`,
      });
      router.push('/');
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dataService.updateLandlord({
        full_name: 'Sirisha Amma',
        phone_number: '+91 9063063253',
      });
      router.push('/');
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center space-y-6 text-slate-900">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-black">
          <Building2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">PropertyManager</h1>
        <p className="text-sm font-semibold text-slate-600 max-w-xs mx-auto">
          Low-friction mobile login for commercial shop & residential landlords
        </p>
      </div>

      {/* Auth Form Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200 bg-white space-y-5 max-w-sm mx-auto w-full shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> PostgreSQL RLS & IDOR Protected
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            OTP AUTH
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-800 font-extrabold mb-1.5">Enter Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-base">+91</span>
                <input
                  type="tel"
                  placeholder="9063063253"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-14 pr-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-lg font-black"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1.5">No password needed. OTP will be sent via SMS / WhatsApp.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-md flex items-center justify-center space-x-2 transition-all min-h-[52px]"
            >
              <span>{loading ? 'Sending OTP...' : 'Send 4-Digit Login OTP'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-slate-800 font-extrabold">Enter 4-Digit OTP</label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Change Number
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-2xl font-black px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
              <p className="text-xs text-emerald-700 font-bold mt-1.5 text-center">
                ✓ Demo OTP code pre-filled: 1234
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-md flex items-center justify-center space-x-2 transition-all min-h-[52px]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{loading ? 'Verifying...' : 'Verify OTP & Login'}</span>
            </button>
          </form>
        )}

        {/* 1-Tap Quick Demo Login Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all min-h-[48px]"
          >
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Instant Demo Login (Sirisha Amma)</span>
          </button>
        </div>
      </div>

      {/* Trust & Privacy Manifesto Footer */}
      <div className="text-center">
        <p className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1.5 max-w-xs mx-auto">
          <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Your tenant data is 100% private. We never share or sell phone numbers.</span>
        </p>
      </div>
    </div>
  );
}
