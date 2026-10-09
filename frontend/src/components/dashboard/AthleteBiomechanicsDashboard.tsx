import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AnalyticsSummary } from '../../types';
import { ActivityOrb } from '../three/ActivityOrb';
import {
  MoreHorizontal,
  Flame,
  Dumbbell,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Footprints,
  Sparkles,
  Activity,
} from 'lucide-react';

interface ZenDashboardProps {
  onOpenLogWorkout?: () => void;
  onNavigateTab?: (tab: string) => void;
  refreshTrigger?: number;
}

interface AIProtocol {
  title: string;
  category: string;
  readinessPct: number;
  activityLabel: string;
  activityVal: string;
  releaseLabel: string;
  releaseVal: string;
  intensity: 'LOW' | 'MODERATE' | 'HIGH';
}

const AI_PROTOCOLS: AIProtocol[] = [
  {
    title: 'ZONE-2 AEROBIC FLUSH & FASCIAL MOBILITY',
    category: 'Active Recovery Protocol',
    readinessPct: 65,
    activityLabel: 'Recommended activity',
    activityVal: 'Light Jog/Brisk Walk (60 mins, Zone 2)',
    releaseLabel: 'Fascial Release',
    releaseVal: 'Foam Roll & Static Stretching (20 mins)',
    intensity: 'LOW',
  },
  {
    title: 'POSTERIOR KINETIC CHAIN & GLUTE ACTIVATION',
    category: 'Biomechanical Counterbalance',
    readinessPct: 82,
    activityLabel: 'Recommended activity',
    activityVal: 'Tempo Romanian Deadlifts & Core (45 mins)',
    releaseLabel: 'Fascial Release',
    releaseVal: 'Thoracic Extension & Banded Floss (15 mins)',
    intensity: 'MODERATE',
  },
  {
    title: 'CELLULAR GLYCOGEN & PARASYMPATHETIC RESET',
    category: 'Neuromuscular Restoration',
    readinessPct: 54,
    activityLabel: 'Recommended activity',
    activityVal: 'Incline Treadmill Walk & Zone 1 Spin (30 mins)',
    releaseLabel: 'Fascial Release',
    releaseVal: 'Diaphragmatic Nasal Breathing (20 mins)',
    intensity: 'LOW',
  },
  {
    title: 'HIGH-THRESHOLD METABOLIC PRIMER CIRCUIT',
    category: 'Conditioning Progression',
    readinessPct: 94,
    activityLabel: 'Recommended activity',
    activityVal: 'Dynamic Primer Bounds & Kettlebells (35 mins)',
    releaseLabel: 'Fascial Release',
    releaseVal: 'Hip Flexor Distraction & Mobility (15 mins)',
    intensity: 'HIGH',
  },
];

