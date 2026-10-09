import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Flame, Lock, Mail, User as UserIcon, ArrowRight, Zap } from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'LOGIN' | 'REGISTER';
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'LOGIN',
  onClose,
}) => {
  const { login, register, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('sarah@fitpulse.com');
  const [password, setPassword] = useState<string>('User123!');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'LOGIN') {
        await login(email, password);
      } else {
        await register(name, email, password, 'USER');
      }
      if (onClose) onClose();
      navigate('/dashboard');
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = async (role: 'ADMIN' | 'USER') => {
    if (role === 'ADMIN') {
      setEmail('admin@fitpulse.com');
      setPassword('Admin123!');
      await switchDemoUser('ADMIN');
      if (onClose) onClose();
      navigate('/admin/dashboard');
    } else {
      setEmail('sarah@fitpulse.com');
      setPassword('User123!');
      await switchDemoUser('USER');
      if (onClose) onClose();
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-emerald-100 shadow-2xl shadow-emerald-500/5">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 mx-auto mb-3 shadow-md shadow-emerald-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Flame className="w-6 h-6 text-emerald-500 fill-emerald-500/20 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900">
          {mode === 'LOGIN' ? 'Access Clinical Portal' : 'Create Athlete Profile'}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {mode === 'LOGIN'
            ? 'Track real-time 3D biomechanics, calories, and endurance badges.'
            : 'Join the next-generation clinical fitness tracking ecosystem.'}
        </p>
      </div>

      {/* Quick 1-Click Demo Accounts Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 mb-5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          1-Click Instant Demo Credentials:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillQuickDemo('USER')}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 text-xs font-bold transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-white" /> Athlete (Sarah)
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('ADMIN')}
            className="py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white border border-teal-800 text-xs font-bold transition-all shadow-md active:scale-95 text-center"
          >
            Administrator
          </button>
        </div>
      </div>

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'REGISTER' && (
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="sarah@fitpulse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 active:scale-[0.98]"
        >
          {isSubmitting ? (
            'Authenticating...'
          ) : (
            <>
              {mode === 'LOGIN' ? 'Sign In to Portal' : 'Create Profile'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Mode Switcher */}
      <div className="mt-6 text-center text-xs text-gray-500">
        {mode === 'LOGIN' ? (
          <p>
            New athlete?{' '}
            <button
              type="button"
              onClick={() => setMode('REGISTER')}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline"
            >
              Register account
            </button>
          </p>
        ) : (
          <p>
            Already registered?{' '}
            <button
              type="button"
              onClick={() => setMode('LOGIN')}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
