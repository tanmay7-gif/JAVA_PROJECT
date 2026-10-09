import React, { useState, useEffect } from 'react';
import { AdminDashboardData } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AdminGlobe3D } from '../three/AdminGlobe3D';
import {
  Users,
  Activity,
  FileCheck2,
  Trophy,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateTrialAdminData } from '../../utils/mockTrialData';
import { CompactChartTooltip } from '../analytics/CompactChartTooltip';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboardView: React.FC<{
  onNavigateTab: (tab: string) => void;
}> = ({ onNavigateTab }) => {
  const { showToast } = useToast();
  const { isTrialAccount } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const trialAdmin = React.useMemo(() => generateTrialAdminData(), []);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load administrator telemetry.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, [showToast]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Gathering system-wide cluster telemetry...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, recentActivity, engagementTrend } = data;

  const effectiveKpis = {
    totalUsers: isTrialAccount ? (kpis.totalUsers > 0 ? kpis.totalUsers : trialAdmin.totalAthletes) : kpis.totalUsers,
    activeWorkoutsToday: isTrialAccount ? (kpis.activeWorkoutsToday > 0 ? kpis.activeWorkoutsToday : trialAdmin.activeWorkoutsToday) : kpis.activeWorkoutsToday,
    pendingContentApprovals: isTrialAccount ? (kpis.pendingContentApprovals > 0 ? kpis.pendingContentApprovals : trialAdmin.pendingReviewsCount) : kpis.pendingContentApprovals,
    ongoingChallenges: isTrialAccount ? (kpis.ongoingChallenges > 0 ? kpis.ongoingChallenges : 4) : kpis.ongoingChallenges,
  };

  const effectiveTrend =
    isTrialAccount && (!engagementTrend || engagementTrend.length === 0 || engagementTrend.every((e) => e.workouts === 0))
      ? [
          { day: 'Mon', workouts: 180, activeUsers: 140 },
          { day: 'Tue', workouts: 220, activeUsers: 175 },
          { day: 'Wed', workouts: 280, activeUsers: 210 },
          { day: 'Thu', workouts: 240, activeUsers: 195 },
          { day: 'Fri', workouts: 310, activeUsers: 260 },
          { day: 'Sat', workouts: 350, activeUsers: 290 },
          { day: 'Sun', workouts: 290, activeUsers: 230 },
        ]
      : engagementTrend;

  return (
    <div className="space-y-6">
      {/* Top Banner with 3D Globe Preview */}
      <div className="clinical-card p-6 bg-gradient-to-r from-white via-[#FAFCFA] to-emerald-50/40 border border-emerald-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              Cluster Telemetry & Governance
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Administrative Control Center
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed max-w-lg">
              Live monitoring of tenant users, compliance approval queues, active challenges, and global workout volume rendered across low-poly mesh topology.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => onNavigateTab('admin-users')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
              >
                Manage Users
              </button>
              <button
                onClick={() => onNavigateTab('admin-content')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-emerald-200 transition-all shadow-soft-sm"
              >
                Moderation Queue ({effectiveKpis.pendingContentApprovals})
              </button>
            </div>
          </div>

          {/* Interactive 3D Low-Poly Globe with Beacon Pillars */}
          <div className="lg:col-span-5 h-64 w-full flex items-center justify-center">
            <AdminGlobe3D />
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => onNavigateTab('admin-users')}
          className="clinical-card p-5 cursor-pointer hover:border-emerald-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{effectiveKpis.totalUsers}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Verified accounts registered
          </div>
        </div>

        {/* Workouts Logged Today */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Sessions Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{effectiveKpis.activeWorkoutsToday}</div>
          <div className="text-[11px] text-gray-500 mt-2">Active athletes since 00:00 UTC</div>
        </div>

        {/* Pending Content Approvals */}
        <div
          onClick={() => onNavigateTab('admin-content')}
          className={`clinical-card p-5 cursor-pointer transition-all ${
            effectiveKpis.pendingContentApprovals > 0
              ? 'border-amber-300 bg-amber-50/20'
              : 'hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{effectiveKpis.pendingContentApprovals}</div>
          <div className="text-[11px] text-gray-500 mt-2 flex items-center justify-between">
            <span>Awaiting review</span>
            {effectiveKpis.pendingContentApprovals > 0 && (
              <span className="text-amber-700 font-bold flex items-center">
                Review <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            )}
          </div>
        </div>

        {/* Ongoing Challenges */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Active Challenges
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{effectiveKpis.ongoingChallenges}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2">Open community events</div>
        </div>
      </div>

      {/* Main Grid: Engagement Telemetry & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Trend Chart (2 columns) */}
        <div className="lg:col-span-2 clinical-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Platform Volume & User Participation (7 Days)
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Daily logged workouts vs active participating athletes</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Audit Sync
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={effectiveTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminBarWorkouts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="adminBarUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>
                    <filter id="adminBarShadow" x="-10%" y="-10%" width="120%" height="130%">
                      <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.3" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={<CompactChartTooltip />}
                    offset={12}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconSize={8}
                    formatter={(val) => <span className="text-xs text-gray-700 font-bold">{val}</span>}
                  />
                  <Bar dataKey="workouts" name="Workouts Logged" fill="url(#adminBarWorkouts)" radius={[6, 6, 0, 0]} filter="url(#adminBarShadow)" />
                  <Bar dataKey="activeUsers" name="Active Athletes" fill="url(#adminBarUsers)" radius={[6, 6, 0, 0]} filter="url(#adminBarShadow)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Real-time System Audit Activity Feed */}
        <div className="clinical-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Live System Audit Feed
              </h4>
              <button
                onClick={() => onNavigateTab('admin-audit')}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-72 custom-scrollbar pr-1">
              {recentActivity.map((log) => {
                let badgeColor = 'bg-gray-100 text-gray-700 border-gray-200';
                if (log.action.includes('LOGIN')) badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (log.action.includes('REGISTER')) badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
                if (log.action.includes('MODERATE')) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                if (log.action.includes('DELETE')) badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#FAFCFA] border border-emerald-100/80 text-xs space-y-1 hover:bg-emerald-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-gray-900 font-bold truncate">
                      {log.user ? log.user.name : 'System Worker'}
                    </div>

                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {log.details || 'System operation executed.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
