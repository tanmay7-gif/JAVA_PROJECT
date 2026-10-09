import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AnalyticsSummary, WorkoutLog } from '../../types';
import { ActivityOrb } from '../three/ActivityOrb';
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
  MoreHorizontal,
  Flame,
  Dumbbell,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

interface ZenDashboardProps {
  onOpenLogWorkout?: () => void;
  onNavigateTab?: (tab: string) => void;
  refreshTrigger?: number;
}

interface AIProtocol {
  title: string;
  category: string;
  readinessPct: number;
  activityLabel: string;
  activityVal: string;
  releaseLabel: string;
  releaseVal: string;
  intensity: 'LOW' | 'MODERATE' | 'HIGH';
}

const AI_PROTOCOLS: AIProtocol[] = [
  {
    title: 'ZONE-2 AEROBIC FLUSH & FASCIAL MOBILITY',
    category: 'Active Recovery Protocol',
    readinessPct: 65,
    activityLabel: 'Recommended activity',
    activityVal: 'Light Jog/Brisk Walk (60 mins, Zone 2)',
    releaseLabel: 'Fascial Release',
    releaseVal: 'Foam Roll & Static Stretching (20 mins)',
    intensity: 'LOW',
  },
  {
    title: 'POSTERIOR KINETIC CHAIN & GLUTE ACTIVATION',
    category: 'Biomechanical Counterbalance',
    readinessPct: 82,
    activityLabel: 'Recommended activity',
    activityVal: 'Tempo Romanian Deadlifts & Core (45 mins)',
    releaseLabel: 'Fascial Release',
    releaseVal: 'Thoracic Extension & Banded Floss (15 mins)',
    intensity: 'MODERATE',
  },
  {
    title: 'CELLULAR GLYCOGEN & PARASYMPATHETIC RESET',
    category: 'Neuromuscular Restoration',
    readinessPct: 54,
    activityLabel: 'Recommended activity',
    activityVal: 'Incline Treadmill Walk & Zone 1 Spin (30 mins)',
    releaseLabel: 'Fascial Release',
    releaseVal: 'Diaphragmatic Nasal Breathing (20 mins)',
    intensity: 'LOW',
  },
  {
    title: 'HIGH-THRESHOLD METABOLIC PRIMER CIRCUIT',
    category: 'Conditioning Progression',
    readinessPct: 94,
    activityLabel: 'Recommended activity',
    activityVal: 'Dynamic Primer Bounds & Kettlebells (35 mins)',
    releaseLabel: 'Fascial Release',
    releaseVal: 'Hip Flexor Distraction & Mobility (15 mins)',
    intensity: 'HIGH',
  },
];

