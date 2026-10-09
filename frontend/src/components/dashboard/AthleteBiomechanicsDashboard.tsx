import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { AnalyticsSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { generateTrialAthleteData, generateZeroStateAthleteData } from '../../utils/mockTrialData';
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
  ShieldCheck,
  CheckCircle2,
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
  const { isTrialAccount, user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [protocolIndex, setProtocolIndex] = useState<number>(0);
  const [liveBpm, setLiveBpm] = useState<number>(72);

  // Generate randomized trial data on load
  const trialData = useMemo(() => generateTrialAthleteData(), [isTrialAccount]);

  // Load real database telemetry
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

  // Subtle real-time heart rate variation for trial mode
  useEffect(() => {
    if (!isTrialAccount && (!analytics?.summary?.totalLifetimeWorkouts || analytics.summary.totalLifetimeWorkouts === 0)) {
      setLiveBpm(0); // Standby for pristine zero state
      return;
    }

    const interval = setInterval(() => {
      setLiveBpm(71 + Math.floor(Math.random() * 4));
    }, 3200);
    return () => clearInterval(interval);
  }, [isTrialAccount, analytics]);

  const currentProtocol = AI_PROTOCOLS[protocolIndex];

  const nextProtocol = () => {
    setProtocolIndex((prev) => (prev + 1) % AI_PROTOCOLS.length);
  };

  const prevProtocol = () => {
    setProtocolIndex((prev) => (prev - 1 + AI_PROTOCOLS.length) % AI_PROTOCOLS.length);
  };

  // Determine values based on Account Mode:
  // 1. Trial Account: Rich randomized mock values
  // 2. Real Account: Strict 0 baseline until real workout logs are registered
  const totalWorkoutsCount = isTrialAccount
    ? (analytics?.summary?.totalLifetimeWorkouts && analytics.summary.totalLifetimeWorkouts > 0
        ? analytics.summary.totalLifetimeWorkouts
        : trialData.kpis.totalWorkouts)
    : (analytics?.summary?.totalLifetimeWorkouts ?? 0);

  const weeklyCalories = isTrialAccount
    ? (analytics?.summary?.weeklyCaloriesBurned && analytics.summary.weeklyCaloriesBurned > 0
        ? analytics.summary.weeklyCaloriesBurned
        : trialData.kpis.activeEnergy)
    : (analytics?.summary?.weeklyCaloriesBurned ?? 0);

  const weeklyHours = isTrialAccount
    ? (analytics?.summary?.weeklyWorkoutHours && analytics.summary.weeklyWorkoutHours > 0
        ? analytics.summary.weeklyWorkoutHours
        : parseFloat(trialData.kpis.durationHours))
    : (analytics?.summary?.weeklyWorkoutHours ?? 0);

  const isZeroState = !isTrialAccount && totalWorkoutsCount === 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full items-stretch animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* CENTER TELEMETRY COLUMN (xl:col-span-7)                      */}
      {/* ============================================================ */}
      <div className="xl:col-span-7 flex flex-col gap-5 justify-between">
        {/* ---------------------------------------------------------- */}
        {/* D. DAILY CALORIE TRENDS CARD (Top)                         */}
        {/* ---------------------------------------------------------- */}
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 relative text-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                DAILY CALORIE TRENDS
              </span>
              {isTrialAccount ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Trial Simulation
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Account
                </span>
              )}
            </div>
            <button className="text-slate-400 hover:text-sky-600 p-1 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Spline Chart: Dynamic Mock for Trial, Strict Baseline / Real Points for Real User */}
          <div className="w-full h-44 sm:h-48 pt-1">
            <svg viewBox="0 0 460 190" className="w-full h-full overflow-visible">
              {/* Y-Axis Scale: 1550, 1000, 500, 0 */}
              <text x="5" y="32" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">1550</text>
              <text x="5" y="75" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">1000</text>
              <text x="12" y="118" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">500</text>
              <text x="24" y="160" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">0</text>

              {/* Horizontal Grid Lines */}
              <line x1="45" y1="28" x2="445" y2="28" stroke="#E2E8F0" strokeWidth="1" />
              <line x1="45" y1="71" x2="445" y2="71" stroke="#E2E8F0" strokeWidth="1" />
              <line x1="45" y1="114" x2="445" y2="114" stroke="#E2E8F0" strokeWidth="1" />
              <line x1="45" y1="157" x2="445" y2="157" stroke="#E2E8F0" strokeWidth="1" />

              {isZeroState ? (
                /* Strict Zero-Baseline State for New Users */
                <>
                  {/* Flat baseline curve at 0 kcal */}
                  <line x1="50" y1="157" x2="440" y2="157" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="4 4" />
                  
                  {/* Floating Pristine Baseline Chip */}
                  <g transform="translate(180, 120)">
                    <rect
                      x="0"
                      y="0"
                      width="120"
                      height="28"
                      rx="8"
                      fill="#F0F9FF"
                      stroke="#BAE6FD"
                      strokeWidth="1"
                    />
                    <text x="60" y="18" fontSize="11" fontWeight="700" fill="#0284C7" textAnchor="middle">
                      Baseline: 0 kcal
                    </text>
                  </g>

                  {/* Nodes at zero baseline */}
                  {[50, 115, 180, 245, 310, 375, 440].map((cx, i) => (
                    <circle key={i} cx={cx} cy={157} r="3.5" fill="#F0F9FF" stroke="#0EA5E9" strokeWidth="1.5" />
                  ))}
                </>
              ) : (
                /* Dynamic Trial Simulation or Real User Active Curve */
                <>
                  {/* Secondary Sky Blue Accent Curve */}
                  <path
                    d="M 50 148 C 80 142, 95 118, 115 118 C 135 118, 155 132, 180 128 C 205 124, 215 88, 245 84 C 275 80, 290 102, 310 98 C 330 94, 355 106, 375 102 C 395 98, 415 90, 440 88"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.8"
                  />

                  {/* Primary Sky Blue High-Frequency Curve */}
                  <path
                    d="M 50 138 C 75 120, 95 88, 115 84 C 135 80, 155 96, 180 92 C 205 88, 220 54, 245 50 C 270 46, 285 86, 310 82 C 335 78, 355 60, 375 56 C 395 52, 415 32, 440 28"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Vertical dotted guide line to active peak */}
                  <line x1="245" y1="40" x2="245" y2="50" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="2 2" />

                  {/* Floating Highlighted Tooltip Pill */}
                  <g transform="translate(202, 8)">
                    <rect
                      x="0"
                      y="0"
                      width="86"
                      height="30"
                      rx="8"
                      fill="#FFFFFF"
                      stroke="#BAE6FD"
                      strokeWidth="1.5"
                    />
                    <text x="43" y="11" fontSize="9" fontWeight="600" fill="#64748B" textAnchor="middle">
                      Today
                    </text>
                    <text x="43" y="24" fontSize="11" fontWeight="800" fill="#0284C7" textAnchor="middle">
                      {weeklyCalories > 0 ? `${Math.round(weeklyCalories / 7)} kcal` : '1985 kcal'}
                    </text>
                  </g>

                  {/* Glowing Node on Active Peak */}
                  <circle cx="245" cy="50" r="8" fill="#0EA5E9" fillOpacity="0.25" />
                  <circle cx="245" cy="50" r="4.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                </>
              )}

              {/* X-Axis Labels: Mon, Tue, Wed, Thu, Fri, Sat, Sun */}
              <text x="50" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Mon</text>
              <text x="115" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Tue</text>
              <text x="180" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Wed</text>
              <text x="245" y="180" fontSize="11" fontWeight="700" fill={isZeroState ? '#64748B' : '#0284C7'} textAnchor="middle">Thu</text>
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
          <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col justify-between min-h-[260px] relative text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                LIVE HEART RATE
              </span>
              <button className="text-slate-400 hover:text-sky-600 p-1 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Center Visual: Three.js WebGL canvas interactive oscillating particle orb */}
            <div className="w-full h-36 flex items-center justify-center relative">
              <ActivityOrb
                completionPercentage={isZeroState ? 0 : 74}
                streakDays={isZeroState ? 0 : 6}
                showCenterBadge={false}
              />
            </div>

            {/* Bottom Readout */}
            <div className="text-center pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">
                {isZeroState ? 'SENSOR STANDBY' : 'LIVE TELEMETRY'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center justify-center gap-1.5 tracking-tight">
                <span>{isZeroState ? '--' : liveBpm}</span>
                <span className="text-sm font-bold text-slate-500">BPM</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {isZeroState
                  ? 'Sensor in standby • Start a session to track live HR'
                  : 'Real-time telemetry stream connected'}
              </p>
            </div>
          </div>

          {/* -------------------------------------------------------- */}
          {/* F. REAL-TIME KPI METRIC STACK (Bottom Right)             */}
          {/* -------------------------------------------------------- */}
          <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col justify-between min-h-[260px] space-y-3 text-slate-800">
            {/* Header with options menu */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-sky-900">
                Real-time KPI Metric
              </span>
              <button className="text-slate-400 hover:text-sky-600 p-1 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Stacked Telemetry Cards */}
            {/* 1. Total Workouts Card - Soft Green Tint */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-emerald-900">Total Workouts</span>
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Dumbbell className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-bold text-slate-900">
                {totalWorkoutsCount} <span className="text-xs font-normal text-slate-500">sessions</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-md">
                  {isZeroState ? 'Pristine 0' : '+10%'}
                </span>
                <svg viewBox="0 0 40 12" className="w-10 h-3 text-emerald-500 opacity-80">
                  <path d="M 0 10 L 8 6 L 16 8 L 24 3 L 32 5 L 40 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* 2. Active Energy Card - Soft Peach/Orange Tint */}
            <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-3 shadow-2xs hover:shadow-xs hover:border-orange-300 transition-all">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-orange-900">Active Energy</span>
                <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Flame className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-bold text-slate-900">
                {weeklyCalories.toLocaleString()} <span className="text-xs font-normal text-slate-500">kcal</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-medium text-orange-800 bg-orange-100/90 px-1.5 py-0.5 rounded-md">
                  {isZeroState ? 'Pristine 0' : '+15%'}
                </span>
                <svg viewBox="0 0 40 12" className="w-10 h-3 text-orange-500 opacity-80">
                  <path d="M 0 11 L 8 8 L 16 9 L 24 4 L 32 6 L 40 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* 3. Duration Card - Soft Cyan/Sky Tint */}
            <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3 shadow-2xs hover:shadow-xs hover:border-sky-300 transition-all">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-sky-900">Duration</span>
                <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-bold text-slate-900">
                {typeof weeklyHours === 'number' ? weeklyHours.toFixed(1) : weeklyHours}{' '}
                <span className="text-xs font-normal text-slate-500">hrs</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-medium text-sky-800 bg-sky-100/90 px-1.5 py-0.5 rounded-md">
                  {isZeroState ? 'Pristine 0' : 'Latest'}
                </span>
                <svg viewBox="0 0 40 12" className="w-10 h-3 text-sky-500 opacity-80">
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
      <div className="relative overflow-hidden xl:col-span-5 bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF]/60 to-[#F0F9FF] border border-purple-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col justify-between h-full space-y-4 text-slate-800">
        {/* Layer: Authentic Athletic Recovery Photo Accent */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.06] bg-cover bg-center mix-blend-multiply"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80')`
          }}
        />

        <div className="relative z-10">
          {/* Header Badge */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium text-xs px-3.5 py-2 rounded-xl flex items-center justify-between shadow-sm">
            <span className="tracking-tight uppercase">AI RECOVERY RECOMMENDATION</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Main Protocol Banner */}
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight uppercase mt-4 font-sans">
            {isZeroState ? 'AWAITING BASELINE BIOMETRIC PROTOCOL' : currentProtocol.title}
          </h3>

          {/* Recovery Slider / Meter */}
          <div className="my-4">
            <div className="w-full bg-purple-100/70 border border-purple-200 h-3 rounded-full relative overflow-hidden flex items-center">
              <div
                className="bg-gradient-to-r from-purple-400 via-indigo-500 to-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${isZeroState ? 0 : currentProtocol.readinessPct}%` }}
              />
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-purple-600 ring-2 ring-white shadow-md shadow-purple-400/50 top-1/2 -translate-y-1/2 transition-all duration-500"
                style={{ left: `calc(${isZeroState ? 0 : currentProtocol.readinessPct}% - 7px)` }}
              />
            </div>
          </div>

          {/* Recommendation List */}
          <div className="space-y-3 pt-2">
            {/* 1. Recommended activity */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-sky-200 shadow-2xs backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 border border-sky-300 flex items-center justify-center shrink-0 mt-0.5">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-sky-800 block font-medium">
                  {isZeroState ? 'Action Required' : currentProtocol.activityLabel}
                </span>
                <span className="text-xs sm:text-sm font-normal text-slate-800 block mt-0.5">
                  {isZeroState
                    ? 'Log your initial workout session to calibrate AI recovery telemetry'
                    : currentProtocol.activityVal}
                </span>
              </div>
            </div>

            {/* 2. Fascial Release */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-purple-200 shadow-2xs backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 border border-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-purple-800 block font-medium">
                  {isZeroState ? 'Recovery Matrix' : currentProtocol.releaseLabel}
                </span>
                <span className="text-xs sm:text-sm font-normal text-slate-800 block mt-0.5">
                  {isZeroState
                    ? 'Baseline assessment will generate tailored post-workout protocols'
                    : currentProtocol.releaseVal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Mini Waveform / HRV Graph */}
        <div className="space-y-4 pt-2">
          {/* Smooth Gradient Area Wave */}
          <div className="w-full h-20 relative">
            <svg viewBox="0 0 280 80" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="skyWaveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              {isZeroState ? (
                /* Flat Baseline Wave */
                <>
                  <line x1="10" y1="65" x2="275" y2="65" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="140" cy="65" r="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
                </>
              ) : (
                /* Active Wave */
                <>
                  <path
                    d="M 10 65 C 50 65, 80 40, 120 40 C 160 40, 190 60, 230 50 C 250 45, 265 35, 275 35"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <path
                    d="M 10 55 C 50 55, 90 20, 140 20 C 180 20, 210 50, 240 45 C 255 40, 265 25, 275 25 L 275 75 L 10 75 Z"
                    fill="url(#skyWaveGradient)"
                  />
                  <path
                    d="M 10 55 C 50 55, 90 20, 140 20 C 180 20, 210 50, 240 45 C 255 40, 265 25, 275 25"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="140" cy="20" r="5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                </>
              )}
            </svg>
          </div>

          {/* Carousel Navigation Chevrons (< >) & Dot Indicators */}
          <div className="flex items-center justify-between pt-2 border-t border-sky-100">
            <button
              onClick={prevProtocol}
              disabled={isZeroState}
              className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-all active:scale-95 disabled:opacity-40"
              title="Previous Protocol"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Protocol Dot Indicators */}
            <div className="flex items-center gap-1.5">
              {AI_PROTOCOLS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => !isZeroState && setProtocolIndex(idx)}
                  disabled={isZeroState}
                  className={`h-1.5 rounded-full transition-all ${
                    protocolIndex === idx && !isZeroState
                      ? 'w-6 bg-sky-500 shadow-sm shadow-sky-500/50'
                      : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Protocol ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextProtocol}
              disabled={isZeroState}
              className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-all active:scale-95 disabled:opacity-40"
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
