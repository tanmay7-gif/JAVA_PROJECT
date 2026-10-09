import React, { useState } from 'react';
import { AuthModal } from './auth/AuthModal';
import { ActivityOrb } from './three/ActivityOrb';
import {
  Flame,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-gray-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-emerald-100/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-soft-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-mint-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-emerald-500 fill-emerald-500/20 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-700 bg-clip-text text-transparent">
                FitPulse
              </span>
              <span className="text-[10px] block font-semibold uppercase tracking-wider text-emerald-600 -mt-1">
                Clinical Wellness Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAuthMode('LOGIN')}
              className="text-xs font-bold text-gray-700 hover:text-emerald-700 px-3 py-1.5 rounded-xl transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('REGISTER')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Clinical Wellness Messaging */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Clinical Performance & Interactive 3D Telemetry
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Elevate Your Health with{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Clinical Precision.
              </span>
            </h1>

            <p className="text-base text-gray-600 max-w-xl leading-relaxed">
              Designed around clean, clinical wellness aesthetics: primarily crisp white with soft off-whites, glassmorphism, subtle shadows, and light green/mint accents, enriched with interactive, responsive 3D micro-experiences.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-1 max-w-lg">
              <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-white p-2.5 rounded-xl border border-emerald-100 shadow-soft-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                3D Interactive Activity Orb
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-white p-2.5 rounded-xl border border-emerald-100 shadow-soft-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                3D Anatomy Muscle Selector
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-white p-2.5 rounded-xl border border-emerald-100 shadow-soft-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                3D Holographic Badges
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-white p-2.5 rounded-xl border border-emerald-100 shadow-soft-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                3D Global Topology Mesh
              </div>
            </div>

            {/* Stats preview */}
            <div className="pt-4 flex items-center gap-8 border-t border-emerald-100">
              <div>
                <div className="text-2xl font-black text-gray-900">90% White</div>
                <div className="text-[11px] text-gray-500">Crisp Clinical Palette</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">R3F Shaders</div>
                <div className="text-[11px] text-gray-500">React Three Fiber</div>
              </div>
              <div>
                <div className="text-2xl font-black text-teal-600">Zod & Prisma</div>
                <div className="text-[11px] text-gray-500">Strict Type Safety</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Box */}
          <div className="lg:col-span-5 flex justify-center">
            <AuthModal initialMode={authMode} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-white py-6 text-center text-xs text-gray-500 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 FitPulse Platform Inc. Clinical Wellness Edition.</p>
          <div className="flex items-center gap-4 text-gray-600 font-semibold">
            <span>Admin: admin@fitpulse.com</span>
            <span>•</span>
            <span>Athlete: sarah@fitpulse.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
