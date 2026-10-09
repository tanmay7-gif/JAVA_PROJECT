/**
 * FitPulse Resilient API Client
 * Supports dynamic backend URL (VITE_API_URL / custom proxy) and seamless client fallback
 * for zero-downtime demonstration on Vercel and static hosting environments.
 */

// 1. Resolve API Base URL dynamically
const getApiBaseUrl = (): string => {
  // Check Vercel / Vite environment variable safely
  const env = import.meta.env;
  const envUrl = env && env.VITE_API_URL ? (env.VITE_API_URL as string) : '';

  if (envUrl) {
    const clean = envUrl.trim().replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // Check manual override in localStorage
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('fitpulse_custom_api_url');
    if (custom) {
      const url = custom.trim().replace(/\/$/, '');
      return url.endsWith('/api') ? url : `${url}/api`;
    }
  }

  // Default to relative /api (proxied in local dev or same-domain deployment)
  return '/api';
};
import { CLINICAL_PROTOCOLS } from '../data/mockContent';

const API_BASE_URL = getApiBaseUrl();

// 2. Default Seed Datasets for Resilient Fallback on Vercel
const SEED_USERS = {
  admin: {
    id: 'usr-admin-001',
    name: 'Marcus Vance (Admin)',
    email: 'admin@fitpulse.com',
    role: 'ADMIN',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    is_active: true,
    created_at: '2026-08-15T00:00:00.000Z',
    _count: { workouts: 14, userChallenges: 3 },
  },
  sarah: {
    id: 'usr-sarah-101',
    name: 'Sarah Connor',
    email: 'sarah@fitpulse.com',
    role: 'USER',
    profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    _count: { workouts: 6, userChallenges: 2 },
  },
  david: {
    id: 'usr-david-102',
    name: 'David Miller',
    email: 'david@fitpulse.com',
    role: 'USER',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    is_active: true,
    created_at: '2026-09-10T00:00:00.000Z',
    _count: { workouts: 9, userChallenges: 1 },
  },
};

