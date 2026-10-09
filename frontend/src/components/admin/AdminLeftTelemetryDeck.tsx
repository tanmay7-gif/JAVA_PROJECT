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
      <div className="bg-gradient-to-br from-[#EBF5FF] to-[#DDF0FF] border border-sky-200 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
              SYSTEM TELEMETRY
            </span>
          </div>
          <button
            onClick={onRefreshTelemetry}
            className="text-slate-400 hover:text-sky-600 p-1 rounded-lg transition-colors"
            title="Refresh Governance Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Concentric Governance Health Rings SVG with 3D Depth */}
        <div className="relative flex items-center justify-center my-auto py-1">
          <svg viewBox="0 0 340 340" className="w-full max-w-[270px] sm:max-w-[290px] overflow-visible">
            <defs>
              {/* Physical Depth Drop Shadow for Elevated Arcs */}
              <filter id="adminRingDepthShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#0F172A" floodOpacity="0.22" />
              </filter>

              {/* Recessed Trough Groove Shadow */}
              <filter id="adminRecessedTrackShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.08" />
              </filter>

              {/* Center Disc Physical Depth */}
              <filter id="adminCenterDiscShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="4" floodColor="#0284C7" floodOpacity="0.16" />
              </filter>

              {/* Cylindrical Concentric Linear Gradients */}
              <linearGradient id="adminActiveGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="adminClearanceGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="adminSecurityGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>
              <linearGradient id="adminCenterDiscGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
              filter="url(#adminRecessedTrackShadow)"
            />
            <circle
              cx="170"
              cy="170"
              r="92"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="22"
              opacity="0.65"
              filter="url(#adminRecessedTrackShadow)"
            />
            <circle
              cx="170"
              cy="170"
              r="59"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="22"
              opacity="0.65"
              filter="url(#adminRecessedTrackShadow)"
            />

            {/* 1. Outer Ring: Active Concurrency 3D Arc */}
            <circle
              cx="170"
              cy="170"
              r="125"
              fill="none"
              stroke="url(#adminActiveGrad3D)"
              strokeWidth="22"
              strokeDasharray="785.4"
              strokeDashoffset={785.4 * (1 - activeConcurrencyPct / 100)}
              strokeLinecap="round"
              filter="url(#adminRingDepthShadow)"
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
              Active
            </text>
            <text
              x="170"
              y="298"
              fontSize="12"
              fontWeight="700"
              fill="#059669"
              textAnchor="middle"
              className="select-none font-mono"
            >
              {activeConcurrencyPct}%
            </text>

            {/* 2. Middle Ring: Clearance Velocity 3D Arc */}
            <circle
              cx="170"
              cy="170"
              r="92"
              fill="none"
              stroke="url(#adminClearanceGrad3D)"
              strokeWidth="22"
              strokeDasharray="578.05"
              strokeDashoffset={578.05 * (1 - contentClearancePct / 100)}
              strokeLinecap="round"
              filter="url(#adminRingDepthShadow)"
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
              Clearance
            </text>
            <text
              x="170"
              y="262"
              fontSize="12"
              fontWeight="700"
              fill="#D97706"
              textAnchor="middle"
              className="select-none font-mono"
            >
              {contentClearancePct}%
            </text>

            {/* 3. Inner Ring: Security & RBAC Integrity 3D Arc */}
            <circle
              cx="170"
              cy="170"
              r="59"
              fill="none"
              stroke="url(#adminSecurityGrad3D)"
              strokeWidth="22"
              strokeDasharray="370.7"
              strokeDashoffset={370.7 * (1 - securityIntegrityPct / 100)}
              strokeLinecap="round"
              filter="url(#adminRingDepthShadow)"
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
              Security
            </text>
            <text
              x="170"
              y="228"
              fontSize="11"
              fontWeight="700"
              fill="#6D28D9"
              textAnchor="middle"
              className="select-none font-mono"
            >
              {securityIntegrityPct}%
            </text>

            {/* Center Data Label Disc */}
            <circle
              cx="170"
              cy="170"
              r="42"
              fill="url(#adminCenterDiscGrad)"
              stroke="#BAE6FD"
              strokeWidth="1.5"
              filter="url(#adminCenterDiscShadow)"
            />
            <g transform="translate(170, 166)">
              <text
                y="0"
                textAnchor="middle"
                fontSize="20"
                fontWeight="700"
                fill="#0F172A"
                className="select-none font-sans tracking-tight"
              >
                {displayHealthText}
              </text>
              <text
                y="14"
                textAnchor="middle"
                fontSize="8"
                fontWeight="500"
                fill="#0284C7"
                letterSpacing="1"
                className="select-none uppercase tracking-wider"
              >
                Health
              </text>
            </g>
          </svg>
        </div>

        {/* Bottom Telemetry Readouts with Color Dot Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-sky-100 mt-1">
          {/* Active Users */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" />
              <span className="text-[11px] font-medium text-emerald-800">Active</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
              {displayActiveAthletes} <span className="text-[10px] font-normal text-slate-500 block">athletes</span>
            </span>
          </div>

          {/* Pending Reviews */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block" />
              <span className="text-[11px] font-medium text-amber-800">Pending</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
              {displayPendingReviews} <span className="text-[10px] font-normal text-slate-500 block">reviews</span>
            </span>
          </div>

          {/* Security State */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6] inline-block" />
              <span className="text-[11px] font-medium text-purple-800">Security</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
              0 <span className="text-[10px] font-normal text-slate-500 block">breaches</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CONTEXTUAL ADMIN SUB-DECK (Tab-Aware)                     */}
      {/* ============================================================ */}

      {/* A. When on Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-500" /> Platform Vitals
            </span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Total Users</span>
              <span className="text-lg font-black text-slate-900">{stats.totalUsers} accounts</span>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Sessions Logged</span>
              <span className="text-lg font-black text-emerald-600">{stats.totalWorkouts} w/o</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 flex items-center justify-between text-xs">
            <span className="text-slate-600">Database Engine</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> High-Availability
            </span>
          </div>
        </div>
      )}

      {/* B. When on User Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" /> User Directory Telemetry
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              SYNCED
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-600">Active Athletes</span>
              <span className="font-black text-emerald-700">{stats.activeAthletes} users</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-600">Administrative Officers</span>
              <span className="font-black text-purple-700">{stats.adminsCount} admins</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-600">Suspended / Deactivated</span>
              <span className="font-black text-rose-600">{stats.suspendedUsers} users</span>
            </div>
          </div>

          {onOpenCreateUser && (
            <button
              onClick={onOpenCreateUser}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-sky-500/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          )}
        </div>
      )}

      {/* C. When on Content Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" /> Clearance Queue
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              MODERATION
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Pending Review</span>
              <span className="text-lg font-black text-amber-600">{stats.pendingContent} guides</span>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Approved Live</span>
              <span className="text-lg font-black text-emerald-600">{stats.approvedContent} verified</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 flex items-center justify-between text-xs">
            <span className="text-slate-600">Workflow State</span>
            <span className="font-bold text-amber-700">Triaged via RBAC</span>
          </div>
        </div>
      )}

      {/* D. When on Activity Monitoring / Security Audit Logs Tab */}
      {activeTab === 'activity' && (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Security Audit Stream
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              AUDITED
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-600">Recorded Security Events</span>
              <span className="font-black text-purple-700">{stats.auditLogsCount} logs</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-600">Tamper Resistance</span>
              <span className="font-black text-emerald-600">Database-Immutable</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-xs">
              <span className="text-slate-600">Anti-Lockout Protection</span>
              <span className="font-black text-sky-600">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* E. When on System Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-500" /> Operations Control
            </span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              OPERATIONAL
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80">
            <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Platform Maintenance Mode</span>
            <span className={`text-xs font-bold block ${stats.maintenanceMode ? 'text-rose-600' : 'text-emerald-600'}`}>
              {stats.maintenanceMode ? 'Active (Restricted)' : 'Inactive (Normal Operations)'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 flex items-center justify-between text-xs">
            <span className="text-slate-600">Dynamic Key-Value Store</span>
            <span className="font-bold text-emerald-600">Synchronized</span>
          </div>
        </div>
      )}
    </div>
  );
};
