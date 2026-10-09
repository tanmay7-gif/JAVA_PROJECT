// frontend/src/utils/mockTrialData.ts

export const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export interface TrialAthleteData {
  activityRings: {
    move: { current: number; target: number; percentage: number };
    exercise: { current: number; target: number; percentage: number };
    stand: { current: number; target: number; percentage: number };
  };
  liveHeartRate: number;
  kpis: {
    totalWorkouts: number;
    activeEnergy: number;
    durationHours: string;
  };
  weeklyCalorieTrend: Array<{ day: string; kcal: number; date?: string }>;
  recoveryRecommendation: {
    title: string;
    category: string;
    activity: string;
    protocol: string;
    readinessPct: number;
  };
}

export interface TrialAdminData {
  clusterUptime: string;
  totalAthletes: number;
  activeWorkoutsToday: number;
  totalKcalBurnedPlatform: number;
  pendingReviewsCount: number;
  recentAuditLogsCount: number;
}

/**
 * Generates realistic, randomized dynamic telemetry for Trial / Guest accounts
 */
export const generateTrialAthleteData = (): TrialAthleteData => {
  const steps = getRandomInt(12000, 21000);
  const exerciseMins = getRandomInt(45, 95);
  const standHours = getRandomInt(8, 14);

  return {
    activityRings: {
      move: {
        current: steps,
        target: 15000,
        percentage: Math.min(Math.round((steps / 15000) * 100), 140),
      },
      exercise: {
        current: exerciseMins,
        target: 60,
        percentage: Math.min(Math.round((exerciseMins / 60) * 100), 150),
      },
      stand: {
        current: standHours,
        target: 12,
        percentage: Math.min(Math.round((standHours / 12) * 100), 100),
      },
    },
    liveHeartRate: getRandomInt(68, 88),
    kpis: {
      totalWorkouts: getRandomInt(4, 9),
      activeEnergy: getRandomInt(1250, 2200),
      durationHours: (getRandomInt(18, 42) / 10).toFixed(1),
    },
    weeklyCalorieTrend: [
      { day: 'Mon', kcal: getRandomInt(1400, 2100) },
      { day: 'Tue', kcal: getRandomInt(1350, 1950) },
      { day: 'Wed', kcal: getRandomInt(1500, 2300) },
      { day: 'Thu', kcal: getRandomInt(1600, 2400) },
      { day: 'Fri', kcal: getRandomInt(1400, 2050) },
      { day: 'Sat', kcal: getRandomInt(1700, 2600) },
      { day: 'Sun', kcal: getRandomInt(1500, 2200) },
    ],
    recoveryRecommendation: {
      title: 'ZONE-2 AEROBIC FLUSH & FASCIAL MOBILITY',
      category: 'Active Recovery Protocol',
      activity: 'Light Jog/Brisk Walk (50 mins, Zone 2)',
      protocol: 'Foam Roll & Static Stretching (20 mins)',
      readinessPct: getRandomInt(65, 88),
    },
  };
};

/**
 * Strict Zero-State baseline for newly registered / real authenticated user accounts
 */
export const generateZeroStateAthleteData = (): TrialAthleteData => ({
  activityRings: {
    move: { current: 0, target: 15000, percentage: 0 },
    exercise: { current: 0, target: 60, percentage: 0 },
    stand: { current: 0, target: 12, percentage: 0 },
  },
  liveHeartRate: 0,
  kpis: {
    totalWorkouts: 0,
    activeEnergy: 0,
    durationHours: '0.0',
  },
  weeklyCalorieTrend: [
    { day: 'Mon', kcal: 0 },
    { day: 'Tue', kcal: 0 },
    { day: 'Wed', kcal: 0 },
    { day: 'Thu', kcal: 0 },
    { day: 'Fri', kcal: 0 },
    { day: 'Sat', kcal: 0 },
    { day: 'Sun', kcal: 0 },
  ],
  recoveryRecommendation: {
    title: 'AWAITING BASELINE BIOMETRIC PROTOCOL',
    category: 'Pristine Athlete Baseline',
    activity: 'Log your first workout to generate AI biomechanical recovery telemetry',
    protocol: 'Baseline calibration pending initial session',
    readinessPct: 0,
  },
});

export const generateTrialAdminData = (): TrialAdminData => ({
  clusterUptime: '99.98%',
  totalAthletes: getRandomInt(840, 1250),
  activeWorkoutsToday: getRandomInt(140, 320),
  totalKcalBurnedPlatform: getRandomInt(450000, 950000),
  pendingReviewsCount: getRandomInt(2, 8),
  recentAuditLogsCount: getRandomInt(40, 120),
});

export const generateZeroStateAdminData = (): TrialAdminData => ({
  clusterUptime: '100.0%',
  totalAthletes: 0,
  activeWorkoutsToday: 0,
  totalKcalBurnedPlatform: 0,
  pendingReviewsCount: 0,
  recentAuditLogsCount: 0,
});