const SEED_WORKOUTS = [
  {
    id: 'w-101',
    user_id: 'usr-sarah-101',
    type: 'HIIT',
    duration_minutes: 45,
    intensity: 'HIGH',
    calories_burned: 520,
    date: new Date(Date.now() - 0 * 86400000).toISOString(),
    notes: 'Morning tabata intervals, felt powerful and energized!',
    created_at: new Date(Date.now() - 0 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 0 * 86400000).toISOString(),
  },
  {
    id: 'w-102',
    user_id: 'usr-sarah-101',
    type: 'Strength',
    duration_minutes: 60,
    intensity: 'HIGH',
    calories_burned: 430,
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Heavy deadlifts & barbell rows. Hit new PR: 95kg!',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'w-103',
    user_id: 'usr-sarah-101',
    type: 'Cardio',
    duration_minutes: 35,
    intensity: 'MEDIUM',
    calories_burned: 310,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Zone 2 steady incline treadmill jog.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'w-104',
    user_id: 'usr-sarah-101',
    type: 'Yoga',
    duration_minutes: 50,
    intensity: 'LOW',
    calories_burned: 180,
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    notes: 'Mobility flow and hamstring lengthening.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'w-105',
    user_id: 'usr-sarah-101',
    type: 'Running',
    duration_minutes: 40,
    intensity: 'HIGH',
    calories_burned: 480,
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    notes: '5km outdoor tempo run with sprint surges.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'w-106',
    user_id: 'usr-sarah-101',
    type: 'Cycling',
    duration_minutes: 55,
    intensity: 'MEDIUM',
    calories_burned: 420,
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    notes: 'Cadence RPM intervals on indoor trainer.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const SEED_CHALLENGES = [
  {
    id: 'ch-1',
    title: '5,000 kcal Metabolic Burn',
    description: 'Burn a cumulative 5,000 active calories across high-intensity conditioning sessions.',
    target_metric: 'CALORIES',
    target_value: 5000,
    start_date: '2026-10-01T00:00:00.000Z',
    end_date: '2026-10-31T23:59:59.000Z',
    reward_badge: 'Metabolic Inferno',
    total_participants: 84,
    user_status: 'IN_PROGRESS',
    user_progress: 3010,
    progress_percent: 60,
  },
  {
    id: 'ch-2',
    title: 'Century Conditioning Split',
    description: 'Log 180 total minutes of high-cadence cycling or rowing endurance.',
    target_metric: 'DURATION',
    target_value: 180,
    start_date: '2026-10-01T00:00:00.000Z',
    end_date: '2026-10-20T23:59:59.000Z',
    reward_badge: 'Century Cyclist',
    total_participants: 62,
    user_status: 'COMPLETED',
    user_progress: 180,
    progress_percent: 100,
    completed_at: '2026-10-04T14:30:00.000Z',
  },
  {
    id: 'ch-3',
    title: '14-Day Consistency Master',
    description: 'Complete at least 10 logged sessions over a 14-day rolling training cycle.',
    target_metric: 'WORKOUT_COUNT',
    target_value: 10,
    start_date: '2026-10-01T00:00:00.000Z',
    end_date: '2026-10-14T23:59:59.000Z',
    reward_badge: 'Iron Will',
    total_participants: 112,
    user_status: 'IN_PROGRESS',
    user_progress: 6,
    progress_percent: 60,
  },
];

const SEED_GOALS = [
  {
    id: 'g-1',
    title: 'Burn 10,000 Active kcal',
    description: 'Monthly high-cadence caloric burn benchmark.',
    goalType: 'CALORIE_BURN',
    unit: 'kcal',
    targetValue: 10000,
    currentValue: 4200,
    completionPercentage: 42.0,
    status: 'IN_PROGRESS',
    startDate: '2026-10-01T00:00:00.000Z',
    targetDate: '2026-10-31T23:59:59.000Z',
  },
  {
    id: 'g-2',
    title: '15 Endurance Sessions',
    description: 'Log 15 comprehensive training sessions across the month.',
    goalType: 'WORKOUT_COUNT',
    unit: 'sessions',
    targetValue: 15,
    currentValue: 9,
    completionPercentage: 60.0,
    status: 'IN_PROGRESS',
    startDate: '2026-10-01T00:00:00.000Z',
    targetDate: '2026-10-25T23:59:59.000Z',
  },
  {
    id: 'g-3',
    title: '500 Training Minutes',
    description: 'Accumulate 500 total minutes of high-intensity training.',
    goalType: 'DURATION_MINUTES',
    unit: 'mins',
    targetValue: 500,
    currentValue: 500,
    completionPercentage: 100.0,
    status: 'COMPLETED',
    startDate: '2026-09-15T00:00:00.000Z',
    targetDate: '2026-10-05T23:59:59.000Z',
    completedAt: '2026-10-04T18:00:00.000Z',
  },
];

// Helper to access LocalStorage reactive mock store
const getLocalStore = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { workouts: SEED_WORKOUTS, user: SEED_USERS.sarah, goals: SEED_GOALS, challenges: SEED_CHALLENGES };
  }
  try {
    const rawWorkouts = localStorage.getItem('fitpulse_mock_workouts');
    const workouts = rawWorkouts ? JSON.parse(rawWorkouts) : SEED_WORKOUTS;
    const rawUser = localStorage.getItem('fitpulse_mock_user');
    const user = rawUser ? JSON.parse(rawUser) : SEED_USERS.sarah;
    const rawGoals = localStorage.getItem('fitpulse_mock_goals');
    const goals = rawGoals ? JSON.parse(rawGoals) : SEED_GOALS;
    const rawChallenges = localStorage.getItem('fitpulse_mock_challenges');
    const challenges = rawChallenges ? JSON.parse(rawChallenges) : SEED_CHALLENGES;
    return { workouts, user, goals, challenges };
  } catch {
    return { workouts: SEED_WORKOUTS, user: SEED_USERS.sarah, goals: SEED_GOALS, challenges: SEED_CHALLENGES };
  }
};

const saveLocalWorkouts = (workouts: any[]) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('fitpulse_mock_workouts', JSON.stringify(workouts));
    } catch {
      // ignore
    }
  }
};

const saveLocalGoals = (goals: any[]) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('fitpulse_mock_goals', JSON.stringify(goals));
    } catch {
      // ignore
    }
  }
};

const saveLocalChallenges = (challenges: any[]) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('fitpulse_mock_challenges', JSON.stringify(challenges));
    } catch {
      // ignore
    }
  }
};

