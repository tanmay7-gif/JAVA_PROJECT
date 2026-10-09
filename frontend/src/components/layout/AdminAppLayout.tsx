import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminLeftTelemetryDeck } from '../admin/AdminLeftTelemetryDeck';
import {
  Activity,
  Users,
  Trophy,
  FileText,
  ShieldCheck,
  Sliders,
  LogOut,
  Bell,
  ChevronDown,
  Eye,
  SlidersHorizontal,
  X,
  Lock,
} from 'lucide-react';

export type AdminTabType = 'overview' | 'users' | 'challenges' | 'moderation' | 'activity' | 'settings';

interface AdminAppLayoutProps {
  activeTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
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
  children: React.ReactNode;
}

export const AdminAppLayout: React.FC<AdminAppLayoutProps> = ({
  activeTab,
  onTabChange,
  stats,
  onRefreshTelemetry,
  onOpenCreateUser,
  children,
}) => {
  const { user, isTrialAccount, logout } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isDeckMobileOpen, setIsDeckMobileOpen] = useState<boolean>(false);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const formattedDate = useMemo(() => {
    const now = new Date();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    const month = now.toLocaleDateString('en-US', { month: 'short' });
    const day = now.getDate();
    const year = now.getFullYear();
    return `${weekday}, ${month} ${day}, ${year}`;
  }, []);

  const tabLabel = useMemo(() => {
    switch (activeTab) {
      case 'users':
        return 'User Directory & Access Control';
      case 'challenges':
        return 'Challenge Quests & Badges';
      case 'moderation':
        return 'Content Moderation Workbench';
      case 'activity':
        return 'Security Audit Trails & Logs';
      case 'settings':
        return 'System Operations & Configuration';
      default:
        return 'Platform Telemetry & Overview';
    }
  }, [activeTab]);

  const adminName = user?.name ? user.name.split(' ')[0] + ' ' + (user.name.split(' ')[1]?.[0] || 'V') + '.' : 'Marcus V.';

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-row font-sans selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      {/* Background Concentric Radar Arcs Watermark (Bottom-Left) */}
      <div className="fixed -bottom-40 -left-40 w-[540px] h-[540px] pointer-events-none opacity-40 z-0">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <circle cx="250" cy="250" r="80" fill="none" stroke="#E0F2FE" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="140" fill="none" stroke="#BAE6FD" strokeWidth="1" />
          <circle cx="250" cy="250" r="200" fill="none" stroke="#E0F2FE" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="250" cy="250" r="260" fill="none" stroke="#BAE6FD" strokeWidth="1.5" />
          <line x1="250" y1="10" x2="250" y2="490" stroke="#E0F2FE" strokeWidth="1" opacity="0.6" />
          <line x1="10" y1="250" x2="490" y2="250" stroke="#E0F2FE" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>

      {/* ============================================================== */}
      {/* ZONE 1: VERTICAL ADMIN NAVIGATION RAIL                         */}
      {/* ============================================================== */}
      <aside className="w-20 md:w-24 shrink-0 min-h-screen bg-white/95 backdrop-blur-2xl border-r border-sky-100 shadow-sm flex flex-col items-center justify-between py-6 px-2 z-40 select-none sticky top-0 h-screen">
        {/* Brand Shield at Top */}
        <div
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
          onClick={() => onTabChange('overview')}
          title="FitPulse Admin Security Core"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-500 to-indigo-400 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
            </div>
          </div>
        </div>

        {/* Vertical Rail Navigation Items */}
        <nav className="flex flex-col items-center gap-3 w-full py-4">
          {/* Overview */}
          <button
            onClick={() => onTabChange('overview')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'overview'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
            }`}
            title="Overview Telemetry"
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight">Overview</span>
          </button>

          {/* Users */}
          <button
            onClick={() => onTabChange('users')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'users'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
            }`}
            title="User Directory & Roles"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Users</span>
          </button>

          {/* Challenges */}
          <button
            onClick={() => onTabChange('challenges')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'challenges'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
            }`}
            title="Challenge Quests"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Quests</span>
          </button>

          {/* Moderation */}
          <button
            onClick={() => onTabChange('moderation')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 relative transition-all ${
              activeTab === 'moderation'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
            }`}
            title="Content Moderation"
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Review</span>
            {stats.pendingContent > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Audit & Logs */}
          <button
            onClick={() => onTabChange('activity')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'activity'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
            }`}
            title="Security Audit Logs"
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Audit</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onTabChange('settings')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'settings'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
            }`}
            title="System Operations & Settings"
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Settings</span>
          </button>

          {/* Switch to Athlete Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-sky-600 hover:bg-sky-50 transition-all border border-sky-200 mt-2"
            title="View Athlete Dashboard"
          >
            <Eye className="w-4 h-4" />
            <span className="text-[9px] font-bold tracking-tight">Athlete</span>
          </button>
        </nav>

        {/* Bottom Exit / Sign Out Button */}
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="p-3 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>

      {/* ============================================================== */}
      {/* ZONE 2: PERSISTENT CONTEXTUAL ADMIN LEFT TELEMETRY DECK         */}
      {/* ============================================================== */}
      {/* Desktop Persistent Left Column */}
      <aside className="hidden lg:flex w-80 md:w-88 xl:w-96 shrink-0 border-r border-sky-100 p-4 lg:p-6 flex-col overflow-y-auto max-h-screen sticky top-0 z-20 bg-white/80 backdrop-blur-xl">
        <AdminLeftTelemetryDeck
          activeTab={activeTab}
          stats={stats}
          onRefreshTelemetry={onRefreshTelemetry}
          onOpenCreateUser={onOpenCreateUser}
          onNavigateTab={onTabChange}
        />
      </aside>

      {/* Mobile Drawer Slide-over */}
      {isDeckMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsDeckMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white border-r border-sky-100 p-4 overflow-y-auto h-full z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-sky-100">
              <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                Admin Telemetry Deck
              </span>
              <button
                onClick={() => setIsDeckMobileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminLeftTelemetryDeck
              activeTab={activeTab}
              stats={stats}
              onRefreshTelemetry={onRefreshTelemetry}
              onOpenCreateUser={() => {
                setIsDeckMobileOpen(false);
                onOpenCreateUser?.();
              }}
              onNavigateTab={(tab) => {
                setIsDeckMobileOpen(false);
                onTabChange(tab);
              }}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ZONE 3: MAIN DYNAMIC WORKSPACE (TOP BAR + CONTENT)             */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-w-0 z-10 overflow-y-auto">
        {/* TOP ADMIN APP BAR */}
        <header className="flex items-center justify-between gap-4 pb-6 w-full shrink-0">
          {/* Left: Brand mark FitPulse Admin + Current Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile Telemetry Deck Toggle */}
            <button
              onClick={() => setIsDeckMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-sky-200 text-sky-600 hover:text-sky-700 shadow-sm"
              title="Open Admin Deck"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-sky-500 to-indigo-400 p-0.5 shadow-sm shadow-sky-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-lg font-black tracking-tight text-slate-900 hidden sm:inline">
                  FitPulse Admin
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> RESTRICTED RBAC
                </span>
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full hidden md:inline">
                  {tabLabel}
                </span>
                {isTrialAccount ? (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Admin Demo Trial
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Live Admin Account
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Date Capsule Pill, Bell, Profile Chip */}
          <div className="flex items-center gap-3">
            {/* Date Capsule Pill */}
            <div className="hidden sm:block bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 text-xs font-semibold text-sky-800 shadow-sm">
              {formattedDate}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="w-9 h-9 rounded-xl bg-white border border-sky-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-all active:scale-95"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {stats.pendingContent > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Drawer */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-sky-100 shadow-xl p-4 z-50 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-sky-100">
                    <span>Administrative Alerts</span>
                    <span className="text-[10px] text-sky-600 font-mono font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">AUDITED</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 text-slate-700">
                    <p className="font-semibold text-amber-800">Moderation Backlog</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {stats.pendingContent} guides awaiting administrative review.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 text-slate-700">
                    <p className="font-semibold text-emerald-800">RBAC Telemetry</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Cryptographic token verification running normal.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Chip */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="bg-white border border-sky-100 shadow-sm rounded-xl pl-1.5 pr-3 py-1 flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:border-sky-300 transition-all cursor-pointer"
              >
                <img
                  src={
                    user?.profile_image ||
                    `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80`
                  }
                  alt={user?.name || 'Admin'}
                  className="w-7 h-7 rounded-full object-cover border border-sky-300"
                />
                <span className="font-bold text-slate-900 hidden sm:inline">{adminName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-sky-100 shadow-xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-sky-100">
                    <p className="font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px]">
                      Administrator (RBAC Level 1)
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-sky-700 hover:bg-sky-50 flex items-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Switch to Athlete View
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onTabChange('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:text-sky-700 hover:bg-sky-50 flex items-center gap-2 font-medium"
                  >
                    <Sliders className="w-4 h-4 text-slate-400" />
                    System Settings
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium pt-1.5 border-t border-sky-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Admin Workspace Content */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
