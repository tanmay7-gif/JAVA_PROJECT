import React, { useState, useEffect } from 'react';
import { AnalyticsSummary } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CompactChartTooltip } from '../analytics/CompactChartTooltip';
import { renderCompactActivePieShape } from '../analytics/CompactActivePieShape';
import { CompactSlicePopover } from '../analytics/CompactSlicePopover';
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

const DynamicPie = Pie as any;

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
  const [activeIntensityIndex, setActiveIntensityIndex] = useState<number | null>(null);

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
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-sky-500">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
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
        <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Weekly Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary.weeklyWorkoutHours}
            </span>
            <span className="text-xs font-semibold text-slate-500">Hours</span>
          </div>
          <p className="text-[11px] text-sky-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Rolling 7-day cumulative time
          </p>
        </div>

        {/* Weekly Calories */}
        <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Energy Output
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-xs">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary.weeklyCaloriesBurned.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">kcal</span>
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-2">Active metabolic burn</p>
        </div>

        {/* Active Challenges */}
        <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Milestones
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary.activeChallengesCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">Goals</span>
          </div>
          <p className="text-[11px] text-sky-600 font-semibold mt-2">Badges being unlocked</p>
        </div>

        {/* Lifetime Workouts */}
        <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Logged
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary.totalLifetimeWorkouts}
            </span>
            <span className="text-xs font-semibold text-slate-500">Sessions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {summary.totalLifetimeHours} lifetime hours
          </p>
        </div>
      </div>

      {/* Primary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Calorie Burn */}
        <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col text-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-sky-500" />
                Caloric Expenditure Gradient
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Daily energy burn across all activities</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              7-Day Pacing
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="workoutCalorieGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                
                {/* Compact Tooltip */}
                <Tooltip
                  content={<CompactChartTooltip unit="kcal" />}
                  offset={12}
                  cursor={{ stroke: '#0EA5E9', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />

                <Area
                  type="monotone"
                  dataKey="calories"
                  name="Calories Burned"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#workoutCalorieGradient)"
                  activeDot={{
                    r: 5.5,
                    fill: '#0284C7',
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Workout Duration by Day */}
        <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col text-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                Active Training Minutes
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Session length recorded per day</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Minutes
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="workoutBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                
                {/* Compact Tooltip */}
                <Tooltip
                  content={<CompactChartTooltip unit="mins" />}
                  offset={12}
                  cursor={{ fill: 'rgba(2, 132, 199, 0.05)' }}
                />

                <Bar
                  dataKey="duration"
                  name="Duration"
                  fill="url(#workoutBarGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Intensity Breakdown & Discipline Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut: Intensity Breakdown */}
        <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm flex flex-col text-slate-800">
          <div className="mb-2">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Intensity Distribution
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Effort breakdown by RPE</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {intensityBreakdown.every((i) => i.value === 0) ? (
              <p className="text-xs text-slate-500">No intensity metrics logged yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <DynamicPie
                    data={intensityBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                    activeIndex={activeIntensityIndex !== null ? activeIntensityIndex : undefined}
                    activeShape={renderCompactActivePieShape}
                    onClick={(_: any, index: number) => {
                      setActiveIntensityIndex((prev) => (prev === index ? null : index));
                    }}
                    cursor="pointer"
                  >
                    {intensityBreakdown.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={INTENSITY_COLORS[entry.name] || '#0284C7'}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    ))}
                  </DynamicPie>
                  
                  {/* Compact Tooltip */}
                  <Tooltip
                    content={<CompactChartTooltip unit="sessions" />}
                    offset={12}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-slate-600 font-semibold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Compact Click State Popover Chip */}
          {activeIntensityIndex !== null && intensityBreakdown[activeIntensityIndex] && (
            <div className="mt-3 flex justify-center">
              <CompactSlicePopover
                slice={intensityBreakdown[activeIntensityIndex]}
                onClose={() => setActiveIntensityIndex(null)}
                title="Intensity Detail"
                metricLabel="Logged Sessions"
                unit="sessions"
              />
            </div>
          )}
        </div>

        {/* Discipline / Type Progress Bars */}
        <div className="lg:col-span-2 bg-white border border-sky-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-slate-800">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-sky-600" />
                Discipline Frequency
              </h4>
              <span className="text-xs text-slate-500">Lifetime Distribution</span>
            </div>

            <div className="space-y-3.5">
              {typeBreakdown.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Log workouts to reveal discipline breakdown</p>
              ) : (
                typeBreakdown.map((t) => {
                  const maxCount = Math.max(...typeBreakdown.map((item) => item.count), 1);
                  const percentage = Math.round((t.count / maxCount) * 100);

                  return (
                    <div key={t.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{t.name}</span>
                        <span className="text-slate-500 font-medium">
                          {t.count} session{t.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-500 shadow-xs"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Clinical Formula: Metabolic Equivalent of Task</span>
            <span className="text-sky-600 font-bold">Auto-Calibrated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
