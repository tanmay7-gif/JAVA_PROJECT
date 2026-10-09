import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AnalyticsSummary, WorkoutLog, UserChallenge } from '../../types';
import { ActivityOrb } from '../three/ActivityOrb';
import {
  Flame,
  Clock,
  Award,
  PlusCircle,
  TrendingUp,
  Activity,
  Calendar,
  ChevronRight,
  Zap,
  Target,
  Dumbbell,
  Droplet,
  Sparkles,
} from 'lucide-react';

interface UserDashboardViewProps {
  onOpenLogWorkout: () => void;
  onNavigateTab: (tab: string) => void;
  refreshTrigger: number;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  onOpenLogWorkout,
  onNavigateTab,
  refreshTrigger,
}) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [waterGlasses, setWaterGlasses] = useState<number>(6); // Hydration metric
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [analyticsRes, workoutsRes, challengesRes] = await Promise.all([
          api.getWorkoutAnalytics(),
          api.getWorkouts({ limit: 4 }),
          api.getMyChallenges(),
        ]);

        if (analyticsRes.success && analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }
        if (workoutsRes.success && workoutsRes.data) {
          setRecentWorkouts(workoutsRes.data.workouts);
        }
        if (challengesRes.success && challengesRes.data) {
          setActiveChallenges(challengesRes.data.active);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Syncing biometric telemetry...
        </p>
      </div>
    );
  }

  const summary = analytics?.summary || {
    weeklyWorkoutHours: 0,
    weeklyCaloriesBurned: 0,
    activeChallengesCount: 0,
    totalLifetimeCalories: 0,
    totalLifetimeWorkouts: 0,
    totalLifetimeHours: 0,
  };

  const completionPct = Math.min(100, Math.round((summary.weeklyWorkoutHours / 5) * 100)) || 65;

  return (
    <div className="space-y-6">
      {/* Hero 3D Telemetry Banner (Clinical White + 3D Activity Orb) */}
      <div className="clinical-card p-6 border border-emerald-100 bg-gradient-to-br from-white via-[#FAFCFA] to-[#F0FDF4] overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Greeting and Progress */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Clinical Performance Engine
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Good afternoon, {user?.name.split(' ')[0]} 🌿
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed max-w-lg">
              You are currently pacing at <strong className="text-emerald-700">{summary.weeklyWorkoutHours} hours</strong> of active conditioning this week. Your 3D metabolic orb is oscillating in dynamic response to your training volume.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onOpenLogWorkout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Log Workout Session
              </button>

              <button
                onClick={() => onNavigateTab('analytics')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-emerald-200/80 transition-all shadow-soft-sm"
              >
                View Detailed Trends
              </button>
            </div>
          </div>

          {/* Right Column: Interactive 3D Activity Orb */}
          <div className="lg:col-span-5 h-64 sm:h-72 w-full flex items-center justify-center relative">
            <ActivityOrb completionPercentage={completionPct} streakDays={6} />
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Burned */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="clinical-card p-5 cursor-pointer hover:border-emerald-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Weekly Energy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {summary.weeklyCaloriesBurned.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-semibold">kcal</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Calculated via dynamic MET
          </div>
        </div>

        {/* Weekly Hours */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="clinical-card p-5 cursor-pointer hover:border-emerald-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Duration</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {summary.weeklyWorkoutHours}
            </span>
            <span className="text-xs text-gray-500 font-semibold">hrs</span>
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-2">Target: 5.0 hrs/wk</div>
        </div>

        {/* Hydration Tracker */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Daily Hydration</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{waterGlasses}</span>
              <span className="text-xs text-gray-500 font-semibold">/ 8 glasses</span>
            </div>
            <button
              onClick={() => setWaterGlasses((prev) => Math.min(12, prev + 1))}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-lg transition-colors"
            >
              + Drink
            </button>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}
            />
          </div>
        </div>

        {/* Active Challenges */}
        <div
          onClick={() => onNavigateTab('challenges')}
          className="clinical-card p-5 cursor-pointer hover:border-emerald-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Challenge Badges</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {summary.activeChallengesCount}
            </span>
            <span className="text-xs text-gray-500 font-semibold">Active</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-2">
            3D Holographic Medals
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Workouts & Challenge Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Workouts Table Feed (7 cols) */}
        <div className="lg:col-span-7 clinical-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Recent Conditioning Logs
              </h3>
              <button
                onClick={() => onNavigateTab('workouts')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                View full audit <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentWorkouts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No recent workouts recorded. Click "Log Workout Session" to initiate.
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((w) => {
                  let badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (w.intensity === 'MEDIUM') badge = 'bg-amber-50 text-amber-700 border-amber-200';
                  if (w.intensity === 'HIGH') badge = 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-xl bg-[#FAFCFA] border border-emerald-100/80 flex items-center justify-between gap-3 hover:bg-emerald-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200/70 flex items-center justify-center text-emerald-700 font-bold text-xs shadow-soft-sm">
                          {w.type.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{w.type}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${badge}`}>
                              {w.intensity}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-xs mt-0.5">
                            {w.notes || `${w.duration_minutes}m active training`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-emerald-700 text-xs flex items-center justify-end gap-1">
                          <Flame className="w-3.5 h-3.5 text-emerald-500" />
                          {w.calories_burned} kcal
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {new Date(w.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Challenges with Mint Progress Bars (5 cols) */}
        <div className="lg:col-span-5 clinical-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Active Challenges
              </h3>
              <button
                onClick={() => onNavigateTab('challenges')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                Trophy Case <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeChallenges.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No active challenges. Enroll in the Challenges tab to earn badges.
              </div>
            ) : (
              <div className="space-y-4">
                {activeChallenges.slice(0, 3).map((uc) => {
                  const percent = uc.progress_percentage || 0;
                  return (
                    <div
                      key={uc.id}
                      className="p-4 rounded-xl bg-[#FAFCFA] border border-emerald-100/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                          {uc.challenge.title}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          <Award className="w-3 h-3 text-emerald-600" />
                          {uc.challenge.reward_badge}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>
                          {uc.current_progress.toLocaleString()} / {uc.challenge.target_value.toLocaleString()} {uc.challenge.target_metric.toLowerCase()}
                        </span>
                        <span className="font-extrabold text-emerald-600">{percent}%</span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-3">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-900 leading-snug">
              <strong className="block text-emerald-950 mb-0.5">Clinical Telemetry Active:</strong>
              All completed workouts automatically increment your challenge progress metrics and dynamically adjust the 3D activity core pulse.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
