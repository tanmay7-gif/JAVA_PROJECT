import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FitPulse database seeding...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.userChallenge.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.fitnessContent.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  // Create Passwords
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const userPasswordHash = await bcrypt.hash('User123!', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Marcus Vance (Admin)',
      email: 'admin@fitpulse.com',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
  });

  const sarahUser = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah@fitpulse.com',
      password_hash: userPasswordHash,
      role: 'USER',
      profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    },
  });

  const davidUser = await prisma.user.create({
    data: {
      name: 'David Miller',
      email: 'david@fitpulse.com',
      password_hash: userPasswordHash,
      role: 'USER',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    },
  });

  console.log('✅ Users seeded: Admin, Sarah, David');

  // 2. Create Workout Logs (Past 14 days)
  const now = new Date();
  const workoutsData = [
    {
      user_id: sarahUser.id,
      type: 'HIIT',
      duration_minutes: 45,
      intensity: 'HIGH',
      calories_burned: 520,
      daysAgo: 0,
      notes: 'Morning tabata intervals, felt powerful and energized!',
    },
    {
      user_id: sarahUser.id,
      type: 'Strength',
      duration_minutes: 60,
      intensity: 'HIGH',
      calories_burned: 430,
      daysAgo: 1,
      notes: 'Heavy deadlifts & barbell rows. Hit new PR: 95kg!',
    },
    {
      user_id: sarahUser.id,
      type: 'Cardio',
      duration_minutes: 35,
      intensity: 'MEDIUM',
      calories_burned: 310,
      daysAgo: 2,
      notes: 'Zone 2 steady incline treadmill jog.',
    },
    {
      user_id: sarahUser.id,
      type: 'Yoga',
      duration_minutes: 50,
      intensity: 'LOW',
      calories_burned: 180,
      daysAgo: 3,
      notes: 'Deep vinyasa flow recovery session.',
    },
    {
      user_id: sarahUser.id,
      type: 'Cycling',
      duration_minutes: 65,
      intensity: 'HIGH',
      calories_burned: 640,
      daysAgo: 4,
      notes: 'Outdoor sprint circuits with elevation climbs.',
    },
    {
      user_id: sarahUser.id,
      type: 'Strength',
      duration_minutes: 55,
      intensity: 'MEDIUM',
      calories_burned: 390,
      daysAgo: 6,
      notes: 'Upper body hypertrophy focus: bench, overhead press, dips.',
    },
    {
      user_id: davidUser.id,
      type: 'Cardio',
      duration_minutes: 40,
      intensity: 'HIGH',
      calories_burned: 480,
      daysAgo: 0,
      notes: '5km fast tempo trail run.',
    },
    {
      user_id: davidUser.id,
      type: 'Strength',
      duration_minutes: 70,
      intensity: 'HIGH',
      calories_burned: 510,
      daysAgo: 2,
      notes: 'Squat focus day with pause reps.',
    },
  ];

  for (const item of workoutsData) {
    const workoutDate = new Date(now);
    workoutDate.setDate(workoutDate.getDate() - item.daysAgo);

    await prisma.workoutLog.create({
      data: {
        user_id: item.user_id,
        type: item.type,
        duration_minutes: item.duration_minutes,
        intensity: item.intensity,
        calories_burned: item.calories_burned,
        date: workoutDate,
        notes: item.notes,
      },
    });
  }

  console.log('✅ Workout logs seeded');

  // 3. Create Challenges
  const challenge1 = await prisma.challenge.create({
    data: {
      title: 'Spring Calorie Torch',
      description: 'Burn a total of 10,000 active calories across all workouts this month.',
      target_metric: 'CALORIES',
      target_value: 10000,
      start_date: new Date(now.getFullYear(), now.getMonth(), 1),
      end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      reward_badge: 'Flame Master 2026',
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      title: 'Iron Habit 20-Workout Streak',
      description: 'Log 20 complete training sessions to forge lifelong fitness discipline.',
      target_metric: 'WORKOUT_COUNT',
      target_value: 20,
      start_date: new Date(now.getFullYear(), now.getMonth(), 1),
      end_date: new Date(now.getFullYear(), now.getMonth() + 2, 0),
      reward_badge: 'Iron Will Titan',
    },
  });

  const challenge3 = await prisma.challenge.create({
    data: {
      title: '1,000 Minutes of Movement',
      description: 'Clock over 1,000 minutes of active exercise to maximize cardiorespiratory endurance.',
      target_metric: 'DURATION',
      target_value: 1000,
      start_date: new Date(now.getFullYear(), now.getMonth(), 1),
      end_date: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      reward_badge: 'Endurance Sovereign',
    },
  });

  // Assign Challenges to Sarah
  await prisma.userChallenge.create({
    data: {
      user_id: sarahUser.id,
      challenge_id: challenge1.id,
      status: 'IN_PROGRESS',
      current_progress: 2470,
    },
  });

  await prisma.userChallenge.create({
    data: {
      user_id: sarahUser.id,
      challenge_id: challenge2.id,
      status: 'IN_PROGRESS',
      current_progress: 6,
    },
  });

  await prisma.userChallenge.create({
    data: {
      user_id: sarahUser.id,
      challenge_id: challenge3.id,
      status: 'COMPLETED',
      current_progress: 1000,
      completed_at: new Date(),
    },
  });

  console.log('✅ Challenges & User participations seeded');

  // 4. Create Fitness Content
  await prisma.fitnessContent.create({
    data: {
      creator_id: adminUser.id,
      title: 'Optimal Hypertrophy Blueprint: Science-Backed Volume & Rep Ranges',
      description: 'Comprehensive guide breaking down weekly mechanical tension, effective sets per muscle group, and progressive overload pacing.',
      category: 'Workout Routine',
      media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      status: 'APPROVED',
    },
  });

  await prisma.fitnessContent.create({
    data: {
      creator_id: sarahUser.id,
      title: 'Zone 2 Aerobic Conditioning: The Engine of Longevity',
      description: 'How keeping heart rate in lactate threshold 1 enhances mitochondrial density and fat oxidation without CNS fatigue.',
      category: 'Guide',
      media_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
      status: 'APPROVED',
    },
  });

  await prisma.fitnessContent.create({
    data: {
      creator_id: davidUser.id,
      title: 'Kettlebell Complex for High-Metabolic Burn in 25 Minutes',
      description: 'Five back-to-back kettlebell clean and presses followed by goblet squats and snatches with zero rest between moves.',
      category: 'Workout Routine',
      media_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      status: 'PENDING',
    },
  });

  await prisma.fitnessContent.create({
    data: {
      creator_id: davidUser.id,
      title: 'Extreme 500-Calorie Crash Diet Protocol',
      description: 'Questionable protocol advocating starvation for rapid weight loss.',
      category: 'Nutrition',
      status: 'REJECTED',
      feedback: 'Violates platform safety guidelines. We strictly prohibit crash starvation diets.',
    },
  });

  console.log('✅ Fitness Content Guides seeded');

  // 5. System Settings
  const settings = [
    {
      key: 'platform_maintenance_mode',
      value: 'false',
      description: 'Enable to redirect regular traffic to maintenance screen while admin retains access.',
    },
    {
      key: 'default_daily_calorie_goal',
      value: '650',
      description: 'Default target calories burned for newly registered athlete profiles.',
    },
    {
      key: 'allow_public_content_submissions',
      value: 'true',
      description: 'Allow standard users to submit training guides to the community moderation queue.',
    },
    {
      key: 'max_workout_duration_hours',
      value: '6',
      description: 'Upper validation threshold for single session duration.',
    },
    {
      key: 'platform_announcement',
      value: '🎉 Welcome to FitPulse 2.0! Check out our new monthly endurance challenges and earn exclusive badges.',
      description: 'Global banner broadcasted to all logged-in users.',
    },
  ];

  for (const s of settings) {
    await prisma.systemSetting.create({
      data: {
        key: s.key,
        value: s.value,
        description: s.description,
        updated_by: adminUser.id,
      },
    });
  }

  console.log('✅ System Settings seeded');

  // 6. Audit Logs
  await prisma.auditLog.create({
    data: {
      user_id: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      details: 'FitPulse production database seeded with verified baseline configurations.',
    },
  });

  await prisma.auditLog.create({
    data: {
      user_id: sarahUser.id,
      action: 'USER_LOGIN',
      details: 'Authenticated from mobile client (iOS).',
    },
  });

  await prisma.auditLog.create({
    data: {
      user_id: sarahUser.id,
      action: 'LOG_WORKOUT',
      details: 'Logged HIIT workout: 45m, 520 kcal.',
    },
  });

  await prisma.auditLog.create({
    data: {
      user_id: adminUser.id,
      action: 'MODERATE_CONTENT',
      details: 'Approved "Zone 2 Aerobic Conditioning" and rejected dangerous crash diet.',
    },
  });

  console.log('✅ Audit logs seeded');
  console.log('🚀 FitPulse database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
