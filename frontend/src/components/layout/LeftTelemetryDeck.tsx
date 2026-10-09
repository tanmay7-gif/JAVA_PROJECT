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
      <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isTrialAccount ? 'bg-amber-500 animate-pulse' : 'bg-sky-500'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              ACTIVITY RINGS
            </span>
          </div>
          <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            {isTrialAccount ? 'Trial Mode' : 'Live'}
          </span>
        </div>

        {/* Central Ring Graphic with Concentric Rings & Dynamic Center Label */}
        <div className="relative flex items-center justify-center my-auto py-1">
          <svg viewBox="0 0 340 340" className="w-full max-w-[270px] sm:max-w-[290px] overflow-visible">
            {/* 1. Outer Ring: Move (Rose/Coral stroke #F43F5E) */}
            <circle
              cx="170"
              cy="170"
              r="125"
              fill="none"
              stroke="#FEE2E2"
              strokeWidth="22"
            />
            <circle
              cx="170"
              cy="170"
              r="125"
              fill="none"
              stroke="#F43F5E"
              strokeWidth="22"
              strokeDasharray="785.4"
              strokeDashoffset={785.4 * (1 - Math.min(movePct, 100) / 100)}
              strokeLinecap="round"
              transform="rotate(-90 170 170)"
              className="transition-all duration-1000 ease-out"
            />
            {/* Outer Ring Labels */}
            <text
              x="170"
              y="52"
              fontSize="11"
              fontWeight="bold"
              fill="#64748B"
              textAnchor="middle"
              className="select-none"
            >
              Move
            </text>
            <text
              x="170"
              y="298"
              fontSize="12"
              fontWeight="800"
              fill="#F43F5E"
              textAnchor="middle"
              className="select-none"
            >
              {movePct}%
            </text>

            {/* 2. Middle Ring: Exercise (Sky Blue stroke #0284C7) */}
            <circle
              cx="170"
              cy="170"
              r="92"
              fill="none"
              stroke="#E0F2FE"
              strokeWidth="22"
            />
            <circle
              cx="170"
              cy="170"
              r="92"
              fill="none"
              stroke="#0284C7"
              strokeWidth="22"
              strokeDasharray="578.05"
              strokeDashoffset={578.05 * (1 - Math.min(exercisePct, 100) / 100)}
              strokeLinecap="round"
              transform="rotate(-90 170 170)"
              className="transition-all duration-1000 ease-out"
            />
            {/* Middle Ring Labels */}
            <text
              x="170"
              y="86"
              fontSize="10"
              fontWeight="bold"
              fill="#64748B"
              textAnchor="middle"
              className="select-none"
            >
              Exercise
            </text>
            <text
              x="170"
              y="262"
              fontSize="12"
              fontWeight="800"
              fill="#0284C7"
              textAnchor="middle"
              className="select-none"
            >
              {exercisePct}%
            </text>

            {/* 3. Inner Ring: Stand (Cyan/Aqua stroke #06B6D4) */}
            <circle
              cx="170"
              cy="170"
              r="59"
              fill="none"
              stroke="#E0F2FE"
              strokeWidth="22"
            />
            <circle
              cx="170"
              cy="170"
              r="59"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="22"
              strokeDasharray="370.7"
              strokeDashoffset={370.7 * (1 - Math.min(standPct, 100) / 100)}
              strokeLinecap="round"
              transform="rotate(-90 170 170)"
              className="transition-all duration-1000 ease-out"
            />
            {/* Inner Ring Labels */}
            <text
              x="170"
              y="118"
              fontSize="10"
              fontWeight="bold"
              fill="#64748B"
              textAnchor="middle"
              className="select-none"
            >
              Stand
            </text>
            <text
              x="170"
              y="228"
              fontSize="11"
              fontWeight="800"
              fill="#06B6D4"
              textAnchor="middle"
              className="select-none"
            >
              {standPct}%
            </text>

            {/* Center Data Label */}
            <circle cx="170" cy="170" r="42" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1.5" />
            <g transform="translate(170, 166)">
              <text
                y="0"
                textAnchor="middle"
                fontSize="20"
                fontWeight="900"
                fill="#0F172A"
                className="select-none font-sans"
              >
                {averageTargetPct}%
              </text>
              <text
                y="14"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#64748B"
                letterSpacing="1"
                className="select-none uppercase"
              >
                Target
              </text>
            </g>
          </svg>
        </div>

        {/* Bottom Metric Readouts */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-sky-100 mt-1">
          {/* Move */}
          <div className="p-2 rounded-xl bg-sky-50/50 border border-sky-100/60">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#F43F5E] inline-block" />
              <span className="text-xs font-bold text-[#F43F5E]">Move</span>
            </div>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {moveSteps} <span className="text-[10px] font-medium text-slate-500 block">steps</span>
            </span>
          </div>

          {/* Exercise */}
          <div className="p-2 rounded-xl bg-sky-50/50 border border-sky-100/60">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#0284C7] inline-block" />
              <span className="text-xs font-bold text-[#0284C7]">Exercise</span>
            </div>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {exerciseMins} <span className="text-[10px] font-medium text-slate-500 block">mins</span>
            </span>
          </div>

          {/* Stand */}
          <div className="p-2 rounded-xl bg-sky-50/50 border border-sky-100/60">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] inline-block" />
              <span className="text-xs font-bold text-[#06B6D4]">Stand</span>
            </div>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {standHoursDisplay} <span className="text-[10px] font-medium text-slate-500 block">hours</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CONTEXTUAL METRIC SUB-DECK (Tab-Aware)                    */}
      {/* ============================================================ */}

      {/* A. When on Activity / Workouts Tab */}
      {currentTab === 'workouts' && (
        <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-sky-600" /> Session Telemetry
            </span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              {isZeroState ? 'ZERO BASELINE' : 'ACTIVE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Logged Total</span>
              <span className="text-lg font-black text-slate-900">{totalWorkouts} sessions</span>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Active Time</span>
              <span className="text-lg font-black text-sky-700">
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
        <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" /> Metabolic Pacing
            </span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              {isZeroState ? 'ZERO BASELINE' : 'CALIBRATED'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-500">7-Day Energy Burn</span>
              <span className="font-black text-slate-900">{weeklyCalories.toLocaleString()} kcal</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-500">Daily Average</span>
              <span className="font-black text-sky-700">~{Math.round(weeklyCalories / 7)} kcal/day</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-500">HRV Telemetry</span>
              <span className="font-black text-sky-700">
                {isZeroState ? 'Standby (0 ms)' : '68 ms (Optimal)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* C. When on Goals / Challenges Tab */}
      {currentTab === 'challenges' && (
        <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-500" /> Quest Momentum
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {isZeroState ? 'UNRANKED' : 'TIER 4'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Consecutive</span>
              <span className="text-lg font-black text-sky-700">
                {isZeroState ? '0 Days' : '5 Days'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Quests Won</span>
              <span className="text-lg font-black text-amber-700">
                {isZeroState ? '0 Badges' : '12 Badges'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Community Podium</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {isZeroState ? 'Unranked' : 'Rank #4 Global'}
            </span>
          </div>
        </div>
      )}

      {/* D. When on Plans / Community Guides Tab */}
      {currentTab === 'community' && (
        <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Protocol Status
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {isZeroState ? 'STANDBY' : 'CLINICAL'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
            <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Active Routine</span>
            <span className="text-xs font-bold text-slate-900 block">
              {isZeroState ? 'Pristine Baseline - No Active Protocol' : 'Zone-2 Aerobic Flush & Fascial Mobility'}
            </span>
            <span className="text-[11px] text-sky-700 mt-1 block">
              {isZeroState ? 'Log a workout to activate protocol' : '88% Protocol Compliance'}
            </span>
          </div>
        </div>
      )}

      {/* E. When on Settings / Profile Tab */}
      {currentTab === 'profile' && (
        <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Athlete Profile Vitals
            </span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              VERIFIED
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-500">Resting Heart Rate</span>
              <span className="font-black text-slate-900">{isZeroState ? 'Standby' : '72 BPM'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-500">Biometric Tier</span>
              <span className="font-black text-sky-700">Pro Sports Telemetry</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-500">Account Type</span>
              <span className="font-black text-sky-700">{isTrialAccount ? 'Trial Guest' : 'Verified Personal'}</span>
            </div>
          </div>
        </div>
      )}

      {/* F. Universal Quick Action / Telemetry Badge (shown on Dashboard or default) */}
      {currentTab === 'dashboard' && (
        <div className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Biometrics Sync</span>
              <span className="text-[10px] text-slate-500">
                {isTrialAccount ? 'Trial Calibrated' : isZeroState ? 'Zero Baseline' : 'Live Connected'}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenLogWorkout}
            className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log</span>
          </button>
        </div>
      )}
    </div>
  );
};
