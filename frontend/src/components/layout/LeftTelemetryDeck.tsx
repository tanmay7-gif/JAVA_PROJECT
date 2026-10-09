import React, { useMemo } from 'react';
import { AnalyticsSummary } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { generateTrialAthleteData } from '../../utils/mockTrialData';
import {
  MoreHorizontal,
  Flame,
  Dumbbell,
  Clock,
  Target,
  Sparkles,
  PlusCircle,
  TrendingUp,
  Activity,
  Award,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LeftTelemetryDeckProps {
  currentTab: string; // 'dashboard' | 'workouts' | 'analytics' | 'challenges' | 'community' | 'profile'
  analytics: AnalyticsSummary | null;
  onOpenLogWorkout?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const LeftTelemetryDeck: React.FC<LeftTelemetryDeckProps> = ({
  currentTab,
  analytics,
  onOpenLogWorkout,
  onNavigateTab,
}) => {
  const { isTrialAccount } = useAuth();
  const trialData = useMemo(() => generateTrialAthleteData(), [isTrialAccount]);

  // Account Mode Dependent Values:
  // 1. Trial Account: Rich randomized mock values
  // 2. Real Account: Strict 0 baseline until user performs live actions
  const totalWorkouts = isTrialAccount
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

  // Activity Ring Percentages
  const movePct = isTrialAccount
    ? trialData.activityRings.move.percentage
    : weeklyCalories > 0
    ? Math.min(100, Math.round((weeklyCalories / 1500) * 100))
    : 0;

  const exercisePct = isTrialAccount
    ? trialData.activityRings.exercise.percentage
    : weeklyHours > 0
    ? Math.min(100, Math.round(((weeklyHours * 60) / 60) * 100))
    : 0;

  const standPct = isTrialAccount
    ? trialData.activityRings.stand.percentage
    : totalWorkouts > 0
    ? Math.min(100, Math.round(((analytics?.summary?.weeklyWorkoutsCount || 1) / 7) * 100))
    : 0;

  // Readouts
  const moveSteps = isTrialAccount
    ? trialData.activityRings.move.current.toLocaleString()
    : weeklyCalories > 0
    ? Math.round(weeklyCalories * 12).toLocaleString()
    : '0';

  const exerciseMins = isTrialAccount
    ? trialData.activityRings.exercise.current
    : weeklyHours > 0
    ? Math.round(weeklyHours * 60)
    : 0;

  const standHoursDisplay = isTrialAccount
    ? `${trialData.activityRings.stand.current}/12`
    : totalWorkouts > 0
    ? `${Math.min(12, (analytics?.summary?.weeklyWorkoutsCount || 1) * 2)}/12`
    : '0/12';

  const averageTargetPct = isTrialAccount
    ? 100
    : Math.round((movePct + exercisePct + standPct) / 3);

  const isZeroState = !isTrialAccount && totalWorkouts === 0;

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* ============================================================ */}
      {/* 1. HERO METRIC CARD: ACTIVITY RINGS                          */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-[#EBF5FF] to-[#DDF0FF] border border-sky-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isTrialAccount ? 'bg-amber-500 animate-pulse' : 'bg-sky-500'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-950">
              ACTIVITY RINGS
            </span>
          </div>
          <span className="text-[10px] font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-200 shadow-2xs">
            {isTrialAccount ? 'Trial Mode' : 'Live'}
          </span>
        </div>

        {/* Central Ring Graphic with Concentric 3D Physically Tangible Rings */}
        <div className="relative flex items-center justify-center my-auto py-1">
          <svg viewBox="0 0 340 340" className="w-full max-w-[270px] sm:max-w-[290px] overflow-visible">
            <defs>
              {/* Physical Depth Drop Shadow for Elevated Arcs */}
              <filter id="ringDepthShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#0F172A" floodOpacity="0.25" />
              </filter>

              {/* Recessed Trough Groove Shadow */}
              <filter id="recessedTrackShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.08" />
              </filter>

              {/* Center Disc Physical Depth */}
              <filter id="centerDiscShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="4" floodColor="#0284C7" floodOpacity="0.16" />
              </filter>

              {/* Cylindrical Concentric Linear Gradients */}
              <linearGradient id="moveGradient3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
              <linearGradient id="exerciseGradient3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="standGradient3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
              <linearGradient id="centerDiscGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#F0F9FF" />
              </linearGradient>
            </defs>

            {/* Recessed Track Troughs (Grooved into Card Surface) */}
            <circle
              cx="170"
              cy="170"
              r="125"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="22"
              opacity="0.65"
              filter="url(#recessedTrackShadow)"
            />
            <circle
              cx="170"
              cy="170"
              r="92"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="22"
              opacity="0.65"
              filter="url(#recessedTrackShadow)"
            />
            <circle
              cx="170"
              cy="170"
              r="59"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="22"
              opacity="0.65"
              filter="url(#recessedTrackShadow)"
            />

            {/* 1. Outer Ring: Move (Rose/Coral 3D Arc) */}
            <circle
              cx="170"
              cy="170"
              r="125"
              fill="none"
              stroke="url(#moveGradient3D)"
              strokeWidth="22"
              strokeDasharray="785.4"
              strokeDashoffset={785.4 * (1 - Math.min(movePct, 100) / 100)}
              strokeLinecap="round"
              filter="url(#ringDepthShadow)"
              transform="rotate(-90 170 170)"
              className="transition-all duration-1000 ease-out"
            />
            {/* Outer Ring Labels */}
            <text
              x="170"
              y="52"
              fontSize="11"
              fontWeight="600"
              fill="#64748B"
              textAnchor="middle"
              className="select-none tracking-tight"
            >
              Move
            </text>
            <text
              x="170"
              y="298"
              fontSize="12"
              fontWeight="700"
              fill="#E11D48"
              textAnchor="middle"
              className="select-none font-mono"
            >
              {movePct}%
            </text>

            {/* 2. Middle Ring: Exercise (Sky Blue 3D Arc) */}
            <circle
              cx="170"
              cy="170"
              r="92"
              fill="none"
              stroke="url(#exerciseGradient3D)"
              strokeWidth="22"
              strokeDasharray="578.05"
              strokeDashoffset={578.05 * (1 - Math.min(exercisePct, 100) / 100)}
              strokeLinecap="round"
              filter="url(#ringDepthShadow)"
              transform="rotate(-90 170 170)"
              className="transition-all duration-1000 ease-out"
            />
            {/* Middle Ring Labels */}
            <text
              x="170"
              y="86"
              fontSize="10"
              fontWeight="600"
              fill="#64748B"
              textAnchor="middle"
              className="select-none tracking-tight"
            >
              Exercise
            </text>
            <text
              x="170"
              y="262"
              fontSize="12"
              fontWeight="700"
              fill="#0284C7"
              textAnchor="middle"
              className="select-none font-mono"
            >
              {exercisePct}%
            </text>

            {/* 3. Inner Ring: Stand (Teal/Emerald 3D Arc) */}
            <circle
              cx="170"
              cy="170"
              r="59"
              fill="none"
              stroke="url(#standGradient3D)"
              strokeWidth="22"
              strokeDasharray="370.7"
              strokeDashoffset={370.7 * (1 - Math.min(standPct, 100) / 100)}
              strokeLinecap="round"
              filter="url(#ringDepthShadow)"
              transform="rotate(-90 170 170)"
              className="transition-all duration-1000 ease-out"
            />
            {/* Inner Ring Labels */}
            <text
              x="170"
              y="118"
              fontSize="10"
              fontWeight="600"
              fill="#64748B"
              textAnchor="middle"
              className="select-none tracking-tight"
            >
              Stand
            </text>
            <text
              x="170"
              y="228"
              fontSize="11"
              fontWeight="700"
              fill="#0D9488"
              textAnchor="middle"
              className="select-none font-mono"
            >
              {standPct}%
            </text>

            {/* Center Data Label Disc */}
            <circle
              cx="170"
              cy="170"
              r="42"
              fill="url(#centerDiscGrad)"
              stroke="#BAE6FD"
              strokeWidth="1.5"
              filter="url(#centerDiscShadow)"
            />
            <g transform="translate(170, 166)">
              <text
                y="0"
                textAnchor="middle"
                fontSize="22"
                fontWeight="700"
                fill="#0369A1"
                className="select-none font-sans tracking-tight"
              >
                {averageTargetPct}%
              </text>
              <text
                y="14"
                textAnchor="middle"
                fontSize="9"
                fontWeight="500"
                fill="#64748B"
                letterSpacing="1.2"
                className="select-none uppercase tracking-wider"
              >
                Target
              </text>
            </g>
          </svg>
        </div>

        {/* Bottom Metric Readouts */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-sky-200/80 mt-1">
          {/* Move */}
          <div className="p-2.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#E11D48] inline-block" />
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800">Move</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
              {moveSteps} <span className="text-[10px] font-normal text-slate-500 block">steps</span>
            </span>
          </div>

          {/* Exercise */}
          <div className="p-2.5 rounded-2xl bg-sky-50/90 border border-sky-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#0284C7] inline-block" />
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800">Exercise</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
              {exerciseMins} <span className="text-[10px] font-normal text-slate-500 block">mins</span>
            </span>
          </div>

          {/* Stand */}
          <div className="p-2.5 rounded-2xl bg-teal-50/90 border border-teal-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] inline-block" />
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">Stand</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
              {standHoursDisplay} <span className="text-[10px] font-normal text-slate-500 block">hours</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CONTEXTUAL METRIC SUB-DECK (Tab-Aware)                    */}
      {/* ============================================================ */}

      {/* A. When on Activity / Workouts Tab */}
      {currentTab === 'workouts' && (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-sky-200/70">
            <span className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-sky-600" /> Session Telemetry
            </span>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-100/90 px-2 py-0.5 rounded-md border border-sky-300">
              {isZeroState ? 'ZERO BASELINE' : 'ACTIVE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-sky-100/70 border border-sky-200 text-sky-900 shadow-2xs">
              <span className="text-[10px] font-bold text-sky-700 block mb-0.5">Logged Total</span>
              <span className="text-lg font-black text-slate-900">{totalWorkouts} sessions</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">Active Time</span>
              <span className="text-lg font-black text-emerald-950">
                {typeof weeklyHours === 'number' ? weeklyHours.toFixed(1) : weeklyHours} hrs
              </span>
            </div>
          </div>

          <button
            onClick={onOpenLogWorkout}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Session</span>
          </button>
        </div>
      )}

      {/* B. When on Data / Analytics Tab */}
      {currentTab === 'analytics' && (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-sky-200/70">
            <span className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" /> Metabolic Pacing
            </span>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-100/90 px-2 py-0.5 rounded-md border border-sky-300">
              {isZeroState ? 'ZERO BASELINE' : 'CALIBRATED'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs shadow-2xs">
              <span className="text-amber-800 font-normal">7-Day Energy Burn</span>
              <span className="font-semibold text-slate-900">{weeklyCalories.toLocaleString()} <span className="font-normal text-slate-500">kcal</span></span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-100/70 border border-sky-200 text-sky-900 text-xs shadow-2xs">
              <span className="text-sky-800 font-normal">Daily Average</span>
              <span className="font-semibold text-sky-950">~{Math.round(weeklyCalories / 7)} <span className="font-normal text-slate-500">kcal/day</span></span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs shadow-2xs">
              <span className="text-emerald-800 font-normal">HRV Telemetry</span>
              <span className="font-semibold text-emerald-950">
                {isZeroState ? 'Standby (0 ms)' : '68 ms (Optimal)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* C. When on Goals / Challenges Tab */}
      {currentTab === 'challenges' && (
        <div className="bg-gradient-to-br from-[#FDF2F8]/80 to-[#F0F9FF] border border-rose-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-rose-300 transition-all space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200/70">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-500" /> Quest Momentum
            </span>
            <span className="text-[10px] font-medium text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded-md border border-rose-300">
              {isZeroState ? 'UNRANKED' : 'TIER 4'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 shadow-2xs">
              <span className="text-[10px] font-normal text-rose-700 block mb-0.5">Consecutive</span>
              <span className="text-lg font-bold text-rose-950">
                {isZeroState ? '0 Days' : '5 Days'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 shadow-2xs">
              <span className="text-[10px] font-normal text-amber-700 block mb-0.5">Quests Won</span>
              <span className="text-lg font-bold text-amber-950">
                {isZeroState ? '0 Badges' : '12 Badges'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-violet-50/80 border border-violet-200 text-violet-900 flex items-center justify-between text-xs shadow-2xs">
            <span className="text-violet-800 font-normal">Community Podium</span>
            <span className="font-semibold text-violet-950 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {isZeroState ? 'Unranked' : 'Rank #4 Global'}
            </span>
          </div>
        </div>
      )}

      {/* D. When on Plans / Community Guides Tab with Contextual Image Accent */}
      {currentTab === 'community' && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-200/90 bg-gradient-to-br from-[#FFFBEB]/90 to-[#F0F9FF] p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all space-y-3 text-slate-800">
          <div 
            className="pointer-events-none absolute inset-0 opacity-[0.07] bg-cover bg-center mix-blend-multiply"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80')`
            }}
          />
          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-amber-200/70">
            <span className="text-xs font-semibold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Protocol Status
            </span>
            <span className="text-[10px] font-medium text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300">
              {isZeroState ? 'STANDBY' : 'CLINICAL'}
            </span>
          </div>

          <div className="relative z-10 p-3.5 rounded-2xl bg-white/80 border border-amber-200 text-amber-900 shadow-2xs backdrop-blur-xs">
            <span className="text-[10px] font-medium text-amber-700 block mb-0.5">Active Routine</span>
            <span className="text-xs font-semibold text-slate-900 block leading-snug">
              {isZeroState ? 'Pristine Baseline - No Active Protocol' : 'Zone-2 Aerobic Flush & Fascial Mobility'}
            </span>
            <span className="text-[11px] font-normal text-sky-700 mt-1.5 block">
              {isZeroState ? 'Log a workout to activate protocol' : '88% Protocol Compliance'}
            </span>
          </div>
        </div>
      )}

      {/* E. When on Settings / Profile Tab */}
      {currentTab === 'profile' && (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-sky-200/70">
            <span className="text-xs font-semibold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Athlete Profile Vitals
            </span>
            <span className="text-[10px] font-medium text-sky-800 bg-sky-100/90 px-2 py-0.5 rounded-md border border-sky-300">
              VERIFIED
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs shadow-2xs">
              <span className="text-rose-800 font-normal">Resting Heart Rate</span>
              <span className="font-semibold text-slate-900">{isZeroState ? 'Standby' : '72 BPM'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-100/70 border border-sky-200 text-sky-900 text-xs shadow-2xs">
              <span className="text-sky-800 font-normal">Biometric Tier</span>
              <span className="font-semibold text-sky-950">Pro Sports Telemetry</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs shadow-2xs">
              <span className="text-emerald-800 font-normal">Account Type</span>
              <span className="font-semibold text-emerald-950">{isTrialAccount ? 'Trial Guest' : 'Verified Personal'}</span>
            </div>
          </div>
        </div>
      )}

      {/* F. Universal Quick Action with Authentic Athletic Image Accent */}
      {currentTab === 'dashboard' && (
        <div className="relative overflow-hidden rounded-3xl border border-sky-200/90 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/80 p-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-slate-800">
          <div 
            className="pointer-events-none absolute inset-0 opacity-[0.08] bg-cover bg-center mix-blend-multiply"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80')`
            }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="w-9 h-9 rounded-2xl bg-white border border-sky-200 text-sky-600 flex items-center justify-center shadow-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Biometrics Sync</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {isTrialAccount ? 'Trial Calibrated • 100 Hz' : isZeroState ? 'Zero Baseline Standby' : 'Live Connected • 100 Hz'}
                </span>
              </div>
            </div>
            <button
              onClick={onOpenLogWorkout}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-semibold shadow-sm shadow-sky-300 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
