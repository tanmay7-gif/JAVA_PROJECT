import React, { useState } from 'react';
import {
  Users,
  Search,
  Download,
  ShieldCheck,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Trash2,
  X,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface AthleteUser {
  id: string;
  name: string;
  email: string;
  role: 'Athlete' | 'Administrator' | 'Coach';
  status: 'Active' | 'Suspended';
  workoutsLogged: number;
  totalXp: number;
  joinedDate: string;
  bio: string;
  avatarUrl: string;
  recentWorkouts: { id: string; title: string; timeAgo: string }[];
  badgesUnlocked: { id: string; name: string; icon: string }[];
}

const INITIAL_ATHLETES: AthleteUser[] = [
  {
    id: 'u1',
    name: 'Sarah Connor',
    email: 'sarah.c@fitpulse.com',
    role: 'Athlete',
    status: 'Active',
    workoutsLogged: 42,
    totalXp: 1450,
    joinedDate: 'Jan 12, 2026',
    bio: 'Endurance athlete preparing for sub-3h marathon. Focused on cadence and VO2 peak.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recentWorkouts: [
      { id: 'w1', title: 'Leg & Core Hypertrophy', timeAgo: '48m ago' },
      { id: 'w2', title: 'Outdoor Metabolic Conditioning', timeAgo: '2d ago' },
      { id: 'w3', title: 'Upper Body Push Threshold', timeAgo: '4d ago' }
    ],
    badgesUnlocked: [
      { id: 'b1', name: 'Century Club', icon: '🏋️‍♂️' },
      { id: 'b2', name: '5-Day Streak Master', icon: '🔥' },
      { id: 'b3', name: 'Night Owl Runner', icon: '🌙' }
    ]
  },
  {
    id: 'u2',
    name: 'Marcus Vance',
    email: 'marcus.v@fitpulse.com',
    role: 'Administrator',
    status: 'Active',
    workoutsLogged: 118,
    totalXp: 3820,
    joinedDate: 'Nov 03, 2025',
    bio: 'Lead System Architect & Admin. Heavy compound lifting practitioner.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    recentWorkouts: [
      { id: 'w4', title: 'Heavy Deadlift & Lat Pulls', timeAgo: '3h ago' },
      { id: 'w5', title: 'Incline Bench Press Focus', timeAgo: '1d ago' },
      { id: 'w6', title: 'Active Mobility Recovery', timeAgo: '3d ago' }
    ],
    badgesUnlocked: [
      { id: 'b4', name: 'Sub-25 5K Peak', icon: '⚡' },
      { id: 'b5', name: 'Iron Core Titan', icon: '🛡️' }
    ]
  },
  {
    id: 'u3',
    name: 'Elena Rostova',
    email: 'elena.r@fitness.net',
    role: 'Coach',
    status: 'Active',
    workoutsLogged: 89,
    totalXp: 2910,
    joinedDate: 'Dec 08, 2025',
    bio: 'Certified strength & hypertrophy coach. Protocol design consultant.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    recentWorkouts: [
      { id: 'w7', title: 'Calisthenics Skill Circuit', timeAgo: '5h ago' },
      { id: 'w8', title: 'Glute & Hamstring Focus', timeAgo: '2d ago' },
      { id: 'w9', title: 'Sprint Interval HIIT', timeAgo: '5d ago' }
    ],
    badgesUnlocked: [
      { id: 'b6', name: 'Century Club', icon: '🏋️‍♂️' },
      { id: 'b7', name: 'Ultra Marathoner', icon: '🏃' }
    ]
  },
  {
    id: 'u4',
    name: 'David Miller',
    email: 'david.m@pulse.io',
    role: 'Athlete',
    status: 'Active',
    workoutsLogged: 15,
    totalXp: 620,
    joinedDate: 'Feb 19, 2026',
    bio: 'Calisthenics novice working on bodyweight pull-up volume.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    recentWorkouts: [
      { id: 'w10', title: 'Push-up & Dip Ladder', timeAgo: '1d ago' },
      { id: 'w11', title: 'Core Hold Protocol', timeAgo: '4d ago' }
    ],
    badgesUnlocked: [
      { id: 'b8', name: 'Night Owl Runner', icon: '🌙' }
    ]
  },
  {
    id: 'u5',
    name: 'Jake Paulson',
    email: 'jake99@spam.com',
    role: 'Athlete',
    status: 'Suspended',
    workoutsLogged: 1,
    totalXp: 40,
    joinedDate: 'Oct 01, 2026',
    bio: 'Flagged account awaiting security review.',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    recentWorkouts: [
      { id: 'w12', title: 'Initial Baseline Assessment', timeAgo: '5d ago' }
    ],
    badgesUnlocked: []
  }
];

