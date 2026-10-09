import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Goal } from '../types';
import { useToast } from '../context/ToastContext';
import { InteractiveProfileAvatar } from '../components/three/InteractiveProfileAvatar';
import {
  User as UserIcon,
  Lock,
  Mail,
  KeyRound,
  Target,
  Bell,
  CheckCircle2,
  Sparkles,
  Shield,
  Save,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  X,
  Award,
} from 'lucide-react';

type ProfileTab = 'details' | 'goals' | 'security' | 'notifications';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ProfileTab>('details');

  // Profile details state
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [profileImage, setProfileImage] = useState<string>(user?.profile_image || '');
  const [bio, setBio] = useState<string>('Clinical strength & endurance athlete tracking hypertrophy markers and metabolic pacing.');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Real Fitness Goals State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGoalsLoading, setIsGoalsLoading] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Create Goal Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<string>('DISTANCE');
  const [newTargetValue, setNewTargetValue] = useState<number>(50);
  const [newCurrentValue, setNewCurrentValue] = useState<number>(0);
  const [newUnit, setNewUnit] = useState<string>('km');
  const [newTargetDate, setNewTargetDate] = useState<string>('');
  const [isSubmittingGoal, setIsSubmittingGoal] = useState<boolean>(false);

  // Edit Goal Form State
  const [editTitle, setEditTitle] = useState<string>('');
  const [editType, setEditType] = useState<string>('DISTANCE');
  const [editTargetValue, setEditTargetValue] = useState<number>(0);
  const [editCurrentValue, setEditCurrentValue] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<string>('');
  const [editTargetDate, setEditTargetDate] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');

  // Password state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Notification toggles
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    challengeMilestones: true,
    weeklyDigest: true,
    telemetryAlerts: false,
  });

  const loadGoals = async () => {
    setIsGoalsLoading(true);
    try {
      const res = await api.getGoals();
      if (res.success && res.data) {
        setGoals(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load goals:', err);
    } finally {
      setIsGoalsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter a goal title.', 'warning');
      return;
    }
    if (newTargetValue <= 0) {
      showToast('Target value must be greater than 0.', 'warning');
      return;
    }

    setIsSubmittingGoal(true);
    try {
      const res = await api.createGoal({
        title: newTitle.trim(),
        goalType: newType,
        type: newType,
        targetValue: newTargetValue,
        target_value: newTargetValue,
        currentValue: newCurrentValue || 0,
        current_value: newCurrentValue || 0,
        unit: newUnit.trim() || 'units',
        targetDate: newTargetDate || undefined,
        target_date: newTargetDate || undefined,
      });


      if (res.success && res.data) {
        showToast('Fitness goal created successfully! 🎯', 'success');
        setGoals((prev) => [res.data, ...prev]);
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewTargetValue(50);
        setNewCurrentValue(0);
        setNewTargetDate('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create goal.', 'error');
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  const handleStartEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditType(goal.type);
    setEditTargetValue(goal.target_value ?? (goal as any).targetValue ?? 0);
    setEditCurrentValue(goal.current_value ?? (goal as any).currentValue ?? 0);
    setEditUnit(goal.unit || '');
    setEditTargetDate(goal.target_date || (goal as any).targetDate || '');
    setEditStatus(goal.status || 'ACTIVE');
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;

    try {
      const res = await api.updateGoal(editingGoal.id, {
        title: editTitle.trim(),
        type: editType,
        target_value: editTargetValue,
        current_value: editCurrentValue,
        unit: editUnit.trim() || 'units',
        target_date: editTargetDate || undefined,
        status: editStatus as any,
      });

      if (res.success && res.data) {
        showToast('Goal updated successfully!', 'success');
        setGoals((prev) => prev.map((g) => (g.id === editingGoal.id ? res.data : g)));
        setEditingGoal(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update goal.', 'error');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fitness goal?')) return;
    try {
      const res = await api.deleteGoal(id);
      if (res.success) {
        showToast('Fitness goal deleted.', 'info');
        setGoals((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete goal.', 'error');
    }
  };

  const handleQuickIncrement = async (goal: Goal, step: number = 1) => {
    try {
      const res = await api.incrementGoal(goal.id, step);
      if (res.success && res.data) {
        showToast(`Progress logged: +${step} ${goal.unit}! 💪`, 'success');
        setGoals((prev) => prev.map((g) => (g.id === goal.id ? res.data : g)));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to increment goal.', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        profile_image: profileImage.trim() || undefined,
      });
      if (res.success && res.data) {
        updateUser(res.data);
        showToast('Personal details updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update personal details.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };


  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'warning');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      showToast(res.message || 'Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-sky-100 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-[10px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3 text-sky-600" />
          Interactive 3D Physical Rig & Profile Architecture
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Athlete Profile & Biometric Persona
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rotate your personal 3D avatar rig, audit muscle recovery hotspots, and manage account credentials.
        </p>
      </div>

      {/* Main Grid: Left 3D Avatar (5 cols), Right Tabbed Settings (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive 3D Avatar Rig (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <InteractiveProfileAvatar
            goalProgress={84}
            userName={name || 'Athlete'}
          />

          {/* Quick Athlete Badge Card */}
          <div className="clinical-card p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    name || 'Athlete'
                  )}`
                }
                alt={name}
                className="w-12 h-12 rounded-full border-2 border-sky-200 object-cover shadow-sm"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{name || 'Athlete'}</h4>
                <p className="text-[11px] text-slate-500">{email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                    {user?.role} Tier
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">• Joined 2026</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                Active Protocol
              </span>
              <span className="text-xs font-bold text-sky-700">Hypertrophy V4</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Settings Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Clinical Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-sky-100 rounded-2xl shadow-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'details'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/50'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Personal Details
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'goals'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Fitness Goals
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'security'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Security & Credentials
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'notifications'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Preferences
            </button>
          </div>

          {/* TAB 1: Personal Details Panel */}
          {activeTab === 'details' && (
            <div className="clinical-card p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                  <p className="text-xs text-slate-500">Update your clinical identity and public profile</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Verified ID
                </span>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter athlete display name..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="athlete@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or DiceBear seed URL"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bordered cleanly in sky-200 across all leaderboard and session views.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Clinical Bio / Athletic Focus
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Detail your conditioning targets, injuries, or athletic focus..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 resize-none shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Fitness Goals Panel - Full CRUD */}
          {activeTab === 'goals' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Goals Header Card */}
              <div className="clinical-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[10px] font-bold uppercase tracking-wider border border-sky-100 mb-1">
                    <Target className="w-3 h-3 text-sky-600" />
                    Fitness Goals Engine
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Personal Fitness Goals & Benchmarks</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track targets, deadlines, live metrics, and real completion percentages.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-200 transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Goal</span>
                </button>
              </div>

              {/* Goals Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-sky-100 shadow-sm text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Goals</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{goals.length}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-sky-100 shadow-sm text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Active</span>
                  <div className="text-xl font-black text-sky-600 mt-0.5">
                    {goals.filter((g) => g.status === 'ACTIVE').length}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-sky-100 shadow-sm text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Completed</span>
                  <div className="text-xl font-black text-teal-600 mt-0.5">
                    {goals.filter((g) => g.status === 'COMPLETED').length}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-sky-100 shadow-sm text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Avg Progress</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {goals.length > 0
                      ? Math.round(
                          goals.reduce((acc, g) => acc + (g.progress_percentage ?? 0), 0) /
                            goals.length
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>

              {/* Goals List */}
              {isGoalsLoading ? (
                <div className="p-12 text-center text-xs font-bold text-sky-600">
                  Loading goals telemetry...
                </div>
              ) : goals.length === 0 ? (
                <div className="clinical-card p-12 text-center border-dashed">
                  <Target className="w-10 h-10 text-sky-500 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-900">No Goals Created Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                    Define structured milestones for workout volume, distance, calories, or weight to power your performance analytics.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-200 inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Create Your First Goal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal) => {
                    const targetVal = goal.target_value ?? (goal as any).targetValue ?? 1;
                    const currVal = goal.current_value ?? (goal as any).currentValue ?? 0;
                    const pct = Math.min(100, Math.round(goal.progress_percentage ?? (currVal / targetVal) * 100));
                    const isCompleted = goal.status === 'COMPLETED' || pct >= 100;

                    return (
                      <div
                        key={goal.id}
                        className={`clinical-card p-5 space-y-4 border transition-all ${
                          isCompleted
                            ? 'border-sky-300 ring-2 ring-sky-500/20 shadow-sm'
                            : 'border-slate-150 hover:border-sky-200'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                                {goal.type}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  goal.status === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : goal.status === 'PAUSED'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                                }`}
                              >
                                {goal.status}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900">{goal.title}</h4>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleStartEdit(goal)}
                              title="Edit Goal"
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-sky-700 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              title="Delete Goal"
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Values & Bar */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between text-xs font-bold">
                            <span className="text-slate-900">
                              {currVal} / {targetVal} <span className="text-slate-500 font-normal">{goal.unit}</span>
                            </span>
                            <span className="text-sky-700">{pct}%</span>
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-sky-400 to-sky-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Deadline & Quick Action Bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {goal.target_date || (goal as any).targetDate
                              ? `Deadline: ${new Date(goal.target_date || (goal as any).targetDate).toLocaleDateString()}`
                              : 'No deadline'}
                          </span>

                          <button
                            onClick={() => handleQuickIncrement(goal, goal.unit === 'km' ? 2.5 : 1)}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Log +{goal.unit === 'km' ? 2.5 : 1} {goal.unit}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Create Goal Modal */}
              {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sky-100 space-y-6">
                    <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Create Fitness Goal</h3>
                        <p className="text-xs text-slate-500">Establish a measurable athletic milestone</p>
                      </div>
                      <button
                        onClick={() => setIsCreateModalOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateGoal} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Goal Title
                        </label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Run 50 km this month"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Category / Type
                          </label>
                          <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                          >
                            <option value="DISTANCE">Distance</option>
                            <option value="WORKOUT_COUNT">Sessions Count</option>
                            <option value="CALORIES">Calories</option>
                            <option value="DURATION">Duration (mins)</option>
                            <option value="WEIGHT">Bodyweight</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Unit
                          </label>
                          <input
                            type="text"
                            required
                            value={newUnit}
                            onChange={(e) => setNewUnit(e.target.value)}
                            placeholder="km, workouts, kcal..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Target Value
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            required
                            value={newTargetValue}
                            onChange={(e) => setNewTargetValue(parseFloat(e.target.value) || 0)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Starting Value
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={newCurrentValue}
                            onChange={(e) => setNewCurrentValue(parseFloat(e.target.value) || 0)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Target Deadline
                        </label>
                        <input
                          type="date"
                          value={newTargetDate}
                          onChange={(e) => setNewTargetDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingGoal}
                          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-200"
                        >
                          {isSubmittingGoal ? 'Creating...' : 'Create Goal'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Goal Modal */}
              {editingGoal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sky-100 space-y-6">
                    <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Update Fitness Goal</h3>
                        <p className="text-xs text-slate-500">Edit values, status, or deadline</p>
                      </div>
                      <button
                        onClick={() => setEditingGoal(null)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateGoal} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Goal Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Status
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="PAUSED">PAUSED</option>
                            <option value="ABANDONED">ABANDONED</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Unit
                          </label>
                          <input
                            type="text"
                            required
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Target Value
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            required
                            value={editTargetValue}
                            onChange={(e) => setEditTargetValue(parseFloat(e.target.value) || 0)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Current Value
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={editCurrentValue}
                            onChange={(e) => setEditCurrentValue(parseFloat(e.target.value) || 0)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Target Deadline
                        </label>
                        <input
                          type="date"
                          value={editTargetDate ? editTargetDate.split('T')[0] : ''}
                          onChange={(e) => setEditTargetDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setEditingGoal(null)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-200"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* TAB 3: Security & Credentials Panel */}
          {activeTab === 'security' && (
            <div className="clinical-card p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Security Credentials</h3>
                    <p className="text-xs text-slate-500">Update account password with bcrypt validation</p>
                  </div>
                </div>
                <Shield className="w-4 h-4 text-sky-600" />
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {isChangingPassword ? 'Verifying...' : 'Update Password Safeguard'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Notification Preferences Panel */}
          {activeTab === 'notifications' && (
            <div className="clinical-card p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Telemetry Notification Preferences</h3>
                  <p className="text-xs text-slate-500">Control automated alerts and challenge milestone triggers</p>
                </div>
                <Bell className="w-5 h-5 text-sky-600" />
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'workoutReminders',
                    title: 'Daily Conditioning Reminders',
                    description: 'Receive morning notifications to hit your scheduled workout session.',
                  },
                  {
                    key: 'challengeMilestones',
                    title: 'Challenge Progress & Badges',
                    description: 'Alert when a 3D holographic challenge badge is within 10% of unlock.',
                  },
                  {
                    key: 'weeklyDigest',
                    title: 'Weekly Clinical Biometric Digest',
                    description: 'Comprehensive report on metabolic efficiency, total hours, and intensity curve.',
                  },
                  {
                    key: 'telemetryAlerts',
                    title: 'System Telemetry & Audit Logs',
                    description: 'Real-time security alerts when login occurs from an unverified browser.',
                  },
                ].map((item) => {
                  const isChecked = notifications[item.key as keyof typeof notifications];
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof notifications],
                        }));
                        showToast(`Preference for "${item.title}" updated`, 'info');
                      }}
                      className="p-4 rounded-xl border border-sky-100 bg-sky-50/30 hover:bg-sky-50/60 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      </div>

                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                          isChecked ? 'bg-sky-500' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                            isChecked ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