const saveLocalUser = (user: any) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('fitpulse_mock_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  }
};

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const token = localStorage.getItem('fitpulse_token');
        if (
          !token ||
          token === 'undefined' ||
          token === 'null' ||
          token.trim() === '' ||
          token.startsWith('demo_jwt_token_')
        ) {
          if (token && (token.startsWith('demo_jwt_token_') || token === 'undefined' || token === 'null')) {
            localStorage.removeItem('fitpulse_token');
          }
          return null;
        }
        return token.trim();
      } catch {
        return null;
      }
    }
    return null;
  }

  // Resilient fallback router for standalone client deployment on Vercel
  private handleFallback<T>(endpoint: string, options: RequestInit = {}): T {
    const { workouts, user, goals, challenges } = getLocalStore();
    const cleanEndpoint = endpoint.split('?')[0];

    // Auth Fallbacks
    if (cleanEndpoint === '/auth/login') {
      let body: any = {};
      try {
        body = JSON.parse((options.body as string) || '{}');
      } catch {
        body = {};
      }
      const isAdmin = body.email?.toLowerCase().includes('admin');
      const selectedUser = isAdmin ? SEED_USERS.admin : SEED_USERS.sarah;
      const token = `fitpulse_demo_jwt_token_${selectedUser.id}`;
      saveLocalUser(selectedUser);
      return {
        success: true,
        data: { token, user: selectedUser },
        message: 'Authenticated successfully in Resilient Clinical Mode.',
      } as T;
    }

    if (cleanEndpoint === '/auth/register') {
      let body: any = {};
      try {
        body = JSON.parse((options.body as string) || '{}');
      } catch {
        body = {};
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        name: body.name || 'New Athlete',
        email: body.email || 'athlete@fitpulse.com',
        role: body.role || 'USER',
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.name || 'Athlete')}`,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      saveLocalUser(newUser);
      return {
        success: true,
        data: { token: `fitpulse_demo_jwt_token_${newUser.id}`, user: newUser },
        message: 'Account registered successfully.',
      } as T;
    }

    if (cleanEndpoint === '/auth/me') {
      return { success: true, data: user } as T;
    }

    if (cleanEndpoint === '/auth/profile') {
      let updates: any = {};
      try {
        updates = JSON.parse((options.body as string) || '{}');
      } catch {
        updates = {};
      }
      const updatedUser = { ...user, ...updates };
      saveLocalUser(updatedUser);
      return { success: true, data: updatedUser, message: 'Profile updated successfully.' } as T;
    }

    if (cleanEndpoint === '/auth/change-password') {
      return { success: true, message: 'Password changed successfully.' } as T;
    }

    // Workouts Fallbacks
    if (cleanEndpoint === '/workouts') {
      if (options.method === 'POST') {
        let newEntry: any = {};
        try {
          newEntry = JSON.parse((options.body as string) || '{}');
        } catch {
          newEntry = {};
        }
        const createdWorkout = {
          id: `w-${Date.now()}`,
          user_id: user.id,
          type: newEntry.type || 'Strength',
          duration_minutes: Number(newEntry.duration_minutes) || 45,
          intensity: newEntry.intensity || 'MEDIUM',
          calories_burned: Number(newEntry.calories_burned) || 350,
          date: newEntry.date || new Date().toISOString(),
          notes: newEntry.notes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updated = [createdWorkout, ...workouts];
        saveLocalWorkouts(updated);
        return { success: true, data: createdWorkout, message: 'Workout logged successfully.' } as T;
      }

      return {
        success: true,
        data: {
          workouts,
          pagination: { total: workouts.length, page: 1, limit: 10, totalPages: 1 },
        },
      } as T;
    }

    if (cleanEndpoint.startsWith('/workouts/')) {
      const parts = cleanEndpoint.split('/');
      const idOrAction = parts[2];

      if (idOrAction === 'analytics') {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentWorkouts = workouts.filter((w: any) => new Date(w.date) >= sevenDaysAgo);
        const weeklyDurationMinutes = recentWorkouts.reduce((acc: number, curr: any) => acc + (Number(curr.duration_minutes) || 0), 0);
        const weeklyCaloriesBurned = recentWorkouts.reduce((acc: number, curr: any) => acc + (Number(curr.calories_burned) || 0), 0);
        const weeklyWorkoutsCount = recentWorkouts.length;

        const monthlyWorkouts = workouts.filter((w: any) => new Date(w.date) >= thirtyDaysAgo);
        const monthlyDurationMinutes = monthlyWorkouts.reduce((acc: number, curr: any) => acc + (Number(curr.duration_minutes) || 0), 0);
        const monthlyCaloriesBurned = monthlyWorkouts.reduce((acc: number, curr: any) => acc + (Number(curr.calories_burned) || 0), 0);
        const monthlyWorkoutsCount = monthlyWorkouts.length;

        const totalLifetimeCalories = workouts.reduce((acc: number, w: any) => acc + (Number(w.calories_burned) || 0), 0);
        const totalLifetimeMinutes = workouts.reduce((acc: number, w: any) => acc + (Number(w.duration_minutes) || 0), 0);
        const totalLifetimeWorkouts = workouts.length;

        // Daily trend map for past 7 days (zeros for days without workouts)
        const dailyMap: Record<string, { date: string; calories: number; duration: number; workoutsCount: number }> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateKey = d.toISOString().split('T')[0];
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          dailyMap[dateKey] = { date: dayName, calories: 0, duration: 0, workoutsCount: 0 };
        }

        workouts.forEach((w: any) => {
          const dateKey = new Date(w.date).toISOString().split('T')[0];
          if (dailyMap[dateKey]) {
            dailyMap[dateKey].calories += (Number(w.calories_burned) || 0);
            dailyMap[dateKey].duration += (Number(w.duration_minutes) || 0);
            dailyMap[dateKey].workoutsCount += 1;
          }
        });
        const dailyTrend = Object.values(dailyMap);

        // Group by workout discipline
        const typeCounts: Record<string, number> = {};
        workouts.forEach((w: any) => {
          const t = w.type || 'Other';
          typeCounts[t] = (typeCounts[t] || 0) + 1;
        });
        const typeBreakdown = Object.keys(typeCounts).map((key) => ({
          name: key,
          count: typeCounts[key],
        }));

        // Real Goal Progress metrics
        const activeGoals = goals.filter((g: any) => g.status === 'IN_PROGRESS');
        const completedGoals = goals.filter((g: any) => g.status === 'COMPLETED');
        const avgGoalPct = goals.length > 0
          ? Math.round((goals.reduce((acc: number, g: any) => acc + (Number(g.completionPercentage) || 0), 0) / goals.length) * 10) / 10
          : 0;

        // Real Challenge Progress metrics
        const enrolledChallenges = challenges.length;
        const activeChallenges = challenges.filter((c: any) => c.user_status === 'IN_PROGRESS');
        const completedChallenges = challenges.filter((c: any) => c.user_status === 'COMPLETED');
        const challengeRate = enrolledChallenges > 0 ? Math.round((completedChallenges.length / enrolledChallenges) * 100) : 0;

        return {
          success: true,
          data: {
            summary: {
              weeklyWorkoutHours: Number((weeklyDurationMinutes / 60).toFixed(1)),
              weeklyCaloriesBurned,
              weeklyWorkoutsCount,
              monthlyWorkoutHours: Number((monthlyDurationMinutes / 60).toFixed(1)),
              monthlyCaloriesBurned,
              monthlyWorkoutsCount,
              activeChallengesCount: activeChallenges.length,
              totalLifetimeCalories,
              totalLifetimeWorkouts,
              totalLifetimeHours: Number((totalLifetimeMinutes / 60).toFixed(1)),
            },
            goalProgress: {
              totalGoals: goals.length,
              activeGoals: activeGoals.length,
              completedGoals: completedGoals.length,
              averageCompletionPercentage: avgGoalPct,
            },
            challengeProgress: {
              enrolledChallenges,
              activeChallenges: activeChallenges.length,
              completedChallenges: completedChallenges.length,
              completionRate: challengeRate,
            },
            dailyTrend,
            typeBreakdown,
          },
        } as T;
      }

      if (idOrAction === 'estimate-calories') {
        return { success: true, data: { estimated_calories: 420 } } as T;
      }

      if (options.method === 'DELETE') {
        const id = idOrAction;
        const filtered = workouts.filter((w: any) => w.id !== id);
        saveLocalWorkouts(filtered);
        return { success: true, message: 'Workout deleted successfully.' } as T;
      }

      if (options.method === 'PUT') {
        let updates: any = {};
        try {
          updates = JSON.parse((options.body as string) || '{}');
        } catch {
          updates = {};
        }
        const updated = workouts.map((w: any) => (w.id === idOrAction ? { ...w, ...updates } : w));
        saveLocalWorkouts(updated);
        return { success: true, data: updates, message: 'Workout updated.' } as T;
      }
    }

    // Goals Fallbacks
    if (cleanEndpoint === '/goals' || cleanEndpoint.startsWith('/goals/')) {
      const parts = cleanEndpoint.split('/');
      const goalId = parts[2];
      const action = parts[3];

      if (options.method === 'POST' && !goalId) {
        let body: any = {};
        try { body = JSON.parse((options.body as string) || '{}'); } catch { body = {}; }
        const newGoal = {
          id: `g-${Date.now()}`,
          title: body.title || 'New Target',
          description: body.description || '',
          goalType: body.goalType || 'CALORIE_BURN',
          unit: body.goalType === 'CALORIE_BURN' ? 'kcal' : body.goalType === 'DURATION_MINUTES' ? 'mins' : 'count',
          targetValue: Number(body.targetValue) || 100,
          currentValue: Number(body.currentValue) || 0,
          completionPercentage: Math.min(100, Math.round(((Number(body.currentValue) || 0) / (Number(body.targetValue) || 1)) * 100)),
          status: 'IN_PROGRESS',
          startDate: new Date().toISOString(),
          targetDate: body.targetDate || new Date(Date.now() + 30 * 86400000).toISOString(),
        };
        const updated = [newGoal, ...goals];
        saveLocalGoals(updated);
        return { success: true, data: newGoal, message: 'Goal established successfully.' } as T;
      }

      if (options.method === 'POST' && goalId && action === 'increment') {
        let body: any = {};
        try { body = JSON.parse((options.body as string) || '{}'); } catch { body = {}; }
        const inc = Number(body.increment) || 1;
        const updated = goals.map((g: any) => {
          if (g.id === goalId) {
            const nextVal = (g.currentValue || 0) + inc;
            const pct = Math.min(100, Math.round((nextVal / g.targetValue) * 100));
            const completed = nextVal >= g.targetValue;
            return {
              ...g,
              currentValue: nextVal,
              completionPercentage: pct,
              status: completed ? 'COMPLETED' : g.status,
              completedAt: completed ? new Date().toISOString() : g.completedAt,
            };
          }
          return g;
        });
        saveLocalGoals(updated);
        const target = updated.find((g: any) => g.id === goalId);
        return { success: true, data: target, message: 'Goal progress incremented.' } as T;
      }

      if (options.method === 'PUT' && goalId) {
        let updates: any = {};
        try { updates = JSON.parse((options.body as string) || '{}'); } catch { updates = {}; }
        const updated = goals.map((g: any) => {
          if (g.id === goalId) {
            const merged = { ...g, ...updates };
            const pct = Math.min(100, Math.round(((merged.currentValue || 0) / (merged.targetValue || 1)) * 100));
            merged.completionPercentage = pct;
            if (merged.currentValue >= merged.targetValue) merged.status = 'COMPLETED';
            return merged;
          }
          return g;
        });
        saveLocalGoals(updated);
        const target = updated.find((g: any) => g.id === goalId);
        return { success: true, data: target, message: 'Goal updated successfully.' } as T;
      }

      if (options.method === 'DELETE' && goalId) {
        const filtered = goals.filter((g: any) => g.id !== goalId);
        saveLocalGoals(filtered);
        return { success: true, message: 'Goal removed.' } as T;
      }

      return { success: true, data: goals } as T;
    }

    // Challenges Fallbacks
    if (cleanEndpoint === '/challenges' || cleanEndpoint.startsWith('/challenges/')) {
      const parts = cleanEndpoint.split('/');
      const challengeId = parts[2];
      const action = parts[3];

      // Join
      if (options.method === 'POST' && challengeId && (action === 'join' || action === 'enroll')) {
        const updated = challenges.map((c: any) => {
          if (c.id === challengeId) {
            return { ...c, user_status: 'IN_PROGRESS', user_progress: 0, progress_percent: 0, total_participants: (c.total_participants || 0) + 1 };
          }
          return c;
        });
        saveLocalChallenges(updated);
        return { success: true, data: null, message: 'Enrolled in quest successfully!' } as T;
      }

      // My Progress
      if (cleanEndpoint === '/challenges/my/progress' || cleanEndpoint === '/challenges/my') {
        const active = challenges.filter((c: any) => c.user_status === 'IN_PROGRESS');
        const completed = challenges.filter((c: any) => c.user_status === 'COMPLETED');
        return {
          success: true,
          data: { active, completed, total_badges_earned: completed.length },
        } as T;
      }

      // My History
      if (cleanEndpoint === '/challenges/my/history' || cleanEndpoint === '/challenges/history') {
        return { success: true, data: challenges } as T;
      }

      // Admin Create
      if (options.method === 'POST' && (cleanEndpoint === '/challenges/admin/create' || cleanEndpoint === '/challenges/admin')) {
        let body: any = {};
        try { body = JSON.parse((options.body as string) || '{}'); } catch { body = {}; }
        const createdChallenge = {
          id: `ch-${Date.now()}`,
          title: body.title || 'New Community Challenge',
          description: body.description || '',
          target_metric: body.targetMetric || body.target_metric || 'CALORIES',
          target_value: Number(body.targetValue || body.target_value) || 1000,
          start_date: body.startDate || body.start_date || new Date().toISOString(),
          end_date: body.endDate || body.end_date || new Date(Date.now() + 14 * 86400000).toISOString(),
          reward_badge: body.rewardBadge || body.reward_badge || 'Quest Champion',
          total_participants: 1,
          user_status: 'NOT_JOINED',
          user_progress: 0,
          progress_percent: 0,
        };
        const updated = [createdChallenge, ...challenges];
        saveLocalChallenges(updated);
        return { success: true, data: createdChallenge, message: 'Challenge launched successfully.' } as T;
      }

      // Admin Update
      if (options.method === 'PUT' && cleanEndpoint.startsWith('/challenges/admin/')) {
        const id = parts[3] || challengeId;
        let updates: any = {};
        try { updates = JSON.parse((options.body as string) || '{}'); } catch { updates = {}; }
        const updated = challenges.map((c: any) => (c.id === id ? { ...c, ...updates } : c));
        saveLocalChallenges(updated);
        return { success: true, data: updates, message: 'Challenge updated.' } as T;
      }

      // Admin Delete
      if (options.method === 'DELETE' && cleanEndpoint.startsWith('/challenges/admin/')) {
        const id = parts[3] || challengeId;
        const filtered = challenges.filter((c: any) => c.id !== id);
        saveLocalChallenges(filtered);
        return { success: true, message: 'Challenge archived successfully.' } as T;
      }

      // Admin Monitor
      if (cleanEndpoint.includes('/monitor')) {
        const target = challenges.find((c: any) => c.id === challengeId || cleanEndpoint.includes(c.id)) || challenges[0];
        return {
          success: true,
          data: {
            challenge: target,
            totalParticipants: target?.total_participants || 45,
            completedCount: Math.round((target?.total_participants || 45) * 0.4),
            inProgressCount: Math.round((target?.total_participants || 45) * 0.6),
            completionRate: 40,
            participants: [
              { id: '1', userId: 'usr-1', userName: 'Sarah Connor', userEmail: 'sarah@fitpulse.com', currentProgress: target?.target_value ? Math.round(target.target_value * 0.6) : 60, progressPercentage: 60, status: 'IN_PROGRESS', joinedAt: '2026-10-01' },
              { id: '2', userId: 'usr-2', userName: 'David Miller', userEmail: 'david@fitpulse.com', currentProgress: target?.target_value || 100, progressPercentage: 100, status: 'COMPLETED', joinedAt: '2026-10-02', completedAt: '2026-10-07' },
            ],
          },
        } as T;
      }

      return { success: true, data: challenges } as T;
    }

    // Content Fallbacks
    if (cleanEndpoint.startsWith('/content')) {
      const urlQuery = endpoint.includes('?') ? new URLSearchParams(endpoint.split('?')[1]) : new URLSearchParams();
      const catParam = urlQuery.get('category');
      const searchParam = urlQuery.get('search');

      let filtered = [...CLINICAL_PROTOCOLS];

      if (catParam && catParam.toUpperCase() !== 'ALL') {
        const normCat = catParam.toLowerCase().replace(/[\s_-]+/g, '');
        filtered = filtered.filter((item) => {
          const itemNorm = item.category.toLowerCase().replace(/[\s_-]+/g, '');
          return itemNorm === normCat;
        });
      }

      if (searchParam) {
        const q = searchParam.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            (item.summary && item.summary.toLowerCase().includes(q))
        );
      }

      return {
        success: true,
        data: filtered,
      } as T;
    }

    // Admin Fallbacks
    if (cleanEndpoint === '/admin/dashboard') {
      return {
        success: true,
        data: {
          totalUsers: 148,
          activeUsers: 92,
          totalWorkouts: 1240,
          pendingModeration: 1,
          openChallenges: 3,
          systemStatus: 'ALL_SYSTEMS_OPTIMAL',
        },
      } as T;
    }

    if (cleanEndpoint === '/admin/users') {
      return {
        success: true,
        data: {
          users: [SEED_USERS.admin, SEED_USERS.sarah, SEED_USERS.david],
          pagination: { total: 3, page: 1, limit: 10, totalPages: 1 },
        },
      } as T;
    }

    if (cleanEndpoint === '/admin/settings') {
      return {
        success: true,
        data: [
          { key: 'maintenance_mode', value: 'false', description: 'Platform Maintenance' },
          { key: 'require_email_verify', value: 'true', description: 'Mandatory Email Verification' },
          { key: 'met_scaling', value: 'true', description: 'Dynamic Caloric Burn Multiplier' },
        ],
      } as T;
    }

    if (cleanEndpoint === '/admin/audit-logs') {
      return {
        success: true,
        data: [
          { id: 'al-1', action: 'USER_LOGIN', user_email: 'sarah@fitpulse.com', created_at: new Date().toISOString() },
          { id: 'al-2', action: 'WORKOUT_LOGGED', user_email: 'sarah@fitpulse.com', created_at: new Date().toISOString() },
        ],
      } as T;
    }

    // Default generic fallback envelope
    return { success: true, data: null, message: 'Processed successfully.' } as T;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // 401 Unauthorized Interceptor: purge stale/expired credentials and notify UI
      if (response.status === 401) {
        const isAuthEndpoint =
          endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');

        if (!isAuthEndpoint) {
          console.warn(`[FitPulse API 401 Interceptor] Unauthorized request to ${endpoint}. Purging session credentials.`);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('fitpulse_token');
            localStorage.removeItem('fitpulse_demo_role');
            window.dispatchEvent(
              new CustomEvent('fitpulse_auth_unauthorized', {
                detail: {
                  endpoint,
                  message: 'Session expired or invalid credentials. Please log in again.',
                },
              })
            );
          }
        }
      }

      // Handle non-JSON responses from Vercel static routing (e.g. 404 HTML or SPA redirects)
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.warn(`[FitPulse API] Non-JSON response received from ${API_BASE_URL}${endpoint} (Status ${response.status}). Activating resilient local fallback.`);
        return this.handleFallback<T>(endpoint, options);
      }

      const data = await response.json().catch(() => null);

      if (!data) {
        return this.handleFallback<T>(endpoint, options);
      }

      if (!response.ok) {
        // If route not found on remote server (404/502/503), switch gracefully to fallback
        if (response.status === 404 || response.status === 502 || response.status === 503) {
          console.warn(`[FitPulse API] Server returned ${response.status} for ${endpoint}. Using resilient local store.`);
          return this.handleFallback<T>(endpoint, options);
        }

        const errorMsg =
          data.errors && data.errors.length > 0
            ? data.errors.map((e: any) => `${e.field ? `${e.field}: ` : ''}${e.message}`).join(', ')
            : data.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (networkError: any) {
      // If server is unreachable (CORS block, offline, Vercel standalone client deployment)
      if (
        networkError.name === 'TypeError' ||
        networkError.message?.includes('Failed to fetch') ||
        networkError.message?.includes('NetworkError') ||
        networkError.message?.includes('Load failed')
      ) {
        console.warn(`[FitPulse API] Backend unreachable at ${API_BASE_URL}. Running in client-resilient mode.`);
        return this.handleFallback<T>(endpoint, options);
      }
      throw networkError;
    }
  }

  // --- Auth Endpoints ---
  async login(credentials: { email: string; password: string }) {
    return this.request<{ success: boolean; data: { token: string; user: any }; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(payload: { name: string; email: string; password: string; role?: string }) {
    return this.request<{ success: boolean; data: { token: string; user: any }; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; data: any }>('/auth/me');
  }

  async updateProfile(updates: { name?: string; email?: string; profile_image?: string }) {
    return this.request<{ success: boolean; data: any; message: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async changePassword(passwords: { currentPassword: string; newPassword: string }) {
    return this.request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    });
  }

  // --- Workout Endpoints ---
  async getWorkouts(params?: { type?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: { workouts: any[]; pagination: any } }>(`/workouts${qs}`);
  }

  async getWorkoutAnalytics() {
    return this.request<{ success: boolean; data: any }>('/workouts/analytics');
  }

  async createWorkout(workout: {
    type: string;
    duration_minutes: number;
    intensity: string;
    calories_burned?: number;
    date?: string;
    notes?: string;
  }) {
    return this.request<{ success: boolean; data: any; message: string }>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
  }

  async updateWorkout(id: string, workout: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workout),
    });
  }

  async deleteWorkout(id: string) {
    return this.request<{ success: boolean; message: string }>(`/workouts/${id}`, {
      method: 'DELETE',
    });
  }

  async estimateCalories(type: string, duration_minutes: number, intensity: string) {
    return this.request<{ success: boolean; data: { estimated_calories: number } }>(
      `/workouts/estimate-calories?type=${encodeURIComponent(type)}&duration_minutes=${duration_minutes}&intensity=${intensity}`
    );
  }

  // --- Fitness Goals Endpoints ---
  async getGoals(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/goals${qs}`);
  }

  async createGoal(goal: {
    title: string;
    description?: string;
    goalType?: string;
    type?: string;
    targetValue?: number;
    target_value?: number;
    currentValue?: number;
    current_value?: number;
    unit?: string;
    targetDate?: string;
    target_date?: string;
  }) {
    return this.request<{ success: boolean; data: any; message: string }>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  async updateGoal(id: string | number, goal: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
  }

  async deleteGoal(id: string | number) {
    return this.request<{ success: boolean; message: string }>(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async incrementGoal(id: string | number, increment: number) {
    return this.request<{ success: boolean; data: any; message: string }>(`/goals/${id}/increment`, {
      method: 'POST',
      body: JSON.stringify({ increment }),
    });
  }

  // --- Challenges Endpoints ---
  async getChallenges() {
    return this.request<{ success: boolean; data: any[] }>('/challenges');
  }

  async joinChallenge(challengeId: string) {
    return this.request<{ success: boolean; data: any; message: string }>(`/challenges/${challengeId}/join`, {
      method: 'POST',
    });
  }

  async updateUserChallengeProgress(
    challengeId: string | number,
    progress: number,
    status?: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
  ) {
    return this.request<{ success: boolean; data: any; message: string }>(
      `/challenges/${challengeId}/progress`,
      {
        method: 'PATCH',
        body: JSON.stringify({ progress, status }),
      }
    );
  }

  async getMyChallenges() {
    return this.request<{ success: boolean; data: { active: any[]; completed: any[]; total_badges_earned: number } }>(
      '/challenges/my/progress'
    );
  }

  async getChallengeHistory() {
    return this.request<{ success: boolean; data: any[] }>('/challenges/my/history');
  }

  async createChallengeAdmin(challenge: any) {
    return this.request<{ success: boolean; data: any; message: string }>('/challenges/admin/create', {
      method: 'POST',
      body: JSON.stringify(challenge),
    });
  }

  async updateChallengeAdmin(challengeId: string | number, updates: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/challenges/admin/${challengeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteChallengeAdmin(challengeId: string | number) {
    return this.request<{ success: boolean; message: string }>(`/challenges/admin/${challengeId}`, {
      method: 'DELETE',
    });
  }

  async monitorChallengeAdmin(challengeId: string | number) {
    return this.request<{ success: boolean; data: any }>(`/challenges/admin/${challengeId}/monitor`);
  }

  // --- Content Endpoints ---
  async getPublicContent(category?: string, search?: string) {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (search) query.append('search', search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/content${qs}`);
  }

  async createContent(content: { title: string; description: string; category: string; media_url?: string }) {
    return this.request<{ success: boolean; data: any; message: string }>('/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  async getAllContentAdmin(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/content/admin/all${query}`);
  }

  async moderateContentAdmin(id: string, status: 'APPROVED' | 'REJECTED', feedback?: string) {
    return this.request<{ success: boolean; data: any; message: string }>(`/content/admin/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ status, feedback }),
    });
  }

  async deleteContentAdmin(id: string) {
    return this.request<{ success: boolean; message: string }>(`/content/admin/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyContent() {
    return this.request<{ success: boolean; data: any[] }>('/content/my');
  }

  // --- Admin Endpoints ---
  async getAdminDashboard() {
    return this.request<{ success: boolean; data: any }>('/admin/dashboard');
  }

  async getAdminUsers(params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role && params.role !== 'ALL') query.append('role', params.role);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: { users: any[]; pagination: any } }>(`/admin/users${qs}`);
  }

  async createAdminUser(user: { name: string; email: string; password: string; role: string }) {
    return this.request<{ success: boolean; data: any; message: string }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateAdminUser(id: string, updates: { name?: string; email?: string; role?: string; is_active?: boolean; status?: string }) {
    return this.request<{ success: boolean; data: any; message: string }>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.request<{ success: boolean; data: any; message: string }>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async toggleUserStatus(id: string, is_active: boolean) {
    return this.request<{ success: boolean; data: any; message: string }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    });
  }

  async deleteAdminUser(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getSystemSettings() {
    return this.request<{ success: boolean; data: any[] }>('/admin/settings');
  }

  async updateSystemSetting(key: string, value: string, description?: string) {
    return this.request<{ success: boolean; data: any; message: string }>(`/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    });
  }

  async getAdminStatistics() {
    return this.request<{ success: boolean; data: any }>('/admin/statistics');
  }

  async getAuditLogs(limit = 30) {
    return this.request<{ success: boolean; data: any[] }>(`/admin/audit-logs?limit=${limit}`);
  }

  async getActivityLogs(params?: { limit?: number; page?: number; action?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.page) query.append('page', String(params.page));
    if (params?.action && params.action !== 'ALL') query.append('action', params.action);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: any[]; pagination?: any }>(`/admin/activity-logs${qs}`);
  }

  async getActivityStats() {
    return this.request<{ success: boolean; data: any }>('/admin/activity-stats');
  }
}

export const api = new ApiClient();
