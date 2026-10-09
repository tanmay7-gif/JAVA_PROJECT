import React, { useState, useEffect } from 'react';
import { AnalyticsSummary } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CompactChartTooltip } from '../analytics/CompactChartTooltip';
import {
  Flame,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Dumbbell,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

interface WorkoutAnalyticsChartsProps {
  refreshTrigger: number;
}

const INTENSITY_COLORS: Record<string, string> = {
  LOW: '#10B981',    // Fluorescent Mint
  MEDIUM: '#F59E0B', // Vibrant Amber
  HIGH: '#F43F5E',   // Neon Rose
};

export const WorkoutAnalyticsCharts: React.FC<WorkoutAnalyticsChartsProps> = ({
  refreshTrigger,
}) => {
  const { showToast } = useToast();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
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
        showToast(err.message || 'Failed to load workout analytics.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshTrigger, showToast]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-cyan-400">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
          Generating clinical charts & biometric telemetry...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, dailyTrend, intensityBreakdown, typeBreakdown } = data;

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Hours */}
        <div className="bg-[#131C2E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl text-slate-100 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Weekly Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.2)]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {summary.weeklyWorkoutHours}
            </span>
            <span className="text-xs font-semibold text-slate-400">Hours</span>
          </div>
          <p className="text-[11px] text-teal-400 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Rolling 7-day cumulative time
          </p>
        </div>

        {/* Weekly Calories */}
        <div className="bg-[#131C2E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl text-slate-100 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Energy Output
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {summary.weeklyCaloriesBurned.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">kcal</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold mt-2">Active metabolic burn</p>
        </div>

        {/* Active Challenges */}
        <div className="bg-[#131C2E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl text-slate-100 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Milestones
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {summary.activeChallengesCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">Goals</span>
          </div>
          <p className="text-[11px] text-amber-400 font-semibold mt-2">Badges being unlocked</p>
        </div>

        {/* Lifetime Workouts */}
        <div className="bg-[#131C2E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl text-slate-100 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Logged
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {summary.totalLifetimeWorkouts}
            </span>
            <span className="text-xs font-semibold text-slate-400">Sessions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {summary.totalLifetimeHours} lifetime hours
          </p>
        </div>
      </div>

      {/* Primary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Calorie Burn (High-Frequency Multi-Stop Neon Gradient Area Chart) */}
        <div className="bg-[#131C2E]/85 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col text-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" />
                Caloric Expenditure Gradient
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Daily energy burn across all activities</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              7-Day Pacing
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="workoutCalorieGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.8} />
                    <stop offset="40%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="85%" stopColor="#059669" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#0B131E" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="workoutAreaGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#06B6D4" floodOpacity="0.5" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.7} vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
                
                {/* Compact Tooltip */}
                <Tooltip
                  content={<CompactChartTooltip unit="kcal" />}
                  offset={12}
                  cursor={{ stroke: 'rgba(6, 182, 212, 0.45)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />

                <Area
                  type="monotone"
                  dataKey="calories"
                  name="Calories Burned"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#workoutCalorieGradient)"
                  filter="url(#workoutAreaGlow)"
                  activeDot={{
                    r: 5.5,
                    fill: '#06B6D4',
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Workout Duration by Day (High-Frequency 3D Shaded Bar Chart) */}
        <div className="bg-[#131C2E]/85 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col text-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Active Training Minutes
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Session length recorded per day</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Minutes
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="workoutBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="60%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <filter id="barDropShadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#10B981" floodOpacity="0.35" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.7} vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
                
                {/* Compact Tooltip */}
                <Tooltip
                  content={<CompactChartTooltip unit="mins" />}
                  offset={12}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                />

                <Bar
                  dataKey="duration"
                  name="Duration"
                  fill="url(#workoutBarGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                  filter="url(#barDropShadow)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Intensity Breakdown & Discipline Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut: Intensity Breakdown */}
        <div className="bg-[#131C2E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col text-slate-100">
          <div className="mb-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Intensity Distribution
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Effort breakdown by RPE</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {intensityBreakdown.every((i) => i.value === 0) ? (
              <p className="text-xs text-slate-400">No intensity metrics logged yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={intensityBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {intensityBreakdown.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={INTENSITY_COLORS[entry.name] || '#10B981'}
                        stroke="#0B131E"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  
                  {/* Compact Tooltip */}
                  <Tooltip
                    content={<CompactChartTooltip unit="sessions" />}
                    offset={12}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-slate-300 font-semibold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Discipline / Type Progress Bars */}
        <div className="lg:col-span-2 bg-[#131C2E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between text-slate-100">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-cyan-400" />
                Discipline Frequency
              </h4>
              <span className="text-xs text-slate-400">Lifetime Distribution</span>
            </div>

            <div className="space-y-3.5">
              {typeBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Log workouts to reveal discipline breakdown</p>
              ) : (
                typeBreakdown.map((t) => {
                  const maxCount = Math.max(...typeBreakdown.map((item) => item.count), 1);
                  const percentage = Math.round((t.count / maxCount) * 100);

                  return (
                    <div key={t.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{t.name}</span>
                        <span className="text-slate-400 font-medium">
                          {t.count} session{t.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#0B131E] overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Clinical Formula: Metabolic Equivalent of Task</span>
            <span className="text-cyan-400 font-bold">Auto-Calibrated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
