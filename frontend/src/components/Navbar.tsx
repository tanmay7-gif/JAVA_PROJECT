import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Activity,
  PlusCircle,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Users,
  Sliders,
  Award,
  BookOpen,
  BarChart3,
  ListTodo,
} from 'lucide-react';

interface NavbarProps {
  onOpenLogWorkout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogWorkout }) => {
  const { user, role, logout, switchDemoUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userTabs = [
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/workouts', label: 'Workouts', icon: ListTodo },
    { path: '/analytics', label: '3D Analytics', icon: BarChart3 },
    { path: '/challenges', label: 'Arena & Badges', icon: Award },
    { path: '/community', label: 'Guides', icon: BookOpen },
    { path: '/profile', label: '3D Profile', icon: UserIcon },
  ];

  const adminTabs = [
    { path: '/admin/dashboard', label: 'Overview', icon: Activity },
    { path: '/admin/users', label: 'Users Directory', icon: Users },
    { path: '/admin/moderation', label: 'Moderation Queue', icon: BookOpen },
    { path: '/admin/settings', label: 'System Settings', icon: Sliders },
  ];

  const handleRoleSwitch = (newRole: 'USER' | 'ADMIN') => {
    switchDemoUser(newRole);
    if (newRole === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const navLinks = role === 'ADMIN' ? adminTabs : userTabs;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo Link */}
          <Link
            to={role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-sky-500 fill-sky-500/20" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-sky-900 to-sky-700 bg-clip-text text-transparent">
                FitPulse
              </span>
              <span className="text-[10px] block font-semibold uppercase tracking-wider text-sky-600 -mt-1">
                Clinical Wellness OS
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 py-1">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                location.pathname === tab.path ||
                (tab.path !== '/dashboard' &&
                  tab.path !== '/admin/dashboard' &&
                  location.pathname.startsWith(tab.path));

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/50'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Log Button (Always available for Athletes) */}
            {role === 'USER' && (
              <button
                onClick={onOpenLogWorkout}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-200 hover:shadow-md transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Log Workout</span>
              </button>
            )}

            {/* Quick Demo Switcher Widget */}
            <div className="hidden lg:flex items-center bg-slate-100/80 border border-slate-200 rounded-xl p-1 text-xs">
              <span className="text-[11px] text-slate-500 px-2 font-medium">Demo:</span>
              <button
                onClick={() => handleRoleSwitch('USER')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  role === 'USER'
                    ? 'bg-white text-sky-700 shadow-sm border border-sky-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Athlete
              </button>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  role === 'ADMIN'
                    ? 'bg-white text-sky-700 shadow-sm border border-sky-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* User Profile Pill */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <img
                    src={
                      user.profile_image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        user.name
                      )}`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-sky-200 object-cover shadow-sm"
                  />
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-none">
                      {user.name}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 border ${
                        role === 'ADMIN'
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      {role}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-sky-100">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
