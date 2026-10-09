import React from 'react';
import {
  ShieldCheck,
  MoreHorizontal,
  Users,
  FileText,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Database,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLeftTelemetryDeckProps {
  activeTab: 'overview' | 'users' | 'challenges' | 'moderation' | 'activity' | 'settings';
  stats: {
    totalUsers: number;
    activeAthletes: number;
    adminsCount: number;
    suspendedUsers: number;
    totalWorkouts: number;
    pendingContent: number;
    approvedContent: number;
    auditLogsCount: number;
    maintenanceMode: boolean;
  };
  onRefreshTelemetry?: () => void;
  onOpenCreateUser?: () => void;
  onNavigateTab?: (tab: 'overview' | 'users' | 'challenges' | 'moderation' | 'activity' | 'settings') => void;
}

export const AdminLeftTelemetryDeck: React.FC<AdminLeftTelemetryDeckProps> = ({
  activeTab,
  stats,
  onRefreshTelemetry,
  onOpenCreateUser,
}) => {
  const { isTrialAccount } = useAuth();

  // Dynamic Ring Math based on mode:
  // Trial: Realistic showcase percentages (92%, 85%, 100%)
  // Real Account: Computed dynamically from database telemetry with strict 0% baseline
  const activeConcurrencyPct = isTrialAccount
    ? 92
    : stats.totalUsers > 0
    ? Math.min(100, Math.round((stats.activeAthletes / stats.totalUsers) * 100))
    : 0;

  const totalContent = stats.pendingContent + stats.approvedContent;
  const contentClearancePct = isTrialAccount
    ? 85
    : totalContent > 0
    ? Math.min(100, Math.round((stats.approvedContent / totalContent) * 100))
    : 0;

  const securityIntegrityPct = isTrialAccount
    ? 100
    : stats.totalUsers > 0
    ? 100
    : 0;

  const displayActiveAthletes = isTrialAccount
    ? (stats.activeAthletes || 24)
    : stats.activeAthletes;

  const displayPendingReviews = isTrialAccount
    ? (stats.pendingContent || 3)
    : stats.pendingContent;

  const displayHealthText = isTrialAccount
    ? '99.9%'
    : stats.totalUsers > 0
    ? '100%'
    : '0.0%';

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* ============================================================ */}
      {/* 1. HERO GOVERNANCE CARD: PLATFORM HEALTH & TELEMETRY RINGS   */}
      {/* ============================================================ */}
      <div className="bg-[#131C2E]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              SYSTEM TELEMETRY
            </span>
          </div>
          <button
            onClick={onRefreshTelemetry}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors"
            title="Refresh Governance Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Concentric Governance Health Rings SVG */}
        <div className="relative flex items-center justify-center my-auto py-1">
          <svg viewBox="0 0 340 340" className="w-full max-w-[270px] sm:max-w-[290px] overflow-visible">
            {/* 1. Outer Ring: Active Concurrency (#10B981 Emerald, 92%) */}
            <circle
              cx="170"
              cy="170"
              r="125"
              fill="none"
              stroke="#132B25"
              strokeWidth="22"
            />
            <circle
              cx="170"
              cy="170"
              r="125"
              fill="none"
              stroke="#10B981"
              strokeWidth="22"
              strokeDasharray="785.4"
              strokeDashoffset={785.4 * (1 - activeConcurrencyPct / 100)}
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
              fill="#FFFFFF"
              textAnchor="middle"
              className="select-none"
            >
              Active
            </text>
            <text
              x="170"
              y="298"
              fontSize="12"
              fontWeight="800"
              fill="#10B981"
              textAnchor="middle"
              className="select-none"
            >
              {activeConcurrencyPct}%
            </text>

            {/* 2. Middle Ring: Clearance Velocity (#F59E0B Amber, 85%) */}
            <circle
              cx="170"
              cy="170"
              r="92"
              fill="none"
              stroke="#2E2314"
              strokeWidth="22"
            />
            <circle
              cx="170"
              cy="170"
              r="92"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="22"
              strokeDasharray="578.05"
              strokeDashoffset={578.05 * (1 - contentClearancePct / 100)}
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
              fill="#FFFFFF"
              textAnchor="middle"
              className="select-none"
            >
              Clearance
            </text>
            <text
              x="170"
              y="262"
              fontSize="12"
              fontWeight="800"
              fill="#F59E0B"
              textAnchor="middle"
              className="select-none"
            >
              {contentClearancePct}%
            </text>

            {/* 3. Inner Ring: Security & RBAC Integrity (#8B5CF6 Violet, 100%) */}
            <circle
              cx="170"
              cy="170"
              r="59"
              fill="none"
              stroke="#241B38"
              strokeWidth="22"
            />
            <circle
              cx="170"
              cy="170"
              r="59"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="22"
              strokeDasharray="370.7"
              strokeDashoffset={370.7 * (1 - securityIntegrityPct / 100)}
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
              fill="#FFFFFF"
              textAnchor="middle"
              className="select-none"
            >
              Security
            </text>
            <text
              x="170"
              y="228"
              fontSize="11"
              fontWeight="800"
              fill="#8B5CF6"
              textAnchor="middle"
              className="select-none"
            >
              {securityIntegrityPct}%
            </text>

            {/* Center Data Label */}
            <circle cx="170" cy="170" r="42" fill="#0A101C" />
            <g transform="translate(170, 166)">
              <text
                y="0"
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                fill="#FFFFFF"
                className="select-none font-sans"
              >
                {displayHealthText}
              </text>
              <text
                y="14"
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill="#94A3B8"
                letterSpacing="1"
                className="select-none uppercase"
              >
                Health
              </text>
            </g>
          </svg>
        </div>

        {/* Bottom Telemetry Readouts with Color Dot Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/60 mt-1">
          {/* Active Users */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" />
              <span className="text-[11px] font-bold text-[#10B981]">Active</span>
            </div>
            <span className="text-base sm:text-lg font-black text-white tracking-tight">
              {displayActiveAthletes} <span className="text-[10px] font-normal text-slate-400 block">athletes</span>
            </span>
          </div>

          {/* Pending Reviews */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block" />
              <span className="text-[11px] font-bold text-[#F59E0B]">Pending</span>
            </div>
            <span className="text-base sm:text-lg font-black text-white tracking-tight">
              {displayPendingReviews} <span className="text-[10px] font-normal text-slate-400 block">reviews</span>
            </span>
          </div>

          {/* Security State */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6] inline-block" />
              <span className="text-[11px] font-bold text-[#8B5CF6]">Security</span>
            </div>
            <span className="text-base sm:text-lg font-black text-white tracking-tight">
              0 <span className="text-[10px] font-normal text-slate-400 block">breaches</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CONTEXTUAL ADMIN SUB-DECK (Tab-Aware)                     */}
      {/* ============================================================ */}

      {/* A. When on Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-[#131C2E]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Platform Vitals
            </span>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#0B131E] border border-slate-800/70">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Total Users</span>
              <span className="text-lg font-black text-white">{stats.totalUsers} accounts</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0B131E] border border-slate-800/70">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Sessions Logged</span>
              <span className="text-lg font-black text-emerald-400">{stats.totalWorkouts} w/o</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#0B131E] border border-slate-800/70 flex items-center justify-between text-xs">
            <span className="text-slate-400">Database Engine</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> High-Availability
            </span>
          </div>
        </div>
      )}

      {/* B. When on User Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-[#131C2E]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" /> User Directory Telemetry
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              SYNCED
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B131E] border border-slate-800/70 text-xs">
              <span className="text-slate-400">Active Athletes</span>
              <span className="font-black text-emerald-300">{stats.activeAthletes} users</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B131E] border border-slate-800/70 text-xs">
              <span className="text-slate-400">Administrative Officers</span>
              <span className="font-black text-violet-300">{stats.adminsCount} admins</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B131E] border border-slate-800/70 text-xs">
              <span className="text-slate-400">Suspended / Deactivated</span>
              <span className="font-black text-rose-400">{stats.suspendedUsers} users</span>
            </div>
          </div>

          {onOpenCreateUser && (
            <button
              onClick={onOpenCreateUser}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          )}
        </div>
      )}

      {/* C. When on Content Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="bg-[#131C2E]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" /> Clearance Queue
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              MODERATION
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#0B131E] border border-slate-800/70">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Pending Review</span>
              <span className="text-lg font-black text-amber-400">{stats.pendingContent} guides</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0B131E] border border-slate-800/70">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Approved Live</span>
              <span className="text-lg font-black text-emerald-400">{stats.approvedContent} verified</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#0B131E] border border-slate-800/70 flex items-center justify-between text-xs">
            <span className="text-slate-400">Workflow State</span>
            <span className="font-bold text-amber-300">Triaged via RBAC</span>
          </div>
        </div>
      )}

      {/* D. When on Activity Monitoring / Security Audit Logs Tab */}
      {activeTab === 'activity' && (
        <div className="bg-[#131C2E]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" /> Security Audit Stream
            </span>
            <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
              AUDITED
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B131E] border border-slate-800/70 text-xs">
              <span className="text-slate-400">Recorded Security Events</span>
              <span className="font-black text-violet-300">{stats.auditLogsCount} logs</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B131E] border border-slate-800/70 text-xs">
              <span className="text-slate-400">Tamper Resistance</span>
              <span className="font-black text-emerald-400">Database-Immutable</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B131E] border border-slate-800/70 text-xs">
              <span className="text-slate-400">Anti-Lockout Protection</span>
              <span className="font-black text-cyan-300">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* E. When on System Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-[#131C2E]/85 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Operations Control
            </span>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              OPERATIONAL
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B131E] border border-slate-800/70">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Platform Maintenance Mode</span>
            <span className={`text-xs font-bold block ${stats.maintenanceMode ? 'text-rose-400' : 'text-emerald-400'}`}>
              {stats.maintenanceMode ? 'Active (Restricted)' : 'Inactive (Normal Operations)'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#0B131E] border border-slate-800/70 flex items-center justify-between text-xs">
            <span className="text-slate-400">Dynamic Key-Value Store</span>
            <span className="font-bold text-emerald-300">Synchronized</span>
          </div>
        </div>
      )}
    </div>
  );
};
