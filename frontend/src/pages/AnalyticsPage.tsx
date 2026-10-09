import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';
import { useToast } from '../context/ToastContext';
import { ThreeBarChart } from '../components/three/ThreeBarChart';
import { ThreePieChart, PieCategorySlice } from '../components/three/ThreePieChart';
import { CompactChartTooltip } from '../components/analytics/CompactChartTooltip';
import { renderCompactActivePieShape } from '../components/analytics/CompactActivePieShape';
import { CompactSlicePopover } from '../components/analytics/CompactSlicePopover';
import {
  Flame,
  Clock,
  TrendingUp,
  Zap,
  Activity,
  Layers,
  Calendar,
  Sparkles,
  Download,
  Info,
  Target,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type TimeWindow = 'Week' | 'Month' | 'Year' | 'All-Time';
type ActiveMetric = 'calories' | 'duration';
const DynamicPie = Pie as any;

export const AnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('Week');
  const [activeBarMetric, setActiveBarMetric] = useState<ActiveMetric>('calories');
  const [disciplineViewMode, setDisciplineViewMode] = useState<'3D' | '2D'>('3D');
  const [selectedDisciplineSlice, setSelectedDisciplineSlice] = useState<PieCategorySlice | null>(null);
  const [activeDisciplineIndex, setActiveDisciplineIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await api.getWorkoutAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to fetch biometric analytics telemetry.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [showToast]);

  // Transform backend dailyTrend for 3D Bar Chart - dynamic calendar fallback if none
  const formattedBarData = React.useMemo(() => {
    if (!data?.dailyTrend || data.dailyTrend.length === 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const emptyDays = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        emptyDays.push({
          day: dayNames[d.getDay()],
          date: `${monthNames[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`,
          calories: 0,
          duration: 0,
        });
      }
      return emptyDays;
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return data.dailyTrend.map((item) => {
      const d = new Date(item.date);
      const dayName = isNaN(d.getTime()) ? item.date.slice(0, 3) : dayNames[d.getDay()];
      return {
        day: dayName,
        date: item.date,
        calories: item.calories,
        duration: item.duration,
      };
    });
  }, [data]);

  // Transform backend workout type breakdown for 3D/2D Pie Chart with high-frequency neon colors
  const formattedPieData: PieCategorySlice[] = React.useMemo(() => {
    if (!data?.typeBreakdown || data.typeBreakdown.length === 0) {
      return [];
    }

    const totalCount = data.typeBreakdown.reduce((sum, item) => sum + item.count, 0) || 1;
    const colors = ['#06B6D4', '#10B981', '#8B5CF6', '#F59E0B', '#F43F5E'];
    const emissiveColors = ['#22D3EE', '#34D399', '#A78BFA', '#FBBF24', '#FB7185'];

    return data.typeBreakdown.map((t, idx) => ({
      name: t.name,
      value: Math.round((t.count / totalCount) * 100),
      color: colors[idx % colors.length],
      emissiveColor: emissiveColors[idx % emissiveColors.length],
      sessionsCount: t.count,
    }));
  }, [data]);

  const summary = React.useMemo(() => {
    return {
      weeklyWorkoutHours: data?.summary?.weeklyWorkoutHours ?? 0,
      weeklyCaloriesBurned: data?.summary?.weeklyCaloriesBurned ?? 0,
      monthlyWorkoutHours: data?.summary?.monthlyWorkoutHours ?? 0,
      monthlyCaloriesBurned: data?.summary?.monthlyCaloriesBurned ?? 0,
      weeklyWorkoutsCount: data?.summary?.weeklyWorkoutsCount ?? 0,
      monthlyWorkoutsCount: data?.summary?.monthlyWorkoutsCount ?? 0,
      activeChallengesCount: data?.summary?.activeChallengesCount ?? 0,
      totalLifetimeCalories: data?.summary?.totalLifetimeCalories ?? 0,
      totalLifetimeWorkouts: data?.summary?.totalLifetimeWorkouts ?? 0,
      totalLifetimeHours: data?.summary?.totalLifetimeHours ?? 0,
    };
  }, [data]);

  const burnVelocity = React.useMemo(() => {
    if (summary.weeklyWorkoutHours <= 0) return 0;
    return Math.round(summary.weeklyCaloriesBurned / (summary.weeklyWorkoutHours * 60));
  }, [summary]);

  if (isLoading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-3 text-cyan-400">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Synthesizing 3D Telemetry Laboratory...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-sky-500" />
            3D Biometric Telemetry & Analytics Laboratory
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Biometric Performance Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive WebGL 3D volumetric metrics, energy burn acceleration, and multi-discipline distribution.
          </p>
        </div>

        {/* Time Window Selectors */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['Week', 'Month', 'Year', 'All-Time'] as TimeWindow[]).map((w) => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeWindow === w
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <button
            onClick={() => showToast('Exporting clinical biometric telemetry report (CSV)...', 'info')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-sky-50 text-slate-700 hover:text-sky-600 shadow-sm transition-all"
            title="Export Report"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Active Volume */}
        <div className="bg-sky-50/80 border border-sky-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-sky-800">
              Active Duration
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {summary.weeklyWorkoutHours}
            </span>
            <span className="text-xs font-normal text-slate-500">hours (7d)</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Monthly: {summary.monthlyWorkoutHours} hrs
          </p>
        </div>

        {/* Energy Output */}
        <div className="bg-orange-50/80 border border-orange-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-orange-800">
              Metabolic Output
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-200">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {summary.weeklyCaloriesBurned.toLocaleString()}
            </span>
            <span className="text-xs font-normal text-slate-500">kcal (7d)</span>
          </div>
          <p className="text-[11px] text-orange-700/80 font-normal mt-2">
            Monthly: {summary.monthlyCaloriesBurned.toLocaleString()} kcal
          </p>
        </div>

        {/* Efficiency Index */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-800">
              Burn Velocity
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {burnVelocity}
            </span>
            <span className="text-xs font-normal text-slate-500">kcal / min</span>
          </div>
          <p className="text-[11px] text-amber-700/80 font-medium mt-2">
            {burnVelocity > 0 ? 'Active metabolic burn rate' : 'No active volume'}
          </p>
        </div>

        {/* Lifetime Logged */}
        <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-purple-800">
              Audited Sessions
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {summary.totalLifetimeWorkouts}
            </span>
            <span className="text-xs font-normal text-slate-500">sessions</span>
          </div>
          <p className="text-[11px] text-purple-700/80 font-normal mt-2 truncate">
            {summary.totalLifetimeHours} lifetime hrs • {summary.totalLifetimeCalories.toLocaleString()} kcal
          </p>
        </div>
      </div>

      {/* Progress Tracking Matrices: Weekly/Monthly Activity, Goal Progress, Challenge Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Weekly & Monthly Activity Card */}
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" /> Activity Horizons
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                Live Data
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Weekly vs Monthly Activity</h4>
            <div className="mt-3 space-y-3">
              <div className="bg-sky-100/70 p-3 rounded-xl border border-sky-200">
                <div className="flex items-center justify-between text-xs font-semibold text-sky-950">
                  <span>Last 7 Days (Weekly)</span>
                  <span className="text-sky-700 font-bold">{summary.weeklyWorkoutsCount} workouts</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 font-normal">
                  <span>{summary.weeklyWorkoutHours} hrs duration</span>
                  <span>{summary.weeklyCaloriesBurned.toLocaleString()} kcal</span>
                </div>
              </div>

              <div className="bg-sky-100/70 p-3 rounded-xl border border-sky-200">
                <div className="flex items-center justify-between text-xs font-semibold text-sky-950">
                  <span>Last 30 Days (Monthly)</span>
                  <span className="text-teal-700 font-bold">{summary.monthlyWorkoutsCount} workouts</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 font-normal">
                  <span>{summary.monthlyWorkoutHours} hrs duration</span>
                  <span>{summary.monthlyCaloriesBurned.toLocaleString()} kcal</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-sky-200 text-[11px] text-slate-600 flex items-center gap-1 font-normal">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audited directly against database workout logs</span>
          </div>
        </div>

        {/* Goal Progress Card */}
        <div className="bg-gradient-to-br from-[#F0FDF4] to-[#E0F2FE]/60 border border-emerald-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" /> Goal Mastery
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {data?.goalProgress?.activeGoals ?? 0} Active
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Fitness Goals Progress</h4>
            <div className="mt-3 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {Math.round(data?.goalProgress?.averageCompletionPercentage ?? 0)}%
                </span>
                <span className="text-xs text-slate-500 font-normal">Avg Completion</span>
              </div>
              
              {/* Progress Bar with High-Frequency Glow */}
              <div className="w-full bg-emerald-100 rounded-full h-2.5 overflow-hidden border border-emerald-200">
                <div
                  className="bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-500 h-2.5 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(0, data?.goalProgress?.averageCompletionPercentage ?? 0))}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div className="text-xs font-bold text-sky-700">{data?.goalProgress?.activeGoals ?? 0}</div>
                  <div className="text-[10px] text-slate-500 font-normal">Active Goals</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-700">{data?.goalProgress?.completedGoals ?? 0}</div>
                  <div className="text-[10px] text-slate-500 font-normal">Completed</div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-emerald-200 text-[11px] text-slate-600 flex items-center gap-1 font-normal">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>Target milestones calibrated in Athlete Profile</span>
          </div>
        </div>

        {/* Challenge Progress Card */}
        <div className="bg-gradient-to-br from-[#FFFBEB] to-[#E0F2FE]/60 border border-amber-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" /> Arena Progress
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {data?.challengeProgress?.enrolledChallenges ?? 0} Enrolled
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Challenges & Arena Completion</h4>
            <div className="mt-3 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {Math.round(data?.challengeProgress?.completionRate ?? 0)}%
                </span>
                <span className="text-xs text-slate-500 font-normal">Completion Rate</span>
              </div>

              {/* Progress Bar with High-Frequency Amber Glow */}
              <div className="w-full bg-amber-100 rounded-full h-2.5 overflow-hidden border border-amber-200">
                <div
                  className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 h-2.5 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(0, data?.challengeProgress?.completionRate ?? 0))}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
                  <div className="text-xs font-bold text-amber-700">{data?.challengeProgress?.enrolledChallenges ?? 0}</div>
                  <div className="text-[10px] text-slate-500 font-normal">Total Joined</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
                  <div className="text-xs font-bold text-emerald-700">{data?.challengeProgress?.completedChallenges ?? 0}</div>
                  <div className="text-[10px] text-slate-500 font-normal">Completed</div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-amber-200 text-[11px] text-slate-600 flex items-center gap-1 font-normal">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Badge rewards deposited into athletic trophy case</span>
          </div>
        </div>
      </div>

      {/* Primary 3D Visualizations Dual Laboratory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Volumetric Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold uppercase tracking-wider border border-sky-200">
                  <Activity className="w-3 h-3 text-sky-600" />
                  3D Volumetric Telemetry
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Daily Volume & Caloric Load
                </h3>
                <p className="text-xs text-slate-600">
                  Interactive 3D raycast bars with extruded bevel rims. Hover to inspect metrics.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-500 block">Active Mode</span>
                <span className="text-xs font-bold text-sky-600 capitalize">
                  {activeBarMetric}
                </span>
              </div>
            </div>

            {/* 3D Volumetric Bar Chart */}
            <ThreeBarChart
              data={formattedBarData}
              activeMetric={activeBarMetric}
              onMetricToggle={setActiveBarMetric}
              heightClass="h-80"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-sky-200 text-[11px] text-slate-600 flex items-center justify-between font-medium">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              Dynamic height transitions calibrated to daily totals
            </span>
            <span className="text-sky-700 font-bold">WebGL Shaded</span>
          </div>
        </div>

        {/* Discipline Distribution: 3D WebGL / 2D Recharts with Compact Active State (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-slate-800 flex flex-col justify-between relative">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-wider border border-sky-200">
                  <Layers className="w-3 h-3 text-sky-500" />
                  Discipline Distribution
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Biomechanical Focus
                </h3>
                <p className="text-xs text-slate-500">
                  {disciplineViewMode === '3D'
                    ? 'Interactive WebGL cylinders. Click slice to inspect details.'
                    : 'Precision Recharts donut. Click slice to inspect compact details.'}
                </p>
              </div>

              {/* View Switcher: 3D WebGL vs 2D Precision Donut */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                <button
                  onClick={() => setDisciplineViewMode('3D')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    disciplineViewMode === '3D'
                      ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  3D WebGL
                </button>
                <button
                  onClick={() => setDisciplineViewMode('2D')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    disciplineViewMode === '2D'
                      ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  2D Donut
                </button>
              </div>
            </div>

            {/* Chart Area */}
            {disciplineViewMode === '3D' ? (
              <ThreePieChart
                data={formattedPieData}
                selectedSliceName={selectedDisciplineSlice?.name || null}
                onSliceSelect={(slice) => {
                  setSelectedDisciplineSlice(slice);
                  if (!slice) setActiveDisciplineIndex(null);
                }}
                heightClass="h-80"
              />
            ) : (
              <div className="h-80 w-full flex flex-col items-center justify-center relative">
                {formattedPieData.length === 0 ? (
                  <p className="text-xs text-slate-400">No discipline data recorded yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <DynamicPie
                        data={formattedPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={84}
                        paddingAngle={4}
                        dataKey="sessionsCount"
                        nameKey="name"
                        activeIndex={activeDisciplineIndex !== null ? activeDisciplineIndex : undefined}
                        activeShape={renderCompactActivePieShape}
                        onClick={(_: any, index: number) => {
                          const nextIdx = activeDisciplineIndex === index ? null : index;
                          setActiveDisciplineIndex(nextIdx);
                          setSelectedDisciplineSlice(nextIdx !== null ? formattedPieData[nextIdx] : null);
                        }}
                        cursor="pointer"
                      >
                        {formattedPieData.map((entry) => (
                          <Cell
                            key={`cell-${entry.name}`}
                            fill={entry.color}
                            stroke="#FFFFFF"
                            strokeWidth={2}
                          />
                        ))}
                      </DynamicPie>
                      <Tooltip content={<CompactChartTooltip unit="sessions" />} offset={12} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {/* Compact Slice Click Popover Card (Constrained to max-w-[210px], never oversized) */}
            {selectedDisciplineSlice && (
              <div className="mt-3 flex justify-center">
                <CompactSlicePopover
                  slice={selectedDisciplineSlice}
                  onClose={() => {
                    setSelectedDisciplineSlice(null);
                    setActiveDisciplineIndex(null);
                  }}
                  title="Discipline Breakdown"
                  metricLabel="Logged Sessions"
                />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{disciplineViewMode === '3D' ? 'Lift: +0.12 Y-offset' : 'Bound: +2.5px ring'}</span>
            <span className="text-sky-600 font-bold">
              {disciplineViewMode === '3D' ? 'Chamfered Cylinders' : 'Compact Active Sector'}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary 2D Curved Volumetric Area Trend Line with High-Frequency 3D Shading */}
      <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-300 transition-all relative overflow-hidden text-slate-800">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              Volumetric Energy Expenditure Curve
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              High-frequency multi-stop gradient telemetry detailing continuous energy pacing across selected time-window.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 shadow-sm">
            {timeWindow} Window
          </span>
        </div>

        <div className="h-64 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data?.dailyTrend || []}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {/* Clean Clinical Sky Blue Multi-Stop Linear Gradient */}
                <linearGradient id="clinicalSkyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.25} />
                  <stop offset="65%" stopColor="#38BDF8" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.8} vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
              
              {/* Compact Tooltip Chip with coordinate offset */}
              <Tooltip
                content={<CompactChartTooltip unit="kcal" />}
                offset={12}
                cursor={{ stroke: 'rgba(14, 165, 233, 0.45)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              />

              <Area
                type="monotone"
                dataKey="calories"
                name="Caloric Burn"
                stroke="#0284C7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#clinicalSkyGradient)"
                activeDot={{
                  r: 6,
                  fill: '#0284C7',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