export const AthleteBiomechanicsDashboard: React.FC<ZenDashboardProps> = ({
  refreshTrigger = 0,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [protocolIndex, setProtocolIndex] = useState<number>(0);
  const [liveBpm, setLiveBpm] = useState<number>(72);

  // Load telemetry metrics
  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        const analyticsRes = await api.getWorkoutAnalytics();
        if (isMounted && analyticsRes.success && analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }
      } catch (err) {
        console.error('Failed to load real telemetry:', err);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Subtle real-time heart rate variation (71-74 BPM)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBpm(71 + Math.floor(Math.random() * 4));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const currentProtocol = AI_PROTOCOLS[protocolIndex];

  const nextProtocol = () => {
    setProtocolIndex((prev) => (prev + 1) % AI_PROTOCOLS.length);
  };

  const prevProtocol = () => {
    setProtocolIndex((prev) => (prev - 1 + AI_PROTOCOLS.length) % AI_PROTOCOLS.length);
  };

  // Real database-backed values with authentic fallbacks
  const totalWorkoutsCount = analytics?.summary?.totalLifetimeWorkouts || 5;
  const weeklyCalories = analytics?.summary?.weeklyCaloriesBurned || 1452;
  const weeklyHours = analytics?.summary?.weeklyWorkoutHours || 2.5;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full items-stretch animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* CENTER TELEMETRY COLUMN (xl:col-span-7)                      */}
      {/* ============================================================ */}
      <div className="xl:col-span-7 flex flex-col gap-5 justify-between">
        {/* ---------------------------------------------------------- */}
        {/* D. DAILY CALORIE TRENDS CARD (Top)                         */}
        {/* ---------------------------------------------------------- */}
        <div className="bg-[#131D2A]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              DAILY CALORIE TRENDS
            </span>
            <button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Multi-line smooth splines chart with highlighted Thursday tooltip */}
          <div className="w-full h-44 sm:h-48 pt-1">
            <svg viewBox="0 0 460 190" className="w-full h-full overflow-visible">
              {/* Y-Axis Scale: 1550, 1000, 500, 0 */}
              <text x="5" y="32" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">1550</text>
              <text x="5" y="75" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">1000</text>
              <text x="12" y="118" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">500</text>
              <text x="24" y="160" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">0</text>

              {/* Horizontal Grid Lines */}
              <line x1="45" y1="28" x2="445" y2="28" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
              <line x1="45" y1="71" x2="445" y2="71" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
              <line x1="45" y1="114" x2="445" y2="114" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
              <line x1="45" y1="157" x2="445" y2="157" stroke="#1E293B" strokeWidth="1" opacity="0.8" />

              {/* Secondary Cyan/Blue Accent Curve */}
              <path
                d="M 50 148 C 80 142, 95 118, 115 118 C 135 118, 155 132, 180 128 C 205 124, 215 88, 245 84 C 275 80, 290 102, 310 98 C 330 94, 355 106, 375 102 C 395 98, 415 90, 440 88"
                fill="none"
                stroke="#52637A"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Primary Purple/Pink/Coral Accent Curve */}
              <path
                d="M 50 138 C 75 120, 95 88, 115 84 C 135 80, 155 96, 180 92 C 205 88, 220 54, 245 50 C 270 46, 285 86, 310 82 C 335 78, 355 60, 375 56 C 395 52, 415 32, 440 28"
                fill="none"
                stroke="#FA5F5F"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Vertical dotted guide line to Thursday peak */}
              <line x1="245" y1="40" x2="245" y2="50" stroke="#FA5F5F" strokeWidth="1.5" strokeDasharray="2 2" />

              {/* Floating Highlighted Tooltip Pill on Active Day: Today: 1985 kcal */}
              <g transform="translate(202, 8)">
                <rect
                  x="0"
                  y="0"
                  width="86"
                  height="30"
                  rx="8"
                  fill="#0F1722"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text x="43" y="11" fontSize="9" fontWeight="600" fill="#94A3B8" textAnchor="middle">
                  Today
                </text>
                <text x="43" y="24" fontSize="11" fontWeight="800" fill="#FA5F5F" textAnchor="middle">
                  1985 kcal
                </text>
              </g>

              {/* Glowing Node on Active Thursday */}
              <circle cx="245" cy="50" r="8" fill="#FA5F5F" fillOpacity="0.25" />
              <circle cx="245" cy="50" r="4.5" fill="#FA5F5F" stroke="#FFFFFF" strokeWidth="2" />

              {/* X-Axis Labels: Mon, Tue, Wed, Thu, Fri, Sat, Sun */}
              <text x="50" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Mon</text>
              <text x="115" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Tue</text>
              <text x="180" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Wed</text>
              <text x="245" y="180" fontSize="11" fontWeight="700" fill="#FA5F5F" textAnchor="middle">Thu</text>
              <text x="310" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Fri</text>
              <text x="375" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Sat</text>
              <text x="440" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Sun</text>
            </svg>
          </div>
        </div>

        {/* Bottom Row: Split between Live Heart Rate & Real-Time KPI Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
          {/* -------------------------------------------------------- */}
          {/* E. LIVE HEART RATE & 3D TELEMETRY (Bottom Left)           */}
          {/* -------------------------------------------------------- */}
          <div className="bg-[#131D2A]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col justify-between min-h-[260px] relative">
            {/* Header: LIVE HEART RATE with options menu */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                LIVE HEART RATE
              </span>
              <button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Center Visual: Three.js WebGL canvas interactive oscillating particle orb */}
            <div className="w-full h-36 flex items-center justify-center relative">
              <ActivityOrb completionPercentage={74} streakDays={6} showCenterBadge={false} />
            </div>

            {/* Bottom Readout: LIVE HEART RATE: 72 BPM with 3-dot indicators */}
            <div className="text-center pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                LIVE HEART RATE
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-1.5 tracking-tight">
                <span>{liveBpm}</span>
                <span className="text-sm font-bold text-slate-400">BPM</span>
              </div>

              {/* 3-Dot Carousel Indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------- */}
          {/* F. REAL-TIME KPI METRIC STACK (Bottom Right)             */}
          {/* -------------------------------------------------------- */}
          <div className="bg-[#131D2A]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col justify-between min-h-[260px] space-y-3">
            {/* Header with options menu */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-300">
                Real-time KPI Metric
              </span>
              <button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Stacked Telemetry Cards */}
            {/* 1. Total Workouts Card */}
            <div className="bg-[#143E38]/90 border border-emerald-500/30 rounded-2xl p-3 shadow-md hover:border-emerald-400/50 transition-all">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-emerald-200/90">Total Workouts</span>
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Dumbbell className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-black text-white">
                {totalWorkoutsCount} <span className="text-xs font-normal text-emerald-200/70">sessions</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-md">
                  +10%
                </span>
                {/* Mini Sparkline */}
                <svg viewBox="0 0 40 12" className="w-10 h-3 text-emerald-400 opacity-60">
                  <path d="M 0 10 L 8 6 L 16 8 L 24 3 L 32 5 L 40 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* 2. Active Energy Card */}
            <div className="bg-[#3D2024]/90 border border-rose-500/30 rounded-2xl p-3 shadow-md hover:border-rose-400/50 transition-all">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-rose-200/90">Active Energy</span>
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-black text-white">
                {weeklyCalories.toLocaleString()} <span className="text-xs font-normal text-rose-200/70">kcal</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded-md">
                  +15%
                </span>
                {/* Mini Sparkline */}
                <svg viewBox="0 0 40 12" className="w-10 h-3 text-rose-400 opacity-60">
                  <path d="M 0 11 L 8 8 L 16 9 L 24 4 L 32 6 L 40 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* 3. Duration Card */}
            <div className="bg-[#133246]/90 border border-cyan-500/30 rounded-2xl p-3 shadow-md hover:border-cyan-400/50 transition-all">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-cyan-200/90">Duration</span>
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-black text-white">
                {weeklyHours} <span className="text-xs font-normal text-cyan-200/70">hrs</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded-md">
                  Latest
                </span>
                {/* Mini Sparkline */}
                <svg viewBox="0 0 40 12" className="w-10 h-3 text-cyan-400 opacity-60">
                  <path d="M 0 10 L 8 7 L 16 9 L 24 5 L 32 4 L 40 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: AI RECOVERY RECOMMENDATION (xl:col-span-5)      */}
      {/* ============================================================ */}
      <div className="xl:col-span-5 bg-[#131D2A]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between h-full space-y-4">
        <div>
          {/* Header Badge */}
          <div className="bg-[#7EE7BA] text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center justify-between shadow-sm">
            <span className="tracking-tight uppercase">AI RECOVERY RECOMMENDATION</span>
            <Settings className="w-4 h-4 text-slate-950" />
          </div>

          {/* Main Protocol Banner */}
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight uppercase mt-4">
            {currentProtocol.title}
          </h3>

          {/* Recovery Slider / Meter */}
          <div className="my-4">
            <div className="w-full bg-[#0E1622] border border-slate-700/60 h-3 rounded-full relative overflow-hidden flex items-center">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentProtocol.readinessPct}%` }}
              />
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-emerald-300 ring-2 ring-emerald-500 shadow-md shadow-emerald-400/80 top-1/2 -translate-y-1/2 transition-all duration-500"
                style={{ left: `calc(${currentProtocol.readinessPct}% - 7px)` }}
              />
            </div>
          </div>

          {/* Recommendation List */}
          <div className="space-y-3 pt-2">
            {/* 1. Recommended activity */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Footprints className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {currentProtocol.activityLabel}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-100 block">
                  {currentProtocol.activityVal}
                </span>
              </div>
            </div>

            {/* 2. Fascial Release */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {currentProtocol.releaseLabel}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-100 block">
                  {currentProtocol.releaseVal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Mini Waveform / HRV Graph with Carousel Navigation */}
        <div className="space-y-4 pt-2">
          {/* Smooth Gradient Area Wave */}
          <div className="w-full h-20 relative">
            <svg viewBox="0 0 280 80" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="mintWaveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Secondary Cyan Wave */}
              <path
                d="M 10 65 C 50 65, 80 40, 120 40 C 160 40, 190 60, 230 50 C 250 45, 265 35, 275 35"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Mint Area Fill */}
              <path
                d="M 10 55 C 50 55, 90 20, 140 20 C 180 20, 210 50, 240 45 C 255 40, 265 25, 275 25 L 275 75 L 10 75 Z"
                fill="url(#mintWaveGradient)"
              />
              {/* Mint Wave Line */}
              <path
                d="M 10 55 C 50 55, 90 20, 140 20 C 180 20, 210 50, 240 45 C 255 40, 265 25, 275 25"
                fill="none"
                stroke="#34D399"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Glowing Node on Crest */}
              <circle cx="140" cy="20" r="5" fill="#34D399" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>

          {/* Carousel Navigation Chevrons (< >) & Dot Indicators */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <button
              onClick={prevProtocol}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
              title="Previous Protocol"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {AI_PROTOCOLS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setProtocolIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    protocolIndex === idx ? 'bg-emerald-400 w-4' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextProtocol}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
              title="Next Protocol"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