export const UsersDirectory: React.FC = () => {
  const [athletes, setAthletes] = useState<AthleteUser[]>(INITIAL_ATHLETES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'ATHLETE' | 'ADMIN' | 'SUSPENDED'>('ALL');
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Status toggle handler
  const handleToggleStatus = (id: string) => {
    setAthletes((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'Active' ? 'Suspended' : 'Active';
          showToast(`Account ${a.name} is now ${nextStatus}`);
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  // Quick Action Handlers inside Drawer
  const handleResetPassword = (name: string) => {
    showToast(`Password reset link dispatched to ${name}`);
  };

  const handleChangeRole = (id: string, newRole: 'Athlete' | 'Administrator' | 'Coach') => {
    setAthletes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, role: newRole } : a))
    );
    if (selectedAthlete) {
      setSelectedAthlete((prev) => (prev ? { ...prev, role: newRole } : null));
    }
    showToast(`Role updated to ${newRole}`);
  };

  const handleDeleteAccount = (id: string, name: string) => {
    setAthletes((prev) => prev.filter((a) => a.id !== id));
    setSelectedAthlete(null);
    showToast(`Account ${name} permanently deleted from registry`);
  };

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = 'ID,Name,Email,Role,Status,Workouts,XP,JoinedDate\n';
    const rows = athletes
      .map(
        (a) =>
          `"${a.id}","${a.name}","${a.email}","${a.role}","${a.status}",${a.workoutsLogged},${a.totalXp},"${a.joinedDate}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fitpulse_users_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Export generated and downloaded successfully!');
  };

  // Filtering
  const filteredAthletes = athletes.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    if (filterRole === 'ATHLETE') matchesFilter = a.role === 'Athlete';
    if (filterRole === 'ADMIN') matchesFilter = a.role === 'Administrator';
    if (filterRole === 'SUSPENDED') matchesFilter = a.status === 'Suspended';
    return matchesSearch && matchesFilter;
  });

  const totalAccounts = athletes.length;
  const activeAthletesToday = athletes.filter((a) => a.status === 'Active').length;
  const suspendedCount = athletes.filter((a) => a.status === 'Suspended').length;

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800 p-4 sm:p-6 lg:p-8 font-sans space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-mono font-bold px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Batch Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Governance & Account Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Athletes & User Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Audit registered accounts, role privileges, total workout telemetry, and account activation states.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-mono font-bold border border-slate-300/80 shadow-sm active:scale-[0.98] transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Batch Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Total Accounts
            </span>
            <span className="text-2xl font-black font-mono tabular-nums text-slate-900">
              {totalAccounts}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Active Athletes
            </span>
            <span className="text-2xl font-black font-mono tabular-nums text-emerald-600">
              {activeAthletesToday}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Suspended Accounts
            </span>
            <span className="text-2xl font-black font-mono tabular-nums text-rose-600">
              {suspendedCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Search, Filter & Pagination Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by athlete name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-mono font-bold">
          <button
            onClick={() => setFilterRole('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterRole === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setFilterRole('ATHLETE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterRole === 'ATHLETE'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Athletes
          </button>
          <button
            onClick={() => setFilterRole('ADMIN')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterRole === 'ADMIN'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Administrators
          </button>
          <button
            onClick={() => setFilterRole('SUSPENDED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterRole === 'SUSPENDED'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Suspended
          </button>
        </div>
      </div>

      {/* 3. User Table View */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Athlete Details</th>
                <th className="py-3.5 px-4">Role Badge</th>
                <th className="py-3.5 px-4">Workouts Logged</th>
                <th className="py-3.5 px-4">Total Points (XP)</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAthletes.map((athlete) => (
                <tr
                  key={athlete.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Athlete Info */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={athlete.avatarUrl}
                        alt={athlete.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                      <div>
                        <div className="font-bold text-slate-900 font-display">
                          {athlete.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {athlete.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        athlete.role === 'Administrator'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : athlete.role === 'Coach'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {athlete.role === 'Administrator' && (
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      )}
                      {athlete.role}
                    </span>
                  </td>

                  {/* Workouts */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold tabular-nums text-slate-900">
                    {athlete.workoutsLogged} <span className="text-slate-400 font-normal text-[11px]">sessions</span>
                  </td>

                  {/* Total XP */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold tabular-nums text-amber-600">
                    {athlete.totalXp.toLocaleString()} XP
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        athlete.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {athlete.status}
                    </span>
                  </td>

                  {/* Quick Action Buttons */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedAthlete(athlete)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Inspect Profile</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(athlete.id)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all active:scale-[0.98] ${
                          athlete.status === 'Active'
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {athlete.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            Showing 1–{filteredAthletes.length} of {totalAccounts} athletes
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800">Page {currentPage}</span>
            <button
              disabled
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Athlete Inspection Slide-Over Drawer / Modal */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-slate-200 animate-in slide-in-from-right duration-300 relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedAthlete(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Overview */}
            <div className="flex items-center gap-4 pt-2">
              <img
                src={selectedAthlete.avatarUrl}
                alt={selectedAthlete.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-md"
              />
              <div>
                <h3 className="text-xl font-black text-slate-900 font-display">
                  {selectedAthlete.name}
                </h3>
                <span className="text-xs font-mono text-slate-400 block">
                  {selectedAthlete.email}
                </span>
                <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 uppercase">
                  {selectedAthlete.role}
                </span>
              </div>
            </div>

            {/* Bio & Joined Date */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div>
                <span className="font-mono font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Athlete Bio
                </span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">
                  {selectedAthlete.bio}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-500 font-mono">
                <span>Joined Platform:</span>
                <span className="font-bold text-slate-800">{selectedAthlete.joinedDate}</span>
              </div>
            </div>

            {/* Recent 3 Logged Workouts */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Recent Logged Sessions
              </h4>
              <div className="space-y-2">
                {selectedAthlete.recentWorkouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-800">{w.title}</span>
                    <span className="text-[11px] font-mono text-slate-400">{w.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges Unlocked Showcase */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Unlocked Badges ({selectedAthlete.badgesUnlocked.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedAthlete.badgesUnlocked.map((b) => (
                  <span
                    key={b.id}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Administrative Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Administrative Controls
              </h4>

              <div className="space-y-2 font-mono text-xs">
                <button
                  onClick={() => handleResetPassword(selectedAthlete.name)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300/80 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reset Athlete Password</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleChangeRole(
                        selectedAthlete.id,
                        selectedAthlete.role === 'Administrator' ? 'Athlete' : 'Administrator'
                      )
                    }
                    className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-all text-center"
                  >
                    Set {selectedAthlete.role === 'Administrator' ? 'Athlete' : 'Admin'} Role
                  </button>

                  <button
                    onClick={() => handleDeleteAccount(selectedAthlete.id, selectedAthlete.name)}
                    className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
