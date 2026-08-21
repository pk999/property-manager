'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, X, Smartphone, CheckCircle2 } from 'lucide-react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Detect if already installed / standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(Boolean(standalone));

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Android / Chrome Install Prompt Listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || bannerDismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setBannerDismissed(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="mb-4">
      {/* iOS Safari Instruction Banner */}
      {isIos && (
        <div className="glass-card rounded-2xl p-4 border border-blue-200 bg-white space-y-2 shadow-sm text-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">Install PropertyManager on iPhone</h4>
            </div>

            <button onClick={() => setBannerDismissed(true)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            Tap the Safari <Share className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> <strong>Share button</strong> at the bottom of your screen, then select <strong>"Add to Home Screen"</strong>.
          </p>
        </div>
      )}

      {/* Android Chrome 1-Click Install Banner */}
      {!isIos && deferredPrompt && (
        <div className="glass-card rounded-2xl p-4 border border-emerald-200 bg-white space-y-2 shadow-sm text-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Install PropertyManager App</h4>
                <p className="text-xs text-slate-500 font-medium">1-Tap offline access & instant reminders</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                Install App
              </button>

              <button onClick={() => setBannerDismissed(true)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
