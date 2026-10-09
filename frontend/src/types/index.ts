export type Role = 'USER' | 'ADMIN';
export type Intensity = 'LOW' | 'MEDIUM' | 'HIGH';
export type ContentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ChallengeStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type TargetMetric = 'CALORIES' | 'DURATION' | 'WORKOUT_COUNT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  profile_image?: string | null;
  is_active?: boolean;
  isTrialAccount?: boolean;
  created_at: string;
  updated_at?: string;
  _count?: {
    workouts?: number;
    userChallenges?: number;
  };
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  type: string;
  duration_minutes: number;
  intensity: Intensity;
  calories_burned: number;
  date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FitnessContent {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  media_url?: string | null;
  status: ContentStatus;
  feedback?: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    name: string;
    email?: string;
    profile_image?: string | null;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target_metric: TargetMetric;
  target_value: number;
  start_date: string;
  end_date: string;
  reward_badge: string;
  reward_xp?: number;
  rewardXp?: number;
  total_participants?: number;
  user_status?: 'NOT_JOINED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  user_progress?: number;
  progress_percent?: number;
  completed_at?: string | null;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: ChallengeStatus;
  current_progress: number;
  joined_at: string;
  completed_at?: string | null;
  challenge: Challenge;
  progress_percentage?: number;
  badge?: string;
}

export interface Goal {
  id: string;
  user_id?: string;
  userId?: string;
  title: string;
  type: string;
  target_value: number;
  targetValue?: number;
  current_value: number;
  currentValue?: number;
  unit: string;
  target_date?: string;
  targetDate?: string;
  deadline?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';
  progress_percentage?: number;
  progressPercentage?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updated_by?: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  details?: string | null;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
}

export interface AnalyticsSummary {
  summary: {
    weeklyWorkoutHours: number;
    weeklyCaloriesBurned: number;
    monthlyWorkoutHours?: number;
    monthlyCaloriesBurned?: number;
    weeklyWorkoutsCount?: number;
    monthlyWorkoutsCount?: number;
    activeChallengesCount?: number;
    totalLifetimeCalories: number;
    totalLifetimeWorkouts: number;
    totalLifetimeHours: number;
  };
  goalProgress?: {
    activeGoals: number;
    completedGoals: number;
    averageCompletionPercentage: number;
  };
  challengeProgress?: {
    enrolledChallenges: number;
    completedChallenges: number;
    completionRate: number;
  };
  dailyTrend: Array<{
    date: string;
    calories: number;
    duration: number;
    workoutsCount: number;
  }>;
  intensityBreakdown: Array<{
    name: string;
    value: number;
  }>;
  typeBreakdown: Array<{
    name: string;
    count: number;
  }>;
}

export interface AdminDashboardData {
  kpis: {
    totalUsers: number;
    activeWorkoutsToday: number;
    pendingContentApprovals: number;
    ongoingChallenges: number;
  };
  recentActivity: AuditLog[];
  engagementTrend: Array<{
    day: string;
    workouts: number;
    activeUsers: number;
  }>;
}
