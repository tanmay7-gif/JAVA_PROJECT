import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AnalyticsSummary } from '../../types';
import { LeftTelemetryDeck } from './LeftTelemetryDeck';
import {
  Home,
  Activity,
  BarChart2,
  Target,
  ClipboardList,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ShieldCheck,
  PlusCircle,
  Menu,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface AthleteAppLayoutProps {
  children: React.ReactNode;
  onOpenLogWorkout?: () => void;
  refreshTrigger?: number;
}

export const AthleteAppLayout: React.FC<AthleteAppLayoutProps> = ({
  children,
  onOpenLogWorkout,
  refreshTrigger = 0,
}) => {
  const { user, role, logout, isTrialAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isDeckMobileOpen, setIsDeckMobileOpen] = useState<boolean>(false);

  // Determine current active tab from pathname
  const currentTab = useMemo(() => {
    const path = location.pathname;
    if (path === '/workouts') return 'workouts';
    if (path === '/analytics') return 'analytics';
    if (path === '/challenges') return 'challenges';
    if (path === '/community' || path === '/guides') return 'community';
    if (path === '/profile') return 'profile';
    return 'dashboard';
  }, [location.pathname]);

  // Tab Title & Breadcrumb Label
  const tabLabel = useMemo(() => {
    switch (currentTab) {
      case 'workouts':
        return 'Activity & Workout Center';
      case 'analytics':
        return '3D Biometric Analytics';
      case 'challenges':
        return 'Quest Arena & Podium';
      case 'community':
        return 'Plans & Clinical Guides';
      case 'profile':
        return 'Athlete Settings & Profile';
      default:
        return 'Athlete Biomechanics Telemetry';
    }
  }, [currentTab]);

  // Load telemetry metrics
  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      try {
        const res = await api.getWorkoutAnalytics();
        if (isMounted && res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load telemetry in AppLayout:', err);
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

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

  const athleteName = user?.name
    ? user.name.split(' ')[0] + ' ' + (user.name.split(' ')[1]?.[0] || 'J') + '.'
    : 'Sarah J.';

  return (
    <div className="w-full min-h-screen bg-[#0B131E] text-slate-100 flex flex-row font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Background Concentric Radar Arcs Watermark (Bottom-Left) */}
      <div className="fixed -bottom-40 -left-40 w-[540px] h-[540px] pointer-events-none opacity-20 z-0">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <circle cx="250" cy="250" r="80" fill="none" stroke="#25384D" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="140" fill="none" stroke="#1D3044" strokeWidth="1" />
          <circle cx="250" cy="250" r="200" fill="none" stroke="#172737" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="250" cy="250" r="260" fill="none" stroke="#13212F" strokeWidth="1.5" />
          <line x1="250" y1="10" x2="250" y2="490" stroke="#172737" strokeWidth="1" opacity="0.3" />
          <line x1="10" y1="250" x2="490" y2="250" stroke="#172737" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      {/* ============================================================== */}
      {/* ZONE 1: VERTICAL NAVIGATION RAIL (LEFT RAIL)                   */}
      {/* ============================================================== */}
      <aside className="w-20 md:w-24 shrink-0 min-h-screen bg-[#0B131E]/95 backdrop-blur-2xl border-r border-slate-800/70 flex flex-col items-center justify-between py-6 px-2 z-40 select-none sticky top-0 h-screen">
        {/* Brand Icon at Top */}
        <div
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
          onClick={() => navigate('/dashboard')}
          title="FitPulse Biomechanics OS"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-400 to-teal-300 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0B131E] rounded-[14px] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-emerald-400"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h6.28" />
              </svg>
            </div>
          </div>
        </div>

        {/* Vertical Rail Navigation Items */}
        <nav className="flex flex-col items-center gap-3 w-full py-4">
          {/* Home */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              currentTab === 'dashboard'
                ? 'bg-[#15342F] text-[#34D399] border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Home / Dashboard"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </button>

          {/* Activity */}
          <button
            onClick={() => navigate('/workouts')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              currentTab === 'workouts'
                ? 'bg-[#15342F] text-[#34D399] border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Activity / Workouts"
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Activity</span>
          </button>

          {/* Data / Analytics */}
          <button
            onClick={() => navigate('/analytics')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              currentTab === 'analytics'
                ? 'bg-[#15342F] text-[#34D399] border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Data / 3D Analytics"
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Data</span>
          </button>

          {/* Goals */}
          <button
            onClick={() => navigate('/challenges')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              currentTab === 'challenges'
                ? 'bg-[#15342F] text-[#34D399] border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Goals / Challenges Arena"
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Goals</span>
          </button>

          {/* Plans */}
          <button
            onClick={() => navigate('/community')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              currentTab === 'community'
                ? 'bg-[#15342F] text-[#34D399] border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Plans & Guides"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Plans</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/profile')}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              currentTab === 'profile'
                ? 'bg-[#15342F] text-[#34D399] border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Settings & Profile"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Settings</span>
          </button>
        </nav>

        {/* Bottom Action: Logout / Exit Icon Button */}
        <button
          onClick={handleSignOut}
          title="Logout / Exit"
          className="p-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>

      {/* ============================================================== */}
      {/* ZONE 2: PERSISTENT CONTEXTUAL LEFT METRIC CARD DECK             */}
      {/* ============================================================== */}
      {/* Desktop Persistent Left Column */}
      <aside className="hidden lg:flex w-80 md:w-88 xl:w-96 shrink-0 border-r border-slate-800/70 p-4 lg:p-6 flex-col overflow-y-auto max-h-screen sticky top-0 z-20 bg-[#0B131E]/40 backdrop-blur-xl">
        <LeftTelemetryDeck
          currentTab={currentTab}
          analytics={analytics}
          onOpenLogWorkout={onOpenLogWorkout}
          onNavigateTab={(tab) => {
            if (tab === 'workouts') navigate('/workouts');
            else if (tab === 'analytics') navigate('/analytics');
            else if (tab === 'challenges') navigate('/challenges');
            else if (tab === 'community') navigate('/community');
            else if (tab === 'profile') navigate('/profile');
            else navigate('/dashboard');
          }}
        />
      </aside>

      {/* Mobile Drawer / Slide-over for Left Telemetry Deck */}
      {isDeckMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsDeckMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[#0B131E] border-r border-slate-800 p-4 overflow-y-auto h-full z-10">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Telemetry Deck
              </span>
              <button
                onClick={() => setIsDeckMobileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <LeftTelemetryDeck
              currentTab={currentTab}
              analytics={analytics}
              onOpenLogWorkout={() => {
                setIsDeckMobileOpen(false);
                onOpenLogWorkout?.();
              }}
              onNavigateTab={(tab) => {
                setIsDeckMobileOpen(false);
                if (tab === 'workouts') navigate('/workouts');
                else if (tab === 'analytics') navigate('/analytics');
                else if (tab === 'challenges') navigate('/challenges');
                else if (tab === 'community') navigate('/community');
                else if (tab === 'profile') navigate('/profile');
                else navigate('/dashboard');
              }}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ZONE 3: MAIN DYNAMIC WORKSPACE (TOP BAR + CONTENT)             */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-w-0 z-10 overflow-y-auto">
        {/* TOP APP BAR */}
        <header className="flex items-center justify-between gap-4 pb-6 w-full shrink-0">
          {/* Left: Brand mark FitPulse + Current Tab Indicator */}
          <div className="flex items-center gap-3">
            {/* Mobile Telemetry Deck Toggle */}
            <button
              onClick={() => setIsDeckMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#131E2D] border border-slate-700/60 text-emerald-400 hover:text-emerald-300"
              title="Open Telemetry Deck"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-emerald-400 to-teal-300 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0B131E] rounded-[9px] flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-emerald-400"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h6.28" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-lg font-black tracking-tight text-white hidden sm:inline">
                  FitPulse
                </span>
                <span className="text-xs font-semibold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  {tabLabel}
                </span>
                {isTrialAccount ? (
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Trial / Guest Mode
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live Athlete Account
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Date Capsule Pill, Notification Bell, Profile Chip */}
          <div className="flex items-center gap-3">
            {/* Date Capsule Pill */}
            <div className="hidden sm:block bg-[#131E2D]/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 shadow-sm">
              {formattedDate}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="w-9 h-9 rounded-xl bg-[#131E2D]/85 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B131E]" />
              </button>

              {/* Notification Drawer */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#131E2D] border border-slate-700/80 shadow-2xl p-4 z-50 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-200 pb-2 border-b border-slate-700/50">
                    <span>Clinical Telemetry Alerts</span>
                    <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0F1723] border border-slate-800 text-slate-300">
                    <p className="font-semibold text-emerald-300">Activity Rings Aligned</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Move target at 84%, Exercise exceeded at 108%.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0F1723] border border-slate-800 text-slate-300">
                    <p className="font-semibold text-cyan-300">Resting Heart Rate Steady</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cardiovascular telemetry calibrated at 72 BPM.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Chip */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="bg-[#131E2D]/85 backdrop-blur-md border border-slate-700/60 rounded-xl pl-1.5 pr-3 py-1 flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:border-slate-600 transition-all cursor-pointer"
              >
                <img
                  src={
                    user?.profile_image ||
                    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`
                  }
                  alt={user?.name || 'Sarah J.'}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                />
                <span className="font-bold text-slate-100 hidden sm:inline">{athleteName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#131E2D] border border-slate-700/80 shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-700/50">
                    <p className="font-bold text-white">{user?.name || 'Athlete'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {role === 'ADMIN' ? 'Administrator' : 'Verified Athlete'}
                    </span>
                  </div>

                  {role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/dashboard');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Admin Control Panel
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenLogWorkout?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-2 font-medium"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Log New Activity
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 flex items-center gap-2 font-medium"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Profile & Settings
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

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
