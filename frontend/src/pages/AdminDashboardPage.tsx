import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { Challenge } from '../types';
import { AdminAppLayout, AdminTabType } from '../components/layout/AdminAppLayout';
import { useAuth } from '../context/AuthContext';
import { generateTrialAdminData } from '../utils/mockTrialData';
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  X,
  CheckCircle2,
  XCircle,
  Users,
  Zap,
  Settings,
  ShieldCheck,
  Search,
  RefreshCw,
  FileText,
  Activity,
  Flame,
  TrendingUp,
  Eye,
  Filter,
  Lock,
} from 'lucide-react';

export type TabType = AdminTabType;

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  workoutsCount?: number;
  workoutsLogged?: number;
  joinedDate?: string;
  createdAt?: string;
  status: 'Active' | 'Suspended';
  is_active?: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  media_url?: string | null;
  feedback?: string | null;
  created_at: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    profile_image?: string | null;
  };
}

export interface SettingItem {
  id?: string;
  key: string;
  value: string;
  description?: string | null;
  updated_at?: string;
}

export interface AdminDashboardProps {
  initialTab?: TabType;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview' }) => {
  const { isTrialAccount } = useAuth();
  const trialAdminData = useMemo(() => generateTrialAdminData(), []);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Overview State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState<boolean>(false);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);

  // Users Directory State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'USER' | 'ADMIN'>('USER');

  // Challenge Management State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isChallengesLoading, setIsChallengesLoading] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [monitoredChallenge, setMonitoredChallenge] = useState<any | null>(null);
  const [isMonitoringLoading, setIsMonitoringLoading] = useState<boolean>(false);
  const [chTitle, setChTitle] = useState('');
  const [chDescription, setChDescription] = useState('');
  const [chTargetMetric, setChTargetMetric] = useState<'CALORIES' | 'DURATION' | 'WORKOUT_COUNT'>('WORKOUT_COUNT');
  const [chTargetValue, setChTargetValue] = useState(5);
  const [chStartDate, setChStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [chEndDate, setChEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [chRewardBadge, setChRewardBadge] = useState('');
  const [chRewardXp, setChRewardXp] = useState(250);

  // Content Moderation State
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [isContentLoading, setIsContentLoading] = useState<boolean>(false);
  const [contentFilter, setContentFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [rejectingItem, setRejectingItem] = useState<ContentItem | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState<boolean>(false);
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [activityPage, setActivityPage] = useState<number>(1);
  const [activityTotal, setActivityTotal] = useState<number>(0);
  const [selectedLogDetails, setSelectedLogDetails] = useState<any | null>(null);

  // Settings State
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [isSettingsLoading, setIsSettingsLoading] = useState<boolean>(false);
  const [isAddSettingModalOpen, setIsAddSettingModalOpen] = useState(false);
  const [newSettingKey, setNewSettingKey] = useState('');
  const [newSettingVal, setNewSettingVal] = useState('');
  const [newSettingDesc, setNewSettingDesc] = useState('');

  // Notification Toast State
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const notify = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  }, []);

  // 1. Load Overview Telemetry & Real Database Statistics
  const loadDashboard = useCallback(async () => {
    setIsDashboardLoading(true);
    setIsStatsLoading(true);
    try {
      const [dashRes, statsRes] = await Promise.allSettled([
        api.getAdminDashboard(),
        api.getAdminStatistics(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.success && dashRes.value.data) {
        setDashboardData(dashRes.value.data);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.success && statsRes.value.data) {
        setPlatformStats(statsRes.value.data);
      }
    } catch (err: any) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setIsDashboardLoading(false);
      setIsStatsLoading(false);
    }
  }, []);

  // 2. Load Activity Monitoring Logs
  const loadActivityLogs = useCallback(async () => {
    setIsActivityLoading(true);
    try {
      const res = await api.getActivityLogs({
        page: activityPage,
        limit: 25,
        action: activityFilter === 'ALL' ? undefined : activityFilter,
        search: activitySearch.trim() || undefined,
      });

      if (res.success && res.data) {
        setActivityLogs(res.data);
        if (res.pagination?.total !== undefined) {
          setActivityTotal(res.pagination.total);
        }
      }
    } catch (err: any) {
      notify(err.message || 'Failed to load activity logs', 'error');
    } finally {
      setIsActivityLoading(false);
    }
  }, [activityPage, activityFilter, activitySearch, notify]);

  // 3. Load Users
  const loadUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const res = await api.getAdminUsers({
        search: userSearch.trim() || undefined,
        role: userRoleFilter === 'ALL' ? undefined : userRoleFilter,
        status: userStatusFilter === 'ALL' ? undefined : userStatusFilter,
      });
      if (res.success && res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err: any) {
      notify(err.message || 'Failed to load users directory', 'error');
    } finally {
      setIsUsersLoading(false);
    }
  }, [userSearch, userRoleFilter, userStatusFilter, notify]);

  // 4. Load Challenges
  const loadChallenges = useCallback(async () => {
    setIsChallengesLoading(true);
    try {
      const res = await api.getChallenges();
      if (res.success && res.data) {
        setChallenges(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load challenges:', err);
    } finally {
      setIsChallengesLoading(false);
    }
  }, []);

  // 5. Load Content
  const loadContent = useCallback(async () => {
    setIsContentLoading(true);
    try {
      const statusParam = contentFilter === 'ALL' ? undefined : contentFilter;
      const res = await api.getAllContentAdmin(statusParam);
      if (res.success && res.data) {
        setContentList(res.data);
      }
    } catch (err: any) {
      notify(err.message || 'Failed to load moderation content', 'error');
    } finally {
      setIsContentLoading(false);
    }
  }, [contentFilter, notify]);

  // 6. Load Settings
  const loadSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    try {
      const res = await api.getSystemSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      notify(err.message || 'Failed to load system settings', 'error');
    } finally {
      setIsSettingsLoading(false);
    }
  }, [notify]);

  // Master refresh function
  const handleRefreshAll = useCallback(() => {
    loadDashboard();
    loadUsers();
    loadContent();
    loadSettings();
    loadActivityLogs();
    loadChallenges();
    notify('Platform telemetry synchronized with database.', 'success');
  }, [loadDashboard, loadUsers, loadContent, loadSettings, loadActivityLogs, loadChallenges, notify]);

  // Initial tab loading
  useEffect(() => {
    if (activeTab === 'overview') loadDashboard();
    if (activeTab === 'activity') loadActivityLogs();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'challenges') loadChallenges();
    if (activeTab === 'moderation') loadContent();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab, loadDashboard, loadActivityLogs, loadUsers, loadChallenges, loadContent, loadSettings]);

  // ==========================================
  // USER ACTIONS
  // ==========================================
  const handleToggleUserStatus = async (user: UserItem) => {
    const nextActive = user.status !== 'Active';
    try {
      const res = await api.toggleUserStatus(user.id, nextActive);
      if (res.success) {
        notify(`User ${user.name} is now ${nextActive ? 'Active' : 'Suspended'}`);
        loadUsers();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleUpdateUserRole = async (user: UserItem, newRole: string) => {
    try {
      const res = await api.updateUserRole(user.id, newRole);
      if (res.success) {
        notify(`User role elevated/demoted to ${newRole}`);
        loadUsers();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (!window.confirm(`Permanently delete account for "${user.name}"? This cannot be undone.`)) return;
    try {
      const res = await api.deleteAdminUser(user.id);
      if (res.success) {
        notify(`Account for "${user.name}" removed successfully.`);
        loadUsers();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await api.updateAdminUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      });
      if (res.success) {
        notify('User account details updated successfully.');
        setEditingUser(null);
        loadUsers();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to update user', 'error');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAdminUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
      });
      if (res.success) {
        notify(`New user account "${newUserName}" created.`);
        setIsCreateUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        loadUsers();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to create user', 'error');
    }
  };

  // ==========================================
  // CONTENT MODERATION ACTIONS
  // ==========================================
  const handleApproveContent = async (item: ContentItem) => {
    try {
      const res = await api.moderateContentAdmin(item.id, 'APPROVED');
      if (res.success) {
        notify(`Guide "${item.title}" approved and published to community.`);
        loadContent();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to approve guide', 'error');
    }
  };

  const handleConfirmRejectContent = async () => {
    if (!rejectingItem) return;
    try {
      const res = await api.moderateContentAdmin(rejectingItem.id, 'REJECTED', rejectionFeedback.trim());
      if (res.success) {
        notify(`Guide "${rejectingItem.title}" marked as REJECTED.`);
        setRejectingItem(null);
        setRejectionFeedback('');
        loadContent();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to reject guide', 'error');
    }
  };

  const handleDeleteContent = async (item: ContentItem) => {
    if (!window.confirm(`Permanently delete guide "${item.title}"?`)) return;
    try {
      const res = await api.deleteContentAdmin(item.id);
      if (res.success) {
        notify('Fitness guide deleted permanently.');
        loadContent();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to delete guide', 'error');
    }
  };

  // ==========================================
  // SYSTEM SETTINGS ACTIONS
  // ==========================================
  const handleToggleSetting = async (setting: SettingItem) => {
    const isTrue = setting.value === 'true';
    const nextVal = isTrue ? 'false' : 'true';
    try {
      const res = await api.updateSystemSetting(setting.key, nextVal, setting.description || undefined);
      if (res.success) {
        notify(`Setting "${setting.key}" updated to ${nextVal}`);
        setSettings((prev) =>
          prev.map((s) => (s.key === setting.key ? { ...s, value: nextVal } : s))
        );
      }
    } catch (err: any) {
      notify(err.message || 'Failed to update setting', 'error');
    }
  };

  const handleSaveTextSetting = async (key: string, value: string, description?: string | null) => {
    try {
      const res = await api.updateSystemSetting(key, value, description || undefined);
      if (res.success) {
        notify(`Configuration "${key}" persisted to database.`);
        loadSettings();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to save setting', 'error');
    }
  };

  const handleCreateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSettingKey.trim()) return;
    try {
      const res = await api.updateSystemSetting(newSettingKey.trim(), newSettingVal.trim(), newSettingDesc.trim());
      if (res.success) {
        notify(`Setting "${newSettingKey}" added to database.`);
        setIsAddSettingModalOpen(false);
        setNewSettingKey('');
        setNewSettingVal('');
        setNewSettingDesc('');
        loadSettings();
      }
    } catch (err: any) {
      notify(err.message || 'Failed to add setting', 'error');
    }
  };

  // ==========================================
  // CHALLENGES ACTIONS
  // ==========================================
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createChallengeAdmin({
        title: chTitle.trim(),
        description: chDescription.trim(),
        target_metric: chTargetMetric,
        target_value: chTargetValue,
        start_date: new Date(chStartDate).toISOString(),
        end_date: new Date(chEndDate).toISOString(),
        reward_badge: chRewardBadge.trim(),
        reward_xp: chRewardXp,
      });

      if (res.success && res.data) {
        notify('Fitness challenge published successfully.');
        setChallenges((prev) => [res.data, ...prev]);
        setIsCreateModalOpen(false);
        setChTitle('');
        setChDescription('');
      }
    } catch (err: any) {
      notify(err.message || 'Failed to create challenge', 'error');
    }
  };

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;

    try {
      const res = await api.updateChallengeAdmin(editingChallenge.id, {
        title: editingChallenge.title,
        description: editingChallenge.description,
        target_metric: editingChallenge.target_metric,
        target_value: editingChallenge.target_value,
        reward_badge: editingChallenge.reward_badge,
        reward_xp: editingChallenge.reward_xp,
      });

      if (res.success && res.data) {
        notify('Challenge parameters updated successfully.');
        setChallenges((prev) =>
          prev.map((c) => (c.id === editingChallenge.id ? res.data : c))
        );
        setEditingChallenge(null);
      }
    } catch (err: any) {
      notify(err.message || 'Failed to update challenge', 'error');
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!window.confirm('Delete this challenge and purge all participant enrollments?')) return;
    try {
      const res = await api.deleteChallengeAdmin(id);
      if (res.success) {
        notify('Challenge archived.');
        setChallenges((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err: any) {
      notify(err.message || 'Failed to delete challenge', 'error');
    }
  };

  const handleOpenMonitor = async (id: string) => {
    setIsMonitoringLoading(true);
    setMonitoredChallenge(null);
    try {
      const res = await api.monitorChallengeAdmin(id);
      if (res.success && res.data) {
        setMonitoredChallenge(res.data);
      }
    } catch (err: any) {
      notify(err.message || 'Failed to monitor challenge', 'error');
    } finally {
      setIsMonitoringLoading(false);
    }
  };

  // Compute telemetry stats for persistent Left Deck
  const telemetryStats = useMemo(() => {
    if (isTrialAccount) {
      return {
        totalUsers: trialAdminData.totalAthletes,
        activeAthletes: Math.round(trialAdminData.totalAthletes * 0.78),
        adminsCount: 8,
        suspendedUsers: 2,
        totalWorkouts: trialAdminData.activeWorkoutsToday * 7,
        pendingContent: trialAdminData.pendingReviewsCount,
        approvedContent: 42,
        auditLogsCount: trialAdminData.recentAuditLogsCount,
        maintenanceMode: settings.find((s) => s.key === 'maintenance_mode')?.value === 'true',
      };
    }

    const totalUsers = platformStats?.users?.total ?? dashboardData?.kpis?.totalUsers ?? users.length;
    const activeAthletes = platformStats?.users?.active ?? users.filter((u) => u.status === 'Active' || u.is_active !== false).length;
    const adminsCount = users.filter((u) => u.role?.toUpperCase() === 'ADMIN').length;
    const suspendedUsers = users.filter((u) => u.status === 'Suspended' || u.is_active === false).length;
    const totalWorkouts = platformStats?.workouts?.totalWorkouts ?? dashboardData?.kpis?.activeWorkoutsToday ?? 0;
    const pendingContent = platformStats?.content?.pending ?? dashboardData?.kpis?.pendingContentApprovals ?? contentList.filter((c) => c.status === 'PENDING').length;
    const approvedContent = platformStats?.content?.approved ?? contentList.filter((c) => c.status === 'APPROVED').length;
    const auditLogsCount = activityTotal || activityLogs.length;
    const maintenanceMode = settings.find((s) => s.key === 'maintenance_mode')?.value === 'true';

    return {
      totalUsers,
      activeAthletes,
      adminsCount,
      suspendedUsers,
      totalWorkouts,
      pendingContent,
      approvedContent,
      auditLogsCount,
      maintenanceMode,
    };
  }, [isTrialAccount, trialAdminData, platformStats, dashboardData, users, contentList, activityTotal, activityLogs.length, settings]);

  return (
    <AdminAppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      stats={telemetryStats}
      onRefreshTelemetry={handleRefreshAll}
      onOpenCreateUser={() => setIsCreateUserModalOpen(true)}
    >
      <div className="w-full space-y-6">
        {/* Global Notification Toast */}
        {notification && (
          <div
            className={`fixed top-6 right-6 z-50 text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-white text-rose-700 border border-rose-200 shadow-md'
                : 'bg-white text-emerald-700 border border-emerald-200 shadow-md'
            }`}
          >
            {notification.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW TELEMETRY & REAL STATISTICS                    */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Registered Athletes */}
              <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Athletes</span>
                  <Users className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
                  {telemetryStats.totalUsers}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-sky-600 font-semibold">
                    {telemetryStats.activeAthletes} Active
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500">
                    +{isTrialAccount ? 48 : (platformStats?.users?.growthLast30Days ?? 0)} this month
                  </span>
                </div>
              </div>

              {/* Total Workouts */}
              <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Workouts</span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
                  {telemetryStats.totalWorkouts}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-0.5">
                    <Flame className="w-3 h-3" />
                    {(isTrialAccount ? trialAdminData.totalKcalBurnedPlatform : (platformStats?.workouts?.totalCalories ?? 0)).toLocaleString()} kcal
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500">
                    {isTrialAccount ? (trialAdminData.activeWorkoutsToday * 1.2).toFixed(0) : (platformStats?.workouts?.totalDurationHours ?? 0)} hrs logged
                  </span>
                </div>
              </div>

              {/* Community Challenges */}
              <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Community Quests</span>
                  <Trophy className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
                  {isTrialAccount ? 4 : (platformStats?.challenges?.totalChallenges ?? challenges.length)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-sky-600 font-semibold">
                    {isTrialAccount ? 320 : (platformStats?.challenges?.totalParticipations ?? 0)} Enrolled
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    {isTrialAccount ? 86 : (platformStats?.challenges?.completionRate ?? 0)}% Completion
                  </span>
                </div>
              </div>

              {/* Guides In Moderation */}
              <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Guides In Review</span>
                  <FileText className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
                  {telemetryStats.pendingContent}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    {telemetryStats.approvedContent} Published
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-rose-600 font-semibold">
                    {isTrialAccount ? 1 : (platformStats?.content?.rejected ?? 0)} Rejected
                  </span>
                </div>
              </div>
            </div>

            {/* Real Database Statistics Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Workout Discipline & Intensity Distribution */}
              <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-sky-600" />
                      Workout Discipline Distribution
                    </h3>
                    <p className="text-xs text-slate-500">Database telemetry categorized by session type & calories burned</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                    Avg: {platformStats?.workouts?.averageDurationMinutes ?? 45}m / {platformStats?.workouts?.averageCalories ?? 380} kcal
                  </span>
                </div>

                <div className="space-y-3">
                  {platformStats?.workouts?.byType && platformStats.workouts.byType.length > 0 ? (
                    platformStats.workouts.byType.map((wt: any) => {
                      const total = platformStats.workouts.totalWorkouts || 1;
                      const percent = Math.round((wt.count / total) * 100);
                      return (
                        <div key={wt.type} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-800">{wt.type}</span>
                            <span className="font-mono text-slate-500">
                              {wt.count} sessions ({percent}%) • {(wt.calories || 0).toLocaleString()} kcal
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="bg-gradient-to-r from-sky-400 to-sky-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(6, percent)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">No workout records in database yet.</div>
                  )}
                </div>

                {/* Intensity Breakdown */}
                {platformStats?.workouts?.byIntensity && platformStats.workouts.byIntensity.length > 0 && (
                  <div className="pt-3 border-t border-sky-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Training Intensity Breakdown</span>
                    <div className="flex gap-2">
                      {platformStats.workouts.byIntensity.map((wi: any) => (
                        <div
                          key={wi.intensity}
                          className={`flex-1 p-2.5 rounded-xl border text-center text-xs font-semibold ${
                            wi.intensity === 'HIGH'
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : wi.intensity === 'MEDIUM'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}
                        >
                          <div className="text-[10px] uppercase font-bold tracking-wider">{wi.intensity}</div>
                          <div className="text-base font-bold font-mono mt-0.5">{wi.count}</div>
                          <div className="text-[10px] text-slate-500 font-normal">sessions</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Challenge Participation Funnel & Top Quests Table */}
              <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-sky-600" />
                      Challenge Participation & Completion
                    </h3>
                    <p className="text-xs text-slate-500">Athlete enrollment engagement and quest completion rates</p>
                  </div>
                  <button onClick={() => setActiveTab('challenges')} className="text-xs text-sky-600 font-semibold hover:underline">
                    Manage →
                  </button>
                </div>

                {/* Funnel Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
                    <div className="text-slate-500 text-[11px]">Enrolled</div>
                    <div className="text-lg font-bold text-sky-700 font-mono mt-1">
                      {platformStats?.challenges?.totalParticipations ?? 0}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="text-slate-500 text-[11px]">In Progress</div>
                    <div className="text-lg font-bold text-amber-700 font-mono mt-1">
                      {platformStats?.challenges?.inProgressParticipations ?? 0}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="text-slate-500 text-[11px]">Completed</div>
                    <div className="text-lg font-bold text-emerald-700 font-mono mt-1">
                      {platformStats?.challenges?.completedParticipations ?? 0}
                    </div>
                  </div>
                </div>

                {/* Top Community Quests Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-sky-100 text-sky-900 bg-sky-50/50 font-semibold">
                        <th className="py-2 px-2">Challenge Quest</th>
                        <th className="py-2 px-2">Target</th>
                        <th className="py-2 px-2 text-center">Athletes</th>
                        <th className="py-2 px-2 text-right">Completion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100">
                      {platformStats?.challenges?.topChallenges && platformStats.challenges.topChallenges.length > 0 ? (
                        platformStats.challenges.topChallenges.map((tch: any) => {
                          const rate = tch.participantCount > 0 ? Math.round((tch.completedCount / tch.participantCount) * 100) : 0;
                          return (
                            <tr key={tch.id} className="hover:bg-sky-50/40 transition-colors">
                              <td className="py-2.5 px-2 font-semibold text-slate-800">{tch.title}</td>
                              <td className="py-2.5 px-2 text-slate-500 font-mono">{tch.targetValue} {tch.targetMetric}</td>
                              <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">{tch.participantCount}</td>
                              <td className="py-2.5 px-2 text-right">
                                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  {rate}%
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400">No active challenges logged yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 3. 7-Day Activity Velocity Trend & Moderation Pipeline Meter */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 7-Day Velocity Chart */}
              <div className="lg:col-span-2 bg-white border border-sky-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-sky-600" />
                      7-Day Activity & Velocity Trend
                    </h3>
                    <p className="text-xs text-slate-500">Daily workout frequency and distinct active athletes</p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Rolling 7 Calendar Days</span>
                </div>

                {/* Visual Bar Chart */}
                <div className="pt-2">
                  <div className="flex items-end justify-between gap-3 h-40 pb-4 border-b border-sky-100">
                    {(platformStats?.engagementTrend || dashboardData?.engagementTrend || []).map((item: any, idx: number) => {
                      const maxWorkouts = Math.max(1, ...(platformStats?.engagementTrend || dashboardData?.engagementTrend || []).map((t: any) => t.workouts || 0));
                      const heightPercent = Math.max(12, Math.round((item.workouts / maxWorkouts) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <span className="text-[10px] font-mono font-bold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.workouts}
                          </span>
                          <div
                            className="w-full max-w-[32px] bg-sky-500 rounded-t-lg transition-all duration-500 group-hover:bg-sky-400 relative shadow-sm shadow-sky-500/20"
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div className="absolute inset-x-0 top-0 h-1 bg-sky-200 rounded-t-lg opacity-70" />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block shadow-sm shadow-sky-400/50" />
                      Workouts Logged
                    </span>
                    <span className="font-mono text-sky-600 font-bold">
                      {((platformStats?.engagementTrend || []).reduce((acc: number, t: any) => acc + (t.workouts || 0), 0))} Total Sessions This Week
                    </span>
                  </div>
                </div>
              </div>

              {/* Moderation Pipeline Breakdown */}
              <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Content Pipeline Health
                  </h3>
                  <button onClick={() => setActiveTab('moderation')} className="text-xs text-amber-600 font-semibold hover:underline">
                    Moderate →
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Fitness Guides</span>
                    <span className="font-mono font-bold text-slate-900">{platformStats?.content?.totalContent ?? contentList.length}</span>
                  </div>

                  {/* 3-segment progress meter */}
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
                    <div
                      className="bg-amber-400 h-full transition-all duration-500"
                      style={{
                        width: `${((platformStats?.content?.pending ?? 0) / Math.max(1, platformStats?.content?.totalContent ?? 1)) * 100}%`,
                      }}
                      title="Pending"
                    />
                    <div
                      className="bg-emerald-400 h-full transition-all duration-500"
                      style={{
                        width: `${((platformStats?.content?.approved ?? 0) / Math.max(1, platformStats?.content?.totalContent ?? 1)) * 100}%`,
                      }}
                      title="Approved"
                    />
                    <div
                      className="bg-rose-400 h-full transition-all duration-500"
                      style={{
                        width: `${((platformStats?.content?.rejected ?? 0) / Math.max(1, platformStats?.content?.totalContent ?? 1)) * 100}%`,
                      }}
                      title="Rejected"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                      <div className="font-bold font-mono text-base">{platformStats?.content?.pending ?? 0}</div>
                      <div className="text-[10px] text-amber-600">Pending</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <div className="font-bold font-mono text-base">{platformStats?.content?.approved ?? 0}</div>
                      <div className="text-[10px] text-emerald-600">Approved</div>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                      <div className="font-bold font-mono text-base">{platformStats?.content?.rejected ?? 0}</div>
                      <div className="text-[10px] text-rose-600">Rejected</div>
                    </div>
                  </div>

                  {/* Content Categories */}
                  {platformStats?.content?.byCategory && platformStats.content.byCategory.length > 0 && (
                    <div className="pt-2 border-t border-sky-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Category Distribution</span>
                      <div className="flex flex-wrap gap-1.5">
                        {platformStats.content.byCategory.map((cat: any) => (
                          <span key={cat.category} className="px-2 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg text-[11px] font-semibold">
                            {cat.category} ({cat.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-sky-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-sky-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-sky-600" />
                      Recent Activity Monitoring Stream
                    </h3>
                    <p className="text-xs text-slate-500">Live immutable log of user, workout, challenge, and administrative actions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="text-xs text-sky-600 font-semibold hover:underline"
                    >
                      Open Full Monitor →
                    </button>
                    <button onClick={loadDashboard} className="text-xs text-slate-400 hover:text-slate-700 p-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isDashboardLoading ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading activity stream...</div>
                ) : !dashboardData?.recentActivity || dashboardData.recentActivity.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No recent activity logs recorded yet.</p>
                ) : (
                  <div className="divide-y divide-sky-100 text-xs">
                    {dashboardData.recentActivity.slice(0, 8).map((log: any) => {
                      const isAuth = log.action.includes('LOGIN') || log.action.includes('REGISTER');
                      const isWorkout = log.action.includes('WORKOUT');
                      const isChallenge = log.action.includes('CHALLENGE');
                      const isContent = log.action.includes('CONTENT');
                      const isUserAdmin = log.action.includes('ADMIN') || log.action.includes('USER');

                      const badgeClass = isAuth
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : isWorkout
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isChallenge
                        ? 'bg-violet-50 text-violet-700 border-violet-200'
                        : isContent
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : isUserAdmin
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200';

                      return (
                        <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold shrink-0 ${badgeClass}`}>
                              {log.action}
                            </span>
                            <span className="text-slate-600 truncate">
                              <span className="font-semibold text-slate-900">{log.user?.name || log.user?.email || 'System'}</span>
                              {log.details && (
                                <span className="text-slate-500 font-mono text-[11px] ml-1 truncate">
                                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation Shortcuts */}
              <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 mb-2 text-sm">Platform Governance Pillars</h3>
                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full p-3 rounded-xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-100/80 text-left flex items-center justify-between text-xs font-semibold text-slate-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-600" />
                    User Directory & Roles
                  </span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setActiveTab('challenges')}
                  className="w-full p-3 rounded-xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-100/80 text-left flex items-center justify-between text-xs font-semibold text-slate-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-sky-600" />
                    Challenge Quests & Badges
                  </span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setActiveTab('moderation')}
                  className="w-full p-3 rounded-xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-100/80 text-left flex items-center justify-between text-xs font-semibold text-slate-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Moderate Fitness Guides
                  </span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="w-full p-3 rounded-xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-100/80 text-left flex items-center justify-between text-xs font-semibold text-slate-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-600" />
                    Audit & Activity Monitoring
                  </span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full p-3 rounded-xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-100/80 text-left flex items-center justify-between text-xs font-semibold text-slate-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-sky-600" />
                    System Platform Settings
                  </span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USER MANAGEMENT (Requirement 10)                        */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-500" />
                  User Registry & Role Governance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit accounts, promote/demote roles, search, filter, and deactivate users.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadUsers}
                  className="p-2 rounded-xl bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-sm"
                  title="Reload Users"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-200 hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add User
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Role Filter */}
                <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 p-1 rounded-xl">
                  {['ALL', 'USER', 'ADMIN'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        userRoleFilter === r
                          ? 'bg-white text-sky-700 border border-sky-200 shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {r === 'ALL' ? 'All Roles' : r}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 p-1 rounded-xl">
                  {['ALL', 'ACTIVE', 'SUSPENDED'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setUserStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        userStatusFilter === s
                          ? 'bg-white text-sky-700 border border-sky-200 shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {s === 'ALL' ? 'All Status' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Table */}
            {isUsersLoading ? (
              <div className="py-16 text-center text-xs font-bold text-sky-500">
                Loading user directory...
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-sky-200 rounded-2xl">
                No users match your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto border border-sky-100 rounded-2xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-sky-50/70 text-sky-900 font-bold uppercase tracking-wider text-[10px] border-b border-sky-100">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Workouts</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map((u) => {
                      const isActive = u.status === 'Active' || u.is_active !== false;
                      const roleBadge = u.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
                      return (
                        <tr key={u.id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                roleBadge === 'ADMIN'
                                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {roleBadge}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold tabular-nums text-slate-900">
                            {u.workoutsCount ?? u.workoutsLogged ?? 0}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {u.joinedDate || (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Edit */}
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 rounded-lg bg-white hover:bg-sky-50 text-slate-600 border border-slate-200 shadow-sm"
                                title="Edit User"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Role */}
                              <button
                                onClick={() => handleUpdateUserRole(u, roleBadge === 'ADMIN' ? 'USER' : 'ADMIN')}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-mono hover:bg-sky-50 text-slate-700 shadow-sm"
                                title="Toggle Role"
                              >
                                {roleBadge === 'ADMIN' ? 'Demote' : 'Promote'}
                              </button>

                              {/* Suspend / Unsuspend */}
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                  isActive
                                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {isActive ? 'Suspend' : 'Activate'}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-sky-100 space-y-5 text-slate-800">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Edit User Details</h3>
                    <button onClick={() => setEditingUser(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-sm shadow-sky-200 transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Create User Modal */}
            {isCreateUserModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-sky-100 space-y-5 text-slate-800">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Add New User</h3>
                    <button onClick={() => setIsCreateUserModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="user@fitpulse.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                      <select
                        value={newUserRole}
                        onChange={(e: any) => setNewUserRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreateUserModalOpen(false)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-sm shadow-sky-200 transition-all"
                      >
                        Create User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: FITNESS CONTENT MANAGEMENT (Requirement 11)              */}
        {/* ============================================================== */}
        {activeTab === 'moderation' && (
          <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Fitness Content Verification & Approval Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review submitted guides across PENDING, APPROVED, and REJECTED states.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadContent}
                  className="p-2 rounded-xl bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-sm"
                  title="Reload Content"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 p-1 rounded-xl text-xs">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setContentFilter(status)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        contentFilter === status
                          ? 'bg-white text-amber-700 border border-amber-200 shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Pipeline Grid */}
            {isContentLoading ? (
              <div className="py-16 text-center text-xs font-bold text-sky-500">
                Loading moderation pipeline...
              </div>
            ) : contentList.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-sky-200 rounded-2xl">
                No content items currently in this queue.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {contentList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 border border-sky-100 rounded-2xl space-y-3 bg-white text-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold uppercase">
                          {item.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            item.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1">
                        By <strong className="text-slate-800">{item.creator?.name || 'Athlete'}</strong> (
                        {item.creator?.email || 'user'}) •{' '}
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>

                      {item.feedback && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                          <strong>Feedback Note:</strong> {item.feedback}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      {item.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleApproveContent(item)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm shadow-emerald-200"
                        >
                          Approve & Publish
                        </button>
                      )}

                      {item.status !== 'REJECTED' && (
                        <button
                          onClick={() => setRejectingItem(item)}
                          className="flex-1 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold py-2 rounded-xl transition-all"
                        >
                          Reject with Note
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteContent(item)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Content"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rejection Modal */}
            {rejectingItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-sky-100 space-y-4 text-slate-800">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Reject Content Submission</h3>
                    <button onClick={() => setRejectingItem(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Provide clear feedback to the creator for why "{rejectingItem.title}" was not approved.
                  </p>

                  <textarea
                    rows={3}
                    value={rejectionFeedback}
                    onChange={(e) => setRejectionFeedback(e.target.value)}
                    placeholder="e.g. Please provide citations for caloric claim, or check injury safety."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white resize-none"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setRejectingItem(null)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmRejectContent}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-rose-200"
                    >
                      Reject Submission
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: CHALLENGES GOVERNANCE                                   */}
        {/* ============================================================== */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Fitness Challenges & Arena Governance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Administer quests, monitor athletic participation rosters, and audit completion percentages.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-200 hover:shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Challenge</span>
              </button>
            </div>

            {isChallengesLoading ? (
              <div className="p-12 text-center text-xs font-bold text-sky-500">
                Loading challenge rosters...
              </div>
            ) : challenges.length === 0 ? (
              <div className="bg-white border border-dashed border-sky-200 p-12 text-center rounded-2xl">
                <Trophy className="w-10 h-10 text-sky-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">No Challenges Configured</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Deploy structured arena challenges for community athletes to join and compete.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm shadow-sky-200"
                >
                  <Plus className="w-4 h-4" /> Create Challenge
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {challenges.map((ch) => {
                  const xpVal = ch.reward_xp ?? (ch as any).rewardXp ?? 250;
                  return (
                    <div
                      key={ch.id}
                      className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm space-y-4 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between text-slate-800"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold uppercase tracking-wider">
                            {ch.target_metric}
                          </span>
                          <span className="px-2 py-0.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-mono font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                            +{xpVal} XP
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{ch.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {ch.description}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Target:</span>
                            <span className="font-bold text-slate-900">{ch.target_value} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Reward Badge:</span>
                            <span className="font-bold text-slate-900">{ch.reward_badge}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Enrolled:</span>
                            <span className="font-bold text-sky-600">
                              {ch.total_participants ?? 0} athletes
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenMonitor(ch.id)}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Monitor</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingChallenge(ch)}
                            className="p-1.5 rounded-lg bg-white hover:bg-sky-50 text-slate-600 border border-slate-200 shadow-sm"
                            title="Edit Challenge"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteChallenge(ch.id)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-500 border border-slate-200 shadow-sm"
                            title="Delete Challenge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Create Challenge Modal */}
            {isCreateModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-sky-100 space-y-6 text-slate-800">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Create Official Challenge</h3>
                      <p className="text-xs text-slate-500">Deploy a new quest for athletes across the platform</p>
                    </div>
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateChallenge} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Challenge Title
                      </label>
                      <input
                        type="text"
                        required
                        value={chTitle}
                        onChange={(e) => setChTitle(e.target.value)}
                        placeholder="e.g. 50K Ultra Marathon Rush"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={chDescription}
                        onChange={(e) => setChDescription(e.target.value)}
                        placeholder="Detail the target goals, qualifications, and rewards..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Target Metric
                        </label>
                        <select
                          value={chTargetMetric}
                          onChange={(e: any) => setChTargetMetric(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                        >
                          <option value="WORKOUT_COUNT">Workout Count</option>
                          <option value="CALORIES">Calories Burned</option>
                          <option value="DURATION">Duration (Minutes)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Target Value
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={chTargetValue}
                          onChange={(e) => setChTargetValue(parseInt(e.target.value) || 1)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Reward Badge Name
                        </label>
                        <input
                          type="text"
                          required
                          value={chRewardBadge}
                          onChange={(e) => setChRewardBadge(e.target.value)}
                          placeholder="e.g. Iron Titan"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Reward XP
                        </label>
                        <input
                          type="number"
                          required
                          min="50"
                          value={chRewardXp}
                          onChange={(e) => setChRewardXp(parseInt(e.target.value) || 50)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={chStartDate}
                          onChange={(e) => setChStartDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={chEndDate}
                          onChange={(e) => setChEndDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-200 hover:shadow-md transition-all"
                      >
                        Create Challenge
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Challenge Modal */}
            {editingChallenge && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-sky-100 space-y-6 text-slate-800">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Update Challenge</h3>
                      <p className="text-xs text-slate-500">Modify quest criteria and rewards</p>
                    </div>
                    <button
                      onClick={() => setEditingChallenge(null)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateChallenge} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        value={editingChallenge.title}
                        onChange={(e) =>
                          setEditingChallenge({ ...editingChallenge, title: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={editingChallenge.description}
                        onChange={(e) =>
                          setEditingChallenge({ ...editingChallenge, description: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Target Value
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={editingChallenge.target_value}
                          onChange={(e) =>
                            setEditingChallenge({
                              ...editingChallenge,
                              target_value: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Reward XP
                        </label>
                        <input
                          type="number"
                          required
                          min="50"
                          value={editingChallenge.reward_xp ?? (editingChallenge as any).rewardXp ?? 250}
                          onChange={(e) =>
                            setEditingChallenge({
                              ...editingChallenge,
                              reward_xp: parseInt(e.target.value) || 50,
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingChallenge(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-200 hover:shadow-md transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Monitor Challenge Modal */}
            {(monitoredChallenge || isMonitoringLoading) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-sky-100 space-y-6 max-h-[90vh] overflow-y-auto text-slate-800">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Challenge Telemetry & Monitoring</h3>
                      <p className="text-xs text-slate-500">Live roster participation and completion metrics</p>
                    </div>
                    <button
                      onClick={() => setMonitoredChallenge(null)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {isMonitoringLoading ? (
                    <div className="py-12 text-center text-xs font-bold text-sky-500">
                      Aggregating participant telemetry...
                    </div>
                  ) : monitoredChallenge ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Total Enrolled</span>
                          <div className="text-xl font-black text-slate-900 mt-0.5">
                            {monitoredChallenge.totalParticipants ?? 0}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                          <span className="text-[10px] font-bold uppercase text-emerald-700">Completed</span>
                          <div className="text-xl font-black text-emerald-700 mt-0.5">
                            {monitoredChallenge.completedCount ?? monitoredChallenge.completedParticipants ?? 0}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-center">
                          <span className="text-[10px] font-bold uppercase text-sky-700">In Progress</span>
                          <div className="text-xl font-black text-sky-700 mt-0.5">
                            {monitoredChallenge.inProgressCount ?? monitoredChallenge.inProgressParticipants ?? 0}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                          <span className="text-[10px] font-bold uppercase text-amber-700">Completion</span>
                          <div className="text-xl font-black text-amber-700 mt-0.5">
                            {Math.round(monitoredChallenge.completionRate ?? 0)}%
                          </div>
                        </div>
                      </div>

                      {/* Participant Roster Table */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Participant Roster ({monitoredChallenge.participants?.length || 0})
                        </h4>

                        {!monitoredChallenge.participants || monitoredChallenge.participants.length === 0 ? (
                          <div className="p-6 text-center border border-dashed border-sky-200 rounded-xl text-xs text-slate-500">
                            No athletes currently enrolled in this quest.
                          </div>
                        ) : (
                          <div className="border border-sky-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-sky-50/70 text-sky-900 font-semibold border-b border-sky-100">
                                <tr>
                                  <th className="p-3">Athlete</th>
                                  <th className="p-3">Status</th>
                                  <th className="p-3">Progress</th>
                                  <th className="p-3">Enrolled At</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {monitoredChallenge.participants.map((p: any) => (
                                  <tr key={p.id || p.userId} className="hover:bg-sky-50/40 text-slate-700">
                                    <td className="p-3 font-medium text-slate-900">
                                      {p.userName || p.user_name || 'Athlete'}
                                      <span className="text-[10px] text-slate-500 block font-normal">
                                        {p.userEmail || p.user_email || ''}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                          p.status === 'COMPLETED'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-sky-50 text-sky-700 border-sky-200'
                                        }`}
                                      >
                                        {p.status}
                                      </span>
                                    </td>
                                    <td className="p-3 font-mono font-bold text-slate-900">
                                      {p.currentProgress ?? 0}
                                    </td>
                                    <td className="p-3 text-slate-500 text-[11px]">
                                      {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : 'Active'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SYSTEM SETTINGS (Requirement 12)                        */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-6 max-w-3xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sky-500" />
                  Database System Configurations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform parameters and runtime flags stored directly in the database.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadSettings}
                  className="p-2 rounded-xl bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-sm"
                  title="Reload Settings"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAddSettingModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-200 hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Parameter
                </button>
              </div>
            </div>

            {isSettingsLoading ? (
              <div className="py-12 text-center text-xs font-bold text-sky-500">
                Loading database configuration parameters...
              </div>
            ) : settings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-sky-200 rounded-2xl">
                No system settings currently defined in database.
              </div>
            ) : (
              <div className="space-y-3">
                {settings.map((s) => {
                  const isBoolean = s.value === 'true' || s.value === 'false';
                  return (
                    <div
                      key={s.key}
                      className="p-4 rounded-xl border border-sky-100 bg-sky-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sky-50/80 transition-colors"
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="font-mono font-bold text-xs text-sky-800 flex items-center gap-2">
                          <span>{s.key}</span>
                          {s.updated_at && (
                            <span className="text-[10px] font-normal text-slate-500 font-sans">
                              (Updated: {new Date(s.updated_at).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {s.description || 'Global configuration parameter'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isBoolean ? (
                          <button
                            onClick={() => handleToggleSetting(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                              s.value === 'true'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            {s.value === 'true' ? 'ENABLED (true)' : 'DISABLED (false)'}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={s.value}
                              onBlur={(e) => {
                                if (e.target.value !== s.value) {
                                  handleSaveTextSetting(s.key, e.target.value, s.description);
                                }
                              }}
                              className="w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm"
                            />
                            <span className="text-[10px] text-slate-400">Save on blur</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Setting Modal */}
            {isAddSettingModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-sky-100 space-y-4 text-slate-800">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Add System Configuration</h3>
                    <button onClick={() => setIsAddSettingModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateSetting} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Setting Key</label>
                      <input
                        type="text"
                        required
                        value={newSettingKey}
                        onChange={(e) => setNewSettingKey(e.target.value)}
                        placeholder="e.g. telemetry_sample_rate"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white font-mono text-slate-900 placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Setting Value</label>
                      <input
                        type="text"
                        required
                        value={newSettingVal}
                        onChange={(e) => setNewSettingVal(e.target.value)}
                        placeholder="e.g. true or 100"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white font-mono text-slate-900 placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                      <input
                        type="text"
                        value={newSettingDesc}
                        onChange={(e) => setNewSettingDesc(e.target.value)}
                        placeholder="Purpose of this configuration..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white text-slate-900 placeholder-slate-400"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddSettingModalOpen(false)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-sm shadow-sky-200"
                      >
                        Persist Setting
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: ACTIVITY & AUDIT MONITORING (Requirement 13)            */}
        {/* ============================================================== */}
        {activeTab === 'activity' && (
          <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-500" />
                  Activity Monitoring & Security Audit Trail
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable log of authentications, workout sessions, challenge milestones, user modifications, and content moderation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl">
                  {activityTotal || activityLogs.length} Total Audit Records
                </span>
                <button
                  onClick={loadActivityLogs}
                  className="px-3 py-1.5 bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by actor, email, action type, or keyword..."
                  value={activitySearch}
                  onChange={(e) => {
                    setActivitySearch(e.target.value);
                    setActivityPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={activityFilter}
                  onChange={(e) => {
                    setActivityFilter(e.target.value);
                    setActivityPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500 focus:bg-white"
                >
                  <option value="ALL">All Event Domains</option>
                  <option value="USER_LOGIN">Authentication (Login)</option>
                  <option value="USER_REGISTER">Registration</option>
                  <option value="LOG_WORKOUT">Workout Logged</option>
                  <option value="UPDATE_WORKOUT">Workout Updated</option>
                  <option value="DELETE_WORKOUT">Workout Deleted</option>
                  <option value="JOIN_CHALLENGE">Challenge Joined</option>
                  <option value="UPDATE_CHALLENGE_PROGRESS">Challenge Progress</option>
                  <option value="CHALLENGE_COMPLETED">Challenge Completed</option>
                  <option value="ADMIN_CREATE_USER">Admin User Created</option>
                  <option value="ADMIN_UPDATE_USER">Admin User Updated</option>
                  <option value="ADMIN_UPDATE_ROLE">Role Elevated/Demoted</option>
                  <option value="ADMIN_TOGGLE_USER_STATUS">Account Suspended/Activated</option>
                  <option value="ADMIN_DELETE_USER">User Deleted</option>
                  <option value="CREATE_FITNESS_CONTENT">Guide Submitted</option>
                  <option value="MODERATE_CONTENT">Content Moderated</option>
                  <option value="DELETE_FITNESS_CONTENT">Guide Archived</option>
                  <option value="UPDATE_SYSTEM_SETTING">Setting Calibrated</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {isActivityLoading ? (
              <div className="py-16 text-center text-xs text-sky-500 font-bold">Loading audit trail records...</div>
            ) : activityLogs.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-sky-200 rounded-2xl">
                No activity events match your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto border border-sky-100 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-sky-50/70 border-b border-sky-100 text-sky-900 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Timestamp</th>
                      <th className="py-3 px-3">Event Action</th>
                      <th className="py-3 px-3">Actor / User</th>
                      <th className="py-3 px-3">Details / Context</th>
                      <th className="py-3 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activityLogs.map((log) => {
                      const isAuth = log.action.includes('LOGIN') || log.action.includes('REGISTER');
                      const isWorkout = log.action.includes('WORKOUT');
                      const isChallenge = log.action.includes('CHALLENGE');
                      const isContent = log.action.includes('CONTENT');
                      const isUserAdmin = log.action.includes('ADMIN') || log.action.includes('USER');
                      const isSetting = log.action.includes('SETTING');

                      const badgeClass = isAuth
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : isWorkout
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isChallenge
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : isContent
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : isUserAdmin
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isSetting
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200';

                      return (
                        <tr key={log.id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                            <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md border font-mono font-bold text-[10px] ${badgeClass}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">{log.user?.name || 'System Actor'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{log.user?.email || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                            {log.details ? (
                              typeof log.details === 'object' ? (
                                <span title={JSON.stringify(log.details, null, 2)}>
                                  {Object.entries(log.details)
                                    .slice(0, 3)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(' • ')}
                                </span>
                              ) : (
                                String(log.details)
                              )
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedLogDetails(log)}
                              className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-sm"
                            >
                              <Eye className="w-3 h-3" />
                              Payload
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {activityLogs.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-sky-100 text-xs">
                <span className="text-slate-500 font-mono">
                  Showing page {activityPage} of {Math.max(1, Math.ceil((activityTotal || activityLogs.length) / 25))}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={activityPage <= 1}
                    onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white shadow-sm"
                  >
                    Previous
                  </button>
                  <button
                    disabled={activityLogs.length < 25}
                    onClick={() => setActivityPage((p) => p + 1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Inspect Payload Modal */}
            {selectedLogDetails && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-sky-100 space-y-4 text-slate-800">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Activity Event Payload</h3>
                      <span className="text-[11px] font-mono font-bold text-sky-600">
                        {selectedLogDetails.action}
                      </span>
                    </div>
                    <button onClick={() => setSelectedLogDetails(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 p-3 bg-sky-50/50 border border-sky-100 rounded-xl text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Event ID</span>
                        <span className="font-mono text-[11px] text-slate-900">{selectedLogDetails.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Recorded At</span>
                        <span className="font-mono text-[11px] text-slate-900">{new Date(selectedLogDetails.timestamp).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Actor Name</span>
                        <span className="font-semibold text-slate-900">{selectedLogDetails.user?.name || 'System'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Actor Email</span>
                        <span className="font-mono text-[11px] text-slate-900">{selectedLogDetails.user?.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Parsed JSON Payload</span>
                      <pre className="p-3 bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-60">
                        {JSON.stringify(selectedLogDetails.details || selectedLogDetails.rawDetails || {}, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setSelectedLogDetails(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminAppLayout>
  );
};

export const AdminDashboardPage: React.FC<AdminDashboardProps> = AdminDashboard;
export default AdminDashboard;
