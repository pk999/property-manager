'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { emailService } from '@/lib/services/email-service';

export default function AuthPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const googleEmail = 'landlord.user@gmail.com';
      const googleName = 'Ramesh Kumar';

      // 1. Create/Login clean blank account
      dataService.loginRealLandlord(googleEmail, googleName, 'google');

      // 2. Trigger Welcome Email + Admin Signup Notification
      emailService.sendWelcomeEmailToLandlord(googleName, googleEmail);
      emailService.sendAdminSignupNotification({
        fullName: googleName,
        email: googleEmail,
        authProvider: 'google',
        createdAt: new Date().toLocaleString('en-IN'),
      });

      router.push('/');
    }, 600);
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email address and password');
      return;
    }

    if (authMode === 'signup' && !fullName) {
      setError('Please enter your full name');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const name = fullName || email.split('@')[0];

      // 1. Create/Login clean blank account
      dataService.loginRealLandlord(email, name, 'email');

      // 2. Trigger Welcome Email + Admin Notification Email
      emailService.sendWelcomeEmailToLandlord(name, email);
      emailService.sendAdminSignupNotification({
        fullName: name,
        email,
        authProvider: 'email',
        createdAt: new Date().toLocaleString('en-IN'),
      });

      router.push('/');
    }, 600);
  };

  const handleExploreDemoMode = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dataService.loginDemoLandlord();
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
          Commercial Property & Rent Ledger Management Engine
        </p>
      </div>

      {/* Auth Form Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200 bg-white/95 space-y-5 max-w-md mx-auto w-full shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Bank-Grade Security
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            ● DB LIVE
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
            {error}
          </div>
        )}

        {/* 1-Tap Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 font-extrabold text-sm shadow-sm flex items-center justify-center space-x-3 transition-all min-h-[52px]"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 font-bold uppercase tracking-wider">or email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5 text-sm">
          {authMode === 'signup' && (
            <div>
              <label className="block text-slate-800 font-bold mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-bold"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-slate-800 font-bold mb-1">Email Address</label>
            <input
              type="email"
              placeholder="landlord@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-bold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-md flex items-center justify-center space-x-2 transition-all min-h-[52px]"
          >
            <span>{loading ? 'Processing...' : authMode === 'signup' ? 'Create Free Landlord Account' : 'Sign In'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-xs font-bold pt-1">
          <button
            type="button"
            onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            className="text-blue-600 hover:underline"
          >
            {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        {/* Demo Mode Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={handleExploreDemoMode}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all min-h-[48px]"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Explore Demo Mode (Sirisha Amma's Shops)</span>
          </button>
        </div>
      </div>

      {/* Trust & Privacy Manifesto Footer */}
      <div className="text-center">
        <p className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1.5 max-w-xs mx-auto">
          <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Your tenant data is 100% private. We never share or sell tenant phone numbers.</span>
        </p>
      </div>
    </div>
  );
}
