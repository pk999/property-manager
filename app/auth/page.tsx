'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Phone, ShieldCheck, Lock, ArrowRight, CheckCircle2, MessageCircle, Sparkles, Send } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { whatsAppAuthService } from '@/lib/services/whatsapp-auth-service';

export default function AuthPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('9063063253');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await whatsAppAuthService.sendWhatsAppOtp(phoneNumber);
      setLoading(false);
      setStep('otp');
      setInfoMessage(res.message);
      if (res.otpSimulated) {
        setSimulatedCode(res.otpSimulated);
        setOtp(res.otpSimulated); // Auto-fill generated OTP for instant testing
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error sending WhatsApp OTP');
    }
  };

  const handleVerifyWhatsAppOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the 4-digit OTP sent to your WhatsApp');
      return;
    }

    setLoading(true);
    const result = whatsAppAuthService.verifyWhatsAppOtp(phoneNumber, otp);

    if (result.success) {
      setTimeout(() => {
        setLoading(false);
        dataService.updateLandlord({
          full_name: 'Sirisha Amma',
          phone_number: `+91 ${phoneNumber}`,
        });
        router.push('/');
      }, 400);
    } else {
      setLoading(false);
      setError(result.message);
    }
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
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 text-white font-black">
          <MessageCircle className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">PropertyManager</h1>
        <p className="text-sm font-semibold text-slate-600 max-w-xs mx-auto">
          Direct WhatsApp OTP Authentication for Landlords
        </p>
      </div>

      {/* Auth Form Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200 bg-white space-y-5 max-w-sm mx-auto w-full shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Direct Auth
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            0% SMS COST
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
            {error}
          </div>
        )}

        {infoMessage && step === 'otp' && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
            💬 {infoMessage}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendWhatsAppOtp} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-800 font-extrabold mb-1.5">Enter WhatsApp Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-base">+91</span>
                <input
                  type="tel"
                  placeholder="9063063253"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-14 pr-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600 text-lg font-black"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1.5">
                OTP will be delivered directly to your WhatsApp account.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all min-h-[52px]"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? 'Sending WhatsApp OTP...' : 'Send OTP on WhatsApp'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyWhatsAppOtp} className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-slate-800 font-extrabold">Enter 4-Digit WhatsApp OTP</label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
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
                  className="w-full text-center tracking-widest text-2xl font-black px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {simulatedCode && (
                <p className="text-xs text-emerald-800 font-bold mt-1.5 text-center">
                  ✓ Generated WhatsApp OTP: <strong>{simulatedCode}</strong>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all min-h-[52px]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{loading ? 'Verifying...' : 'Verify & Login'}</span>
            </button>
          </form>
        )}

        {/* Instant Demo Login Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all min-h-[48px]"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
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
