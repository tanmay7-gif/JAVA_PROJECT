import React, { useState, useEffect } from 'react';
import { AnalyticsSummary } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
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
  LOW: '#10B981',    // Mint / Emerald
  MEDIUM: '#F59E0B', // Amber
  HIGH: '#F43F5E',   // Rose
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
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
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
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Weekly Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {summary.weeklyWorkoutHours}
            </span>
            <span className="text-xs font-semibold text-gray-500">Hours</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Rolling 7-day cumulative time
          </p>
        </div>

        {/* Weekly Calories */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Energy Output
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {summary.weeklyCaloriesBurned.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-gray-500">kcal</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Active metabolic burn</p>
        </div>

        {/* Active Challenges */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Active Milestones
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {summary.activeChallengesCount}
            </span>
            <span className="text-xs font-semibold text-gray-500">Goals</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2">Badges being unlocked</p>
        </div>

        {/* Lifetime Workouts */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Logged
            </span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {summary.totalLifetimeWorkouts}
            </span>
            <span className="text-xs font-semibold text-gray-500">Sessions</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            {summary.totalLifetimeHours} lifetime hours
          </p>
        </div>
      </div>

      {/* Primary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Calorie Burn (Light Green Area Chart fading to crisp white) */}
        <div className="clinical-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-600" />
                Caloric Expenditure Gradient
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Daily energy burn across all activities</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              7-Day Pacing
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mintCalorieGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D1E7DD',
                    borderRadius: '1rem',
                    color: '#111827',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px -2px rgba(16, 185, 129, 0.15)',
                  }}
                  formatter={(value: any) => [`${value} kcal`, 'Calories']}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mintCalorieGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Workout Duration by Day (Soft Mint Bar Chart) */}
        <div className="clinical-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Active Training Minutes
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Session length recorded per day</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Minutes
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D1E7DD',
                    borderRadius: '1rem',
                    color: '#111827',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px -2px rgba(16, 185, 129, 0.15)',
                  }}
                  formatter={(value: any) => [`${value} mins`, 'Duration']}
                />
                <Bar dataKey="duration" fill="#34D399" radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Intensity Breakdown & Discipline Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut: Intensity Breakdown */}
        <div className="clinical-card p-6 flex flex-col">
          <div className="mb-2">
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Intensity Distribution
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">Effort breakdown by RPE</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {intensityBreakdown.every((i) => i.value === 0) ? (
              <p className="text-xs text-gray-400">No intensity metrics logged yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={intensityBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {intensityBreakdown.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={INTENSITY_COLORS[entry.name] || '#10B981'}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D1E7DD',
                      borderRadius: '1rem',
                      color: '#111827',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => [`${value} sessions`, `${name} Intensity`]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-gray-700 font-semibold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Discipline / Type Progress Bars */}
        <div className="lg:col-span-2 clinical-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                Discipline Frequency
              </h4>
              <span className="text-xs text-gray-400">Lifetime Distribution</span>
            </div>

            <div className="space-y-3.5">
              {typeBreakdown.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">Log workouts to reveal discipline breakdown</p>
              ) : (
                typeBreakdown.map((t) => {
                  const maxCount = Math.max(...typeBreakdown.map((item) => item.count), 1);
                  const percentage = Math.round((t.count / maxCount) * 100);

                  return (
                    <div key={t.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">{t.name}</span>
                        <span className="text-gray-500 font-medium">
                          {t.count} session{t.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Clinical Formula: Metabolic Equivalent of Task</span>
            <span className="text-emerald-700 font-bold">Auto-Calibrated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
