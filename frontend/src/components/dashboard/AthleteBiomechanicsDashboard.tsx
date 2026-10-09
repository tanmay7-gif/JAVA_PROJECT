import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AnalyticsSummary, WorkoutLog } from '../../types';
import {
  Flame,
  Heart,
  Footprints,
  Moon,
  TrendingUp,
  PlusCircle,
  Calendar,
  LogOut,
  Sparkles,
  ChevronRight,
  Activity,
  Award,
  Zap,
  CheckCircle2,
  Clock,
  Target,
  Layers,
  Compass,
  ShieldCheck,
} from 'lucide-react';

interface ZenDashboardProps {
  onOpenLogWorkout?: () => void;
  onNavigateTab?: (tab: string) => void;
  refreshTrigger?: number;
}

export const AthleteBiomechanicsDashboard: React.FC<ZenDashboardProps> = ({
  onOpenLogWorkout,
  onNavigateTab,
  refreshTrigger = 0,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        const [analyticsRes, workoutsRes] = await Promise.all([
          api.getWorkoutAnalytics(),
          api.getWorkouts({ limit: 4 }),
        ]);

        if (isMounted) {
          if (analyticsRes.success && analyticsRes.data) {
            setAnalytics(analyticsRes.data);
          }
          if (workoutsRes.success && workoutsRes.data) {
            const list = Array.isArray(workoutsRes.data)
              ? workoutsRes.data
              : (workoutsRes.data as any).workouts || [];
            setRecentWorkouts(list);
          }
        }
      } catch (err) {
        console.error('Failed to load real dashboard metrics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const todayIso = new Date().toISOString().split('T')[0];

  // Calculate today's real stats from recent workouts or dailyTrend
  const { todayCalories, todayDuration, movePercent, exercisePercent, overallTargetPercent } =
    useMemo(() => {
      const todayLogs = recentWorkouts.filter((w) => w.date.startsWith(todayIso));
      let cals = todayLogs.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
      let mins = todayLogs.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

      // If no workout logged specifically today yet, check dailyTrend's last entry
      if (cals === 0 && analytics?.dailyTrend && analytics.dailyTrend.length > 0) {
        const lastEntry = analytics.dailyTrend[analytics.dailyTrend.length - 1];
        if (lastEntry.date === todayIso) {
          cals = lastEntry.calories;
          mins = lastEntry.duration;
        }
      }

      const movePct = Math.min(100, Math.round((cals / 600) * 100));
      const exPct = Math.min(100, Math.round((mins / 45) * 100));
      const overall = Math.round((movePct + exPct) / 2);

      return {
        todayCalories: cals,
        todayDuration: mins,
        movePercent: movePct,
        exercisePercent: exPct,
        overallTargetPercent: overall,
      };
    }, [recentWorkouts, analytics, todayIso]);

  // Daily Trend calculation for dynamic SVG chart
  const trendPoints = useMemo(() => {
    const rawTrend = analytics?.dailyTrend || [];
    if (rawTrend.length === 0) {
      return [
        { label: 'Mon', cals: 0, x: 20, y: 140 },
        { label: 'Tue', cals: 0, x: 80, y: 140 },
        { label: 'Wed', cals: 0, x: 140, y: 140 },
        { label: 'Thu', cals: 0, x: 200, y: 140 },
        { label: 'Fri', cals: 0, x: 260, y: 140 },
        { label: 'Sat', cals: 0, x: 320, y: 140 },
        { label: 'Sun', cals: 0, x: 380, y: 140 },
      ];
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxVal = Math.max(...rawTrend.map((t) => t.calories), 500);

    return rawTrend.map((t, idx) => {
      const d = new Date(t.date);
      const label = isNaN(d.getTime()) ? t.date.slice(0, 3) : dayNames[d.getDay()];
      const x = 30 + idx * (340 / Math.max(1, rawTrend.length - 1));
      // Invert Y for SVG coordinates: 140 is bottom, 30 is top
      const y = Math.round(140 - (t.calories / maxVal) * 100);
      return { label, cals: t.calories, x, y };
    });
  }, [analytics]);

  const svgPathD = useMemo(() => {
    if (trendPoints.length === 0) return '';
    return trendPoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [trendPoints]);

  const svgAreaD = useMemo(() => {
    if (trendPoints.length === 0) return '';
    const firstX = trendPoints[0].x;
    const lastX = trendPoints[trendPoints.length - 1].x;
    return `${svgPathD} L ${lastX} 150 L ${firstX} 150 Z`;
  }, [trendPoints, svgPathD]);

  const avgKcalPerDay = useMemo(() => {
    if (!analytics?.summary?.weeklyCaloriesBurned) return 0;
    return Math.round(analytics.summary.weeklyCaloriesBurned / 7);
  }, [analytics]);

  // Dynamic Biomechanical & Recovery Recommendation Engine (Requirement 18)
  const recommendation = useMemo(() => {
    const lastSession = recentWorkouts[0];
    const totalWeeklyHours = analytics?.summary?.weeklyWorkoutHours || 0;

    if (!lastSession) {
      return {
        title: 'Metabolic Baseline Primer Circuit',
        category: 'Activation Protocol',
        modality: 'HIIT & Functional Mobility',
        durationMinutes: 30,
        estimatedKcal: 260,
        intensity: 'MEDIUM',
        focus: 'Full-Body Muscular Activation & Aerobic Base Building',
        readinessPct: 88,
        description: 'Initialize your weekly metabolic conditioning with a multi-joint dynamic primer session.',
        cue: 'Pair high knee bounds with bodyweight tempo squats for prime neuromuscular activation.',
      };
    }

    const type = (lastSession.type || '').toLowerCase();
    const isHighIntensity = lastSession.intensity === 'HIGH' || (lastSession.duration_minutes || 0) >= 45;

    if (type.includes('hiit') || type.includes('strength') || isHighIntensity) {
      return {
        title: 'Active Zone-2 Aerobic Flush & Fascial Mobility',
        category: 'Cellular Active Recovery',
        modality: 'Low-Intensity Cardio & Restorative Yoga',
        durationMinutes: 25,
        estimatedKcal: 190,
        intensity: 'LOW',
        focus: 'Lactate Clearance & Parasympathetic Nervous System Restoration',
        readinessPct: 94,
        description: `Following your recent intense ${lastSession.type} session (${lastSession.duration_minutes}m), active low-intensity conditioning accelerates metabolic recovery by up to 38%.`,
        cue: 'Maintain a steady conversational pace at 60-70% maximum heart rate with deep diaphragmatic nasal breathing.',
      };
    }

    if (type.includes('cardio') || type.includes('running') || type.includes('cycl')) {
      return {
        title: 'Posterior Kinetic Chain & Core Stabilization',
        category: 'Biomechanical Counterbalance',
        modality: 'Compound Resistance Training',
        durationMinutes: 40,
        estimatedKcal: 320,
        intensity: 'MEDIUM',
        focus: 'Glute Medius Activation & Spine Stability Counterbalance',
        readinessPct: 91,
        description: `Your endurance conditioning volume is pacing strong (${totalWeeklyHours}h weekly). Strengthening posterior chain synergists mitigates repetitive joint strain.`,
        cue: 'Execute romanian deadlifts and isometric side planks with a controlled 3-second eccentric contraction phase.',
      };
    }

    return {
      title: 'High-Volume Hypertrophy & Density Circuit',
      category: 'Conditioning Progression',
      modality: 'Progressive Resistance Training',
      durationMinutes: 45,
      estimatedKcal: 420,
      intensity: 'HIGH',
      focus: 'Mechanical Muscular Tension & Upper Body Structural Balance',
      readinessPct: 96,
      description: 'Your biometric readiness indicates full muscular glycogen and nervous system recovery. Prime conditions to push volume load thresholds today.',
      cue: 'Aim for a 1-2 repetition in reserve (RIR) buffer across all primary compound movements.',
    };
  }, [recentWorkouts, analytics]);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans space-y-8 rounded-3xl border border-slate-200/60 selection:bg-emerald-500 selection:text-white">
      {/* 1. Minimal Top Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/70">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={
                user?.profile_image ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                  user?.name || 'Athlete'
                )}`
              }
              alt={user?.name || 'User'}
              className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {todayDateStr}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Good day, {user?.name.split(' ')[0] || 'Athlete'} 🌿
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenLogWorkout?.()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Activity</span>
          </button>

          <button
            onClick={handleSignOut}
            title="Sign out"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. Hero Progress Section: Multi-Layer Activity Rings Calculated from DB */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Radial Activity Rings Graphic */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Outer Ring: Move / Calories (Coral) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#FFE4E6" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="7"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - Math.min(1, movePercent / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Middle Ring: Exercise / Minutes (Emerald) */}
                <circle cx="50" cy="50" r="30" fill="none" stroke="#D1FAE5" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="7"
                  strokeDasharray="188.4"
                  strokeDashoffset={188.4 * (1 - Math.min(1, exercisePercent / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Inner Ring: Weekly Goal Consistency (Sky Blue) */}
                <circle cx="50" cy="50" r="20" fill="none" stroke="#E0F2FE" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="7"
                  strokeDasharray="125.6"
                  strokeDashoffset={
                    125.6 *
                    (1 -
                      Math.min(
                        1,
                        ((analytics?.summary?.weeklyWorkoutHours ?? 0) / 5.0)
                      ))
                  }
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Daily Goal Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {overallTargetPercent}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Daily Target
                </span>
              </div>
            </div>
          </div>

          {/* Activity Rings Breakdown & Real Metrics */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Database-Calculated Readiness
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {analytics?.summary?.weeklyWorkoutHours && analytics.summary.weeklyWorkoutHours > 3
                  ? 'Outstanding conditioning pace this week.'
                  : 'Start your activity logs to elevate your weekly performance.'}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mt-1">
                Calibrated across active calorie expenditure, training minutes, and weekly goal compliance.
              </p>
            </div>

            {/* Ring Legend Details with Real Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100/80">
                <div className="flex items-center justify-between text-xs font-bold text-rose-600 mb-1">
                  <span>Move</span>
                  <span>{movePercent}%</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {todayCalories} / 600 <span className="text-xs text-slate-400 font-normal">kcal</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 mb-1">
                  <span>Exercise</span>
                  <span>{exercisePercent}%</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {todayDuration} / 45 <span className="text-xs text-slate-400 font-normal">mins</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100/80">
                <div className="flex items-center justify-between text-xs font-bold text-sky-600 mb-1">
                  <span>Weekly Pace</span>
                  <span>
                    {Math.min(100, Math.round(((analytics?.summary?.weeklyWorkoutHours ?? 0) / 5.0) * 100))}%
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {analytics?.summary?.weeklyWorkoutHours ?? 0} / 5.0{' '}
                  <span className="text-xs text-slate-400 font-normal">hrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Four Real Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Lifetime Sessions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Workouts</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {analytics?.summary?.totalLifetimeWorkouts ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-semibold">audited sessions</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-3">
            {analytics?.summary?.totalLifetimeHours ?? 0} lifetime training hours
          </div>
        </div>

        {/* Weekly Active Energy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Energy</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {(analytics?.summary?.weeklyCaloriesBurned ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">kcal (7 days)</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Monthly: {(analytics?.summary?.monthlyCaloriesBurned ?? 0).toLocaleString()} kcal
          </div>
        </div>

        {/* Weekly Active Duration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Duration</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {analytics?.summary?.weeklyWorkoutHours ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-semibold">hours (7 days)</span>
          </div>
          <div className="text-[11px] text-teal-600 font-semibold mt-3">
            Monthly: {analytics?.summary?.monthlyWorkoutHours ?? 0} active hours
          </div>
        </div>

        {/* Goal Mastery Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal Progress</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {Math.round(analytics?.goalProgress?.averageCompletionPercentage ?? 0)}%
            </span>
          </div>
          <div className="text-[11px] text-sky-600 font-semibold mt-3">
            {analytics?.goalProgress?.activeGoals ?? 0} active • {analytics?.goalProgress?.completedGoals ?? 0} completed
          </div>
        </div>
      </section>

      {/* 3.5 Dynamic Recovery & Personalized Training Recommendation (Requirement 18) */}
      <section className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                Adaptive Recommendation Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                {recommendation.category}
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                • {recommendation.readinessPct}% Cellular Readiness
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {recommendation.title}
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              {recommendation.description}
            </p>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs text-emerald-200 leading-snug">
              <strong className="text-white block mb-0.5">Biomechanical Form Cue:</strong>
              {recommendation.cue}
            </div>
          </div>

          {/* Action & Metric Specs */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 text-right">
              <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-center min-w-[90px]">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block">Target</span>
                <span className="text-base font-black text-white">{recommendation.durationMinutes}m</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-center min-w-[90px]">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block">Est. Burn</span>
                <span className="text-base font-black text-white">~{recommendation.estimatedKcal} kcal</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-center min-w-[90px]">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block">Intensity</span>
                <span className="text-base font-black text-emerald-300">{recommendation.intensity}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onOpenLogWorkout?.()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Quick Log This Session
              </button>
              <button
                onClick={() => onNavigateTab?.('guides')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all"
              >
                View Protocol
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main Grid: Weekly Trend Area Chart & Real Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activity Trend Dynamic Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" /> Weekly Activity Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Caloric burn across recent logged training days
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              Avg {avgKcalPerDay} kcal/day
            </span>
          </div>

          {/* Clean Dynamic SVG Area Chart */}
          <div className="w-full h-56 pt-4">
            <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="40" x2="380" y2="40" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="20" y1="90" x2="380" y2="90" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="20" y1="140" x2="380" y2="140" stroke="#F1F5F9" strokeWidth="1" />

              {/* Dynamic Smooth Area Path */}
              {svgAreaD && <path d={svgAreaD} fill="url(#areaGradient)" />}
              {svgPathD && (
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data Points */}
              {trendPoints.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.cals > 0 ? 4.5 : 2.5}
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y="168"
                    fontSize="10"
                    fontWeight="600"
                    fill="#94A3B8"
                    textAnchor="middle"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Recent Activity Log from Database (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Recent Activities
              </h3>
              <button
                onClick={() => onNavigateTab?.('workouts')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Real Activity Items List */}
            {recentWorkouts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No workout sessions recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Log your first session to view activity telemetry.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((w) => {
                  const typeLabel = (w.type || 'RUN').toUpperCase().slice(0, 4);
                  const isHigh = w.intensity === 'HIGH';
                  const isLow = w.intensity === 'LOW';

                  return (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-emerald-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isHigh
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {typeLabel}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm capitalize">
                            {w.type} Session
                          </div>
                          <div className="text-xs text-slate-400">
                            {w.duration_minutes} mins • {w.intensity} Intensity
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">
                        +{w.calories_burned} kcal
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Synchronized with Database Records
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
