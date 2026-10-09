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
  const { user, logout } = useAuth();
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
    <div className="w-full min-h-screen bg-[#080D17] text-slate-100 flex flex-row font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Background Concentric Radar Arcs Watermark (Bottom-Left) with Violet Accent */}
      <div className="fixed -bottom-40 -left-40 w-[540px] h-[540px] pointer-events-none opacity-20 z-0">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <circle cx="250" cy="250" r="80" fill="none" stroke="#2D1F47" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="140" fill="none" stroke="#1D2A47" strokeWidth="1" />
          <circle cx="250" cy="250" r="200" fill="none" stroke="#1A2038" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="250" cy="250" r="260" fill="none" stroke="#12172A" strokeWidth="1.5" />
          <line x1="250" y1="10" x2="250" y2="490" stroke="#1A2038" strokeWidth="1" opacity="0.3" />
          <line x1="10" y1="250" x2="490" y2="250" stroke="#1A2038" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      {/* ============================================================== */}
      {/* ZONE 1: VERTICAL ADMIN NAVIGATION RAIL                         */}
      {/* ============================================================== */}
      <aside className="w-20 md:w-24 shrink-0 min-h-screen bg-[#080D17]/95 backdrop-blur-2xl border-r border-slate-800/70 flex flex-col items-center justify-between py-6 px-2 z-40 select-none sticky top-0 h-screen">
        {/* Brand Shield at Top */}
        <div
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
          onClick={() => onTabChange('overview')}
          title="FitPulse Admin Security Core"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-violet-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080D17] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
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
                ? 'bg-[#0E2838] text-[#38BDF8] border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
                ? 'bg-[#0E2838] text-[#38BDF8] border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
                ? 'bg-[#0E2838] text-[#38BDF8] border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
                ? 'bg-[#0E2838] text-[#38BDF8] border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
                ? 'bg-[#0E2838] text-[#38BDF8] border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
                ? 'bg-[#0E2838] text-[#38BDF8] border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="System Operations & Settings"
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Settings</span>
          </button>

          {/* Switch to Athlete Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-emerald-400 hover:bg-emerald-500/10 transition-all border border-emerald-500/20 mt-2"
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
          className="p-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>

      {/* ============================================================== */}
      {/* ZONE 2: PERSISTENT CONTEXTUAL ADMIN LEFT TELEMETRY DECK         */}
      {/* ============================================================== */}
      {/* Desktop Persistent Left Column */}
      <aside className="hidden lg:flex w-80 md:w-88 xl:w-96 shrink-0 border-r border-slate-800/70 p-4 lg:p-6 flex-col overflow-y-auto max-h-screen sticky top-0 z-20 bg-[#080D17]/40 backdrop-blur-xl">
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsDeckMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[#080D17] border-r border-slate-800 p-4 overflow-y-auto h-full z-10">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Admin Telemetry Deck
              </span>
              <button
                onClick={() => setIsDeckMobileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
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
              className="lg:hidden p-2 rounded-xl bg-[#131C2E] border border-slate-700/60 text-cyan-400 hover:text-cyan-300"
              title="Open Admin Deck"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-500 via-cyan-500 to-emerald-400 p-0.5 shadow-md shadow-violet-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#080D17] rounded-[9px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-lg font-black tracking-tight text-white hidden sm:inline">
                  FitPulse Admin
                </span>
                <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> RESTRICTED RBAC
                </span>
                <span className="text-xs font-semibold text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full hidden md:inline">
                  {tabLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Date Capsule Pill, Bell, Profile Chip */}
          <div className="flex items-center gap-3">
            {/* Date Capsule Pill */}
            <div className="hidden sm:block bg-[#131C2E]/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 shadow-sm">
              {formattedDate}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="w-9 h-9 rounded-xl bg-[#131C2E]/85 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {stats.pendingContent > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#080D17]" />
                )}
              </button>

              {/* Notification Drawer */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#131C2E] border border-slate-700/80 shadow-2xl p-4 z-50 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-200 pb-2 border-b border-slate-700/50">
                    <span>Administrative Alerts</span>
                    <span className="text-[10px] text-cyan-400 font-mono">AUDITED</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0B131E] border border-slate-800 text-slate-300">
                    <p className="font-semibold text-amber-300">Moderation Backlog</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {stats.pendingContent} guides awaiting administrative review.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0B131E] border border-slate-800 text-slate-300">
                    <p className="font-semibold text-emerald-300">RBAC Telemetry</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
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
                className="bg-[#131C2E]/85 backdrop-blur-md border border-slate-700/60 rounded-xl pl-1.5 pr-3 py-1 flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:border-slate-600 transition-all cursor-pointer"
              >
                <img
                  src={
                    user?.profile_image ||
                    `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80`
                  }
                  alt={user?.name || 'Admin'}
                  className="w-7 h-7 rounded-full object-cover border border-violet-500/40"
                />
                <span className="font-bold text-slate-100 hidden sm:inline">{adminName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#131C2E] border border-slate-700/80 shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-700/50">
                    <p className="font-bold text-white">{user?.name || 'Administrator'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                      Administrator (RBAC Level 1)
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Switch to Athlete View
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onTabChange('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 flex items-center gap-2 font-medium"
                  >
                    <Sliders className="w-4 h-4 text-slate-400" />
                    System Settings
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium pt-1.5 border-t border-slate-700/50"
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