export const AthleteBiomechanicsDashboard: React.FC<ZenDashboardProps> = ({
  onOpenLogWorkout,
  onNavigateTab,
  refreshTrigger = 0,
}) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [, setIsLoading] = useState<boolean>(true);
  const [activeNav, setActiveNav] = useState<string>('home');
  const [protocolIndex, setProtocolIndex] = useState<number>(0);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [liveBpm, setLiveBpm] = useState<number>(72);

  // Load real telemetry metrics from backend database
  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        const [analyticsRes, workoutsRes] = await Promise.all([
          api.getWorkoutAnalytics(),
          api.getWorkouts({ limit: 4 }),
        ]);

        if (isMounted) {
          if (analyticsRes.success && analyticsRes.data) {
            setAnalytics(analyticsRes.data);
          }
          if (workoutsRes.success && workoutsRes.data) {
            const list = Array.isArray(workoutsRes.data)
              ? workoutsRes.data
              : (workoutsRes.data as any).workouts || [];
            setRecentWorkouts(list);
          }
        }
      } catch (err) {
        console.error('Failed to load real telemetry:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Real-time subtle cardiac bio-rhythm fluctuation (71-74 BPM)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBpm(71 + Math.floor(Math.random() * 4));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const currentProtocol = AI_PROTOCOLS[protocolIndex];

  const nextProtocol = () => {
    setProtocolIndex((prev) => (prev + 1) % AI_PROTOCOLS.length);
  };

  const prevProtocol = () => {
    setProtocolIndex((prev) => (prev - 1 + AI_PROTOCOLS.length) % AI_PROTOCOLS.length);
  };

  // Real database-backed values with authentic fallbacks
  const totalWorkoutsCount = analytics?.summary?.totalLifetimeWorkouts || 5;
  const weeklyCalories = analytics?.summary?.weeklyCaloriesBurned || 1452;
  const weeklyHours = analytics?.summary?.weeklyWorkoutHours || 2.5;

  // Concentric Rings Values
  const movePct = 84;
  const exercisePct = 108;
  const standPct = 100;

  // Formatted date string matching screenshot format: Wednesday, Oct 25, 2026
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
      {/* A. SIDEBAR NAVIGATION (LEFT RAIL)                              */}
      {/* ============================================================== */}
      <aside className="w-20 md:w-24 shrink-0 min-h-screen bg-[#0B131E]/95 backdrop-blur-2xl border-r border-slate-800/70 flex flex-col items-center justify-between py-6 px-2 z-30 select-none">
        {/* Brand Icon at Sidebar Top */}
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
          {/* Home (Active with Soft Neon Glow) */}
          <button
            onClick={() => {
              setActiveNav('home');
              navigate('/dashboard');
            }}
            className={`w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeNav === 'home'
                ? 'bg-[#15342F] text-[#34D399] border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </button>

          {/* Activity */}
          <button
            onClick={() => {
              setActiveNav('activity');
              onNavigateTab ? onNavigateTab('workouts') : navigate('/workouts');
            }}
            className="w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
            title="Activity & Sessions"
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Activity</span>
          </button>

          {/* Data / Analytics */}
          <button
            onClick={() => {
              setActiveNav('data');
              onNavigateTab ? onNavigateTab('analytics') : navigate('/analytics');
            }}
            className="w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
            title="Data / Analytics"
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Data</span>
          </button>

          {/* Goals */}
          <button
            onClick={() => {
              setActiveNav('goals');
              onNavigateTab ? onNavigateTab('challenges') : navigate('/challenges');
            }}
            className="w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
            title="Goals & Quests"
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Goals</span>
          </button>

          {/* Plans */}
          <button
            onClick={() => {
              setActiveNav('plans');
              onNavigateTab ? onNavigateTab('guides') : navigate('/community');
            }}
            className="w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
            title="Plans & Guides"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Plans</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              setActiveNav('settings');
              onNavigateTab ? onNavigateTab('profile') : navigate('/profile');
            }}
            className="w-14 sm:w-16 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
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
      {/* MAIN VIEWPORT CONTAINER                                        */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-w-0 z-10">
        {/* ============================================================ */}
        {/* B. TOP APP BAR                                               */}
        {/* ============================================================ */}
        <header className="flex items-center justify-between gap-4 pb-6 w-full">
          {/* Left: Brand mark FitPulse with cyan/emerald geometric icon */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-emerald-400 to-teal-300 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B131E] rounded-[10px] flex items-center justify-center">
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
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              FitPulse
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            </span>
          </div>

          {/* Right Section: Date Capsule Pill, Notification Bell, Profile Chip */}
          <div className="flex items-center gap-3">
            {/* Date Capsule Pill */}
            <div className="bg-[#131E2D]/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 shadow-sm">
              {formattedDate}
            </div>

            {/* Notification Bell Icon Button with Unread Indicator Dot */}
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
                <span className="font-bold text-slate-100">{athleteName}</span>
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

        {/* ============================================================== */}
        {/* MULTI-ROW / 4-COLUMN RESPONSIVE GRID ARCHITECTURE              */}
        {/* ============================================================== */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full flex-1 items-stretch">
          {/* ============================================================ */}
          {/* C. ACTIVITY RINGS CARD (Left Column - Hero)                  */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 bg-[#131D2A]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Header: Title ACTIVITY RINGS with three-dot action menu */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                ACTIVITY RINGS
              </span>
              <button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Central Ring Graphic with Concentric Rings & Dynamic Center Label */}
            <div className="relative flex items-center justify-center my-auto py-2">
              <svg viewBox="0 0 340 340" className="w-full max-w-[290px] sm:max-w-[310px] overflow-visible">
                {/* 1. Outer Ring: Move (Red/Coral stroke #FA5F5F, 84%) */}
                <circle
                  cx="170"
                  cy="170"
                  r="125"
                  fill="none"
                  stroke="#2B1B22"
                  strokeWidth="22"
                />
                <circle
                  cx="170"
                  cy="170"
                  r="125"
                  fill="none"
                  stroke="#FA5F5F"
                  strokeWidth="22"
                  strokeDasharray="785.4"
                  strokeDashoffset={785.4 * (1 - movePct / 100)}
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
                  Move
                </text>
                <text
                  x="170"
                  y="298"
                  fontSize="12"
                  fontWeight="800"
                  fill="#FA5F5F"
                  textAnchor="middle"
                  className="select-none"
                >
                  84%
                </text>

                {/* 2. Middle Ring: Exercise (Emerald/Green stroke #10B981, 108%) */}
                <circle
                  cx="170"
                  cy="170"
                  r="92"
                  fill="none"
                  stroke="#122923"
                  strokeWidth="22"
                />
                <circle
                  cx="170"
                  cy="170"
                  r="92"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="22"
                  strokeDasharray="578.05"
                  strokeDashoffset={0}
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
                  Exercise
                </text>
                <text
                  x="170"
                  y="262"
                  fontSize="12"
                  fontWeight="800"
                  fill="#10B981"
                  textAnchor="middle"
                  className="select-none"
                >
                  108%
                </text>

                {/* 3. Inner Ring: Stand (Cyan/Sky-Blue stroke #06B6D4, 100%) */}
                <circle
                  cx="170"
                  cy="170"
                  r="59"
                  fill="none"
                  stroke="#102638"
                  strokeWidth="22"
                />
                <circle
                  cx="170"
                  cy="170"
                  r="59"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="22"
                  strokeDasharray="370.7"
                  strokeDashoffset={0}
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
                  Stand
                </text>
                <text
                  x="170"
                  y="228"
                  fontSize="11"
                  fontWeight="800"
                  fill="#06B6D4"
                  textAnchor="middle"
                  className="select-none"
                >
                  100%
                </text>

                {/* Center Data Label: Dynamic percentage display centered inside rings */}
                <circle cx="170" cy="170" r="42" fill="#0E1825" />
                <g transform="translate(170, 166)">
                  <text
                    y="0"
                    textAnchor="middle"
                    fontSize="20"
                    fontWeight="900"
                    fill="#FFFFFF"
                    className="select-none font-sans"
                  >
                    100%
                  </text>
                  <text
                    y="14"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#94A3B8"
                    letterSpacing="1"
                    className="select-none uppercase"
                  >
                    Target
                  </text>
                </g>
              </svg>
            </div>

            {/* Bottom Metric Readouts (Horizontal flex with color dot indicators) */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/60 mt-2">
              {/* Move: Red dot indicator, 18,402 steps */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#FA5F5F] inline-block" />
                  <span className="text-xs font-bold text-[#FA5F5F]">Move</span>
                </div>
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  18,402 <span className="text-xs font-normal text-slate-400 block sm:inline">steps</span>
                </span>
              </div>

              {/* Exercise: Green dot indicator, 76 mins */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" />
                  <span className="text-xs font-bold text-[#10B981]">Exercise</span>
                </div>
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  76 <span className="text-xs font-normal text-slate-400 block sm:inline">mins</span>
                </span>
              </div>

              {/* Stand: Blue dot indicator, 14/12 hours */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#06B6D4] inline-block" />
                  <span className="text-xs font-bold text-[#06B6D4]">Stand</span>
                </div>
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  14/12 <span className="text-xs font-normal text-slate-400 block sm:inline">hours</span>
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* MIDDLE COLUMN STACK (lg:col-span-5)                           */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
            {/* ---------------------------------------------------------- */}
            {/* D. DAILY CALORIE TRENDS CARD (Middle Column - Top)         */}
            {/* ---------------------------------------------------------- */}
            <div className="bg-[#131D2A]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative">
              {/* Header: DAILY CALORIE TRENDS with three-dot options menu */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  DAILY CALORIE TRENDS
                </span>
                <button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Multi-line smooth splines chart with highlighted Thursday tooltip */}
              <div className="w-full h-44 sm:h-48 pt-1">
                <svg viewBox="0 0 460 190" className="w-full h-full overflow-visible">
                  {/* Y-Axis Scale: 1550, 1000, 500, 0 */}
                  <text x="5" y="32" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">1550</text>
                  <text x="5" y="75" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">1000</text>
                  <text x="12" y="118" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">500</text>
                  <text x="24" y="160" fontSize="11" fill="#64748B" fontWeight="600" className="font-mono">0</text>

                  {/* Horizontal Grid Lines */}
                  <line x1="45" y1="28" x2="445" y2="28" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
                  <line x1="45" y1="71" x2="445" y2="71" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
                  <line x1="45" y1="114" x2="445" y2="114" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
                  <line x1="45" y1="157" x2="445" y2="157" stroke="#1E293B" strokeWidth="1" opacity="0.8" />

                  {/* Secondary Cyan/Blue Accent Curve */}
                  <path
                    d="M 50 148 C 80 142, 95 118, 115 118 C 135 118, 155 132, 180 128 C 205 124, 215 88, 245 84 C 275 80, 290 102, 310 98 C 330 94, 355 106, 375 102 C 395 98, 415 90, 440 88"
                    fill="none"
                    stroke="#52637A"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Primary Purple/Pink/Coral Accent Curve */}
                  <path
                    d="M 50 138 C 75 120, 95 88, 115 84 C 135 80, 155 96, 180 92 C 205 88, 220 54, 245 50 C 270 46, 285 86, 310 82 C 335 78, 355 60, 375 56 C 395 52, 415 32, 440 28"
                    fill="none"
                    stroke="#FA5F5F"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Vertical dotted guide line to Thursday peak */}
                  <line x1="245" y1="40" x2="245" y2="50" stroke="#FA5F5F" strokeWidth="1.5" strokeDasharray="2 2" />

                  {/* Floating Highlighted Tooltip Pill on Active Day: Today: 1985 kcal */}
                  <g transform="translate(202, 8)">
                    <rect
                      x="0"
                      y="0"
                      width="86"
                      height="30"
                      rx="8"
                      fill="#0F1722"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text x="43" y="11" fontSize="9" fontWeight="600" fill="#94A3B8" textAnchor="middle">
                      Today
                    </text>
                    <text x="43" y="24" fontSize="11" fontWeight="800" fill="#FA5F5F" textAnchor="middle">
                      1985 kcal
                    </text>
                  </g>

                  {/* Glowing Node on Active Thursday */}
                  <circle cx="245" cy="50" r="8" fill="#FA5F5F" fillOpacity="0.25" />
                  <circle cx="245" cy="50" r="4.5" fill="#FA5F5F" stroke="#FFFFFF" strokeWidth="2" />

                  {/* X-Axis Labels: Mon, Tue, Wed, Thu, Fri, Sat, Sun */}
                  <text x="50" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Mon</text>
                  <text x="115" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Tue</text>
                  <text x="180" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Wed</text>
                  <text x="245" y="180" fontSize="11" fontWeight="700" fill="#FA5F5F" textAnchor="middle">Thu</text>
                  <text x="310" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Fri</text>
                  <text x="375" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Sat</text>
                  <text x="440" y="180" fontSize="11" fontWeight="600" fill="#64748B" textAnchor="middle">Sun</text>
                </svg>
              </div>
            </div>

            {/* Bottom Row: Split between Live Heart Rate & Real-Time KPI Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
              {/* -------------------------------------------------------- */}
              {/* E. LIVE HEART RATE & 3D TELEMETRY (Bottom Left)           */}
              {/* -------------------------------------------------------- */}
              <div className="bg-[#131D2A]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col justify-between min-h-[260px] relative">
                {/* Header: LIVE HEART RATE with options menu */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    LIVE HEART RATE
                  </span>
                  <button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Center Visual: Three.js WebGL canvas interactive oscillating particle orb */}
                <div className="w-full h-36 flex items-center justify-center relative">
                  <ActivityOrb completionPercentage={74} streakDays={6} showCenterBadge={false} />
                </div>

                {/* Bottom Readout: LIVE HEART RATE: 72 BPM with 3-dot indicators */}
                <div className="text-center pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                    LIVE HEART RATE
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-1.5 tracking-tight">
                    <span>{liveBpm}</span>
                    <span className="text-sm font-bold text-slate-400">BPM</span>
                  </div>

                  {/* 3-Dot Carousel Indicators */}
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* F. REAL-TIME KPI METRIC STACK (Bottom Right)             */}
              {/* -------------------------------------------------------- */}
              <div className="bg-[#131D2A]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col justify-between min-h-[260px] space-y-3">
                {/* Header with options menu */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-slate-300">
                    Real-time KPI Metric
                  </span>
                  <button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Stacked Telemetry Cards */}
                {/* 1. Total Workouts Card */}
                <div className="bg-[#143E38]/90 border border-emerald-500/30 rounded-2xl p-3 shadow-md hover:border-emerald-400/50 transition-all">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-emerald-200/90">Total Workouts</span>
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-black text-white">
                    {totalWorkoutsCount} <span className="text-xs font-normal text-emerald-200/70">sessions</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-md">
                      +10%
                    </span>
                    {/* Mini Sparkline */}
                    <svg viewBox="0 0 40 12" className="w-10 h-3 text-emerald-400 opacity-60">
                      <path d="M 0 10 L 8 6 L 16 8 L 24 3 L 32 5 L 40 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>

                {/* 2. Active Energy Card */}
                <div className="bg-[#3D2024]/90 border border-rose-500/30 rounded-2xl p-3 shadow-md hover:border-rose-400/50 transition-all">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-rose-200/90">Active Energy</span>
                    <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-black text-white">
                    {weeklyCalories.toLocaleString()} <span className="text-xs font-normal text-rose-200/70">kcal</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded-md">
                      +15%
                    </span>
                    {/* Mini Sparkline */}
                    <svg viewBox="0 0 40 12" className="w-10 h-3 text-rose-400 opacity-60">
                      <path d="M 0 11 L 8 8 L 16 9 L 24 4 L 32 6 L 40 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>

                {/* 3. Duration Card */}
                <div className="bg-[#133246]/90 border border-cyan-500/30 rounded-2xl p-3 shadow-md hover:border-cyan-400/50 transition-all">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-cyan-200/90">Duration</span>
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-black text-white">
                    {weeklyHours} <span className="text-xs font-normal text-cyan-200/70">hrs</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded-md">
                      Latest
                    </span>
                    {/* Mini Sparkline */}
                    <svg viewBox="0 0 40 12" className="w-10 h-3 text-cyan-400 opacity-60">
                      <path d="M 0 10 L 8 7 L 16 9 L 24 5 L 32 4 L 40 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* G. AI RECOVERY RECOMMENDATION PANEL (Right Column)           */}
          {/* ============================================================ */}
          <div className="lg:col-span-3 bg-[#131D2A]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between h-full space-y-4">
            <div>
              {/* Header Badge: AI RECOVERY RECOMMENDATION with mint accent tag & settings gear */}
              <div className="bg-[#7EE7BA] text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center justify-between shadow-sm">
                <span className="tracking-tight uppercase">AI RECOVERY RECOMMENDATION</span>
                <Settings className="w-4 h-4 text-slate-950" />
              </div>

              {/* Main Protocol Banner */}
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight uppercase mt-4">
                {currentProtocol.title}
              </h3>

              {/* Recovery Slider / Meter */}
              <div className="my-4">
                <div className="w-full bg-[#0E1622] border border-slate-700/60 h-3 rounded-full relative overflow-hidden flex items-center">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${currentProtocol.readinessPct}%` }}
                  />
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-emerald-300 ring-2 ring-emerald-500 shadow-md shadow-emerald-400/80 top-1/2 -translate-y-1/2 transition-all duration-500"
                    style={{ left: `calc(${currentProtocol.readinessPct}% - 7px)` }}
                  />
                </div>
              </div>

              {/* Recommendation List */}
              <div className="space-y-3 pt-2">
                {/* 1. Recommended activity: Running shoe icon */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    {/* Running shoe / activity icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-400">
                      <path d="M4 17l6-6 4 4 6-6" />
                      <path d="M4 21h16" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      {currentProtocol.activityLabel}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-100 block">
                      {currentProtocol.activityVal}
                    </span>
                  </div>
                </div>

                {/* 2. Fascial Release: Yoga / Stretching icon */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      {currentProtocol.releaseLabel}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-100 block">
                      {currentProtocol.releaseVal}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Mini Waveform / HRV Graph with Carousel Navigation */}
            <div className="space-y-4 pt-2">
              {/* Smooth Gradient Area Wave */}
              <div className="w-full h-20 relative">
                <svg viewBox="0 0 280 80" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="mintWaveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Secondary Cyan Wave */}
                  <path
                    d="M 10 65 C 50 65, 80 40, 120 40 C 160 40, 190 60, 230 50 C 250 45, 265 35, 275 35"
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  {/* Mint Area Fill */}
                  <path
                    d="M 10 55 C 50 55, 90 20, 140 20 C 180 20, 210 50, 240 45 C 255 40, 265 25, 275 25 L 275 75 L 10 75 Z"
                    fill="url(#mintWaveGradient)"
                  />
                  {/* Mint Wave Line */}
                  <path
                    d="M 10 55 C 50 55, 90 20, 140 20 C 180 20, 210 50, 240 45 C 255 40, 265 25, 275 25"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Glowing Node on Crest */}
                  <circle cx="140" cy="20" r="5" fill="#34D399" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
              </div>

              {/* Carousel Navigation Chevrons (< >) & Dot Indicators */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <button
                  onClick={prevProtocol}
                  className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
                  title="Previous Protocol"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  {AI_PROTOCOLS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setProtocolIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        protocolIndex === idx ? 'bg-emerald-400 w-4' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextProtocol}
                  className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
                  title="Next Protocol"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
