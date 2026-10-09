import bcrypt from 'bcryptjs';
import prisma from './database.js';

export async function autoSeedDatabase(): Promise<void> {
  try {
    console.log('🔄 Checking database demo accounts and seed status...');

    // 1. Password Hashes
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
    const userPasswordHash = await bcrypt.hash('User123!', 10);

    // 2. Auto-seed Admin User (Marcus)
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@fitpulse.com' },
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'Marcus Vance (Admin)',
          email: 'admin@fitpulse.com',
          password_hash: adminPasswordHash,
          role: 'ADMIN',
          profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          is_active: true,
        },
      });
      console.log('  ✅ Seeded Admin Account: admin@fitpulse.com (Admin123!)');
    }

    // 3. Auto-seed Primary Athlete User (Sarah)
    let sarahUser = await prisma.user.findUnique({
      where: { email: 'sarah@fitpulse.com' },
    });

    if (!sarahUser) {
      sarahUser = await prisma.user.create({
        data: {
          name: 'Sarah Connor',
          email: 'sarah@fitpulse.com',
          password_hash: userPasswordHash,
          role: 'USER',
          profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
          is_active: true,
        },
      });
      console.log('  ✅ Seeded Athlete Account: sarah@fitpulse.com (User123!)');
    }

    // 4. Auto-seed Generic Athlete Account (athlete@fitpulse.com)
    let athleteUser = await prisma.user.findUnique({
      where: { email: 'athlete@fitpulse.com' },
    });

    if (!athleteUser) {
      athleteUser = await prisma.user.create({
        data: {
          name: 'Demo Athlete',
          email: 'athlete@fitpulse.com',
          password_hash: userPasswordHash,
          role: 'USER',
          profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          is_active: true,
        },
      });
      console.log('  ✅ Seeded Generic Athlete Account: athlete@fitpulse.com (User123!)');
    }

    // 5. Auto-seed Challenges if none exist
    const challengeCount = await prisma.challenge.count();
    if (challengeCount === 0) {
      const now = new Date();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const ch1 = await prisma.challenge.create({
        data: {
          title: '5,000 kcal Metabolic Burn',
          description: 'Burn a cumulative 5,000 active calories across high-intensity conditioning sessions.',
          target_metric: 'CALORIES',
          target_value: 5000,
          start_date: new Date(now.getFullYear(), now.getMonth(), 1),
          end_date: monthEnd,
          reward_badge: 'Metabolic Inferno',
        },
      });

      const ch2 = await prisma.challenge.create({
        data: {
          title: 'Century Conditioning Split',
          description: 'Log 180 total minutes of high-cadence cycling or rowing endurance.',
          target_metric: 'DURATION',
          target_value: 180,
          start_date: new Date(now.getFullYear(), now.getMonth(), 1),
          end_date: new Date(Date.now() + 14 * 86400000),
          reward_badge: 'Century Cyclist',
        },
      });

      const ch3 = await prisma.challenge.create({
        data: {
          title: '14-Day Consistency Master',
          description: 'Complete at least 10 logged sessions over a 14-day rolling training cycle.',
          target_metric: 'WORKOUT_COUNT',
          target_value: 10,
          start_date: new Date(now.getFullYear(), now.getMonth(), 1),
          end_date: new Date(Date.now() + 14 * 86400000),
          reward_badge: 'Iron Will',
        },
      });

      // Enroll Sarah and Athlete in challenges
      await prisma.userChallenge.createMany({
        data: [
          {
            user_id: sarahUser.id,
            challenge_id: ch1.id,
            status: 'IN_PROGRESS',
            current_progress: 3010,
          },
          {
            user_id: sarahUser.id,
            challenge_id: ch2.id,
            status: 'COMPLETED',
            current_progress: 180,
            completed_at: new Date(),
          },
          {
            user_id: sarahUser.id,
            challenge_id: ch3.id,
            status: 'IN_PROGRESS',
            current_progress: 6,
          },
          {
            user_id: athleteUser.id,
            challenge_id: ch1.id,
            status: 'IN_PROGRESS',
            current_progress: 3010,
          },
          {
            user_id: athleteUser.id,
            challenge_id: ch2.id,
            status: 'COMPLETED',
            current_progress: 180,
            completed_at: new Date(),
          },
          {
            user_id: athleteUser.id,
            challenge_id: ch3.id,
            status: 'IN_PROGRESS',
            current_progress: 6,
          },
        ],
      });

      console.log('  ✅ Seeded Core Fitness Challenges & Enrollments');
    }

    // 6. Auto-seed Workout Logs for Sarah and Athlete if none exist
    const athleteIds = [sarahUser.id, athleteUser.id];
    for (const uid of athleteIds) {
      const workoutCount = await prisma.workoutLog.count({
        where: { user_id: uid },
      });

      if (workoutCount === 0) {
        const pastWorkouts = [
          {
            user_id: uid,
            type: 'HIIT',
            duration_minutes: 45,
            intensity: 'HIGH',
            calories_burned: 520,
            date: new Date(Date.now() - 0 * 86400000),
            notes: 'Morning tabata intervals, felt powerful and energized!',
          },
          {
            user_id: uid,
            type: 'Strength',
            duration_minutes: 60,
            intensity: 'HIGH',
            calories_burned: 430,
            date: new Date(Date.now() - 1 * 86400000),
            notes: 'Heavy deadlifts & barbell rows. Hit new PR: 95kg!',
          },
          {
            user_id: uid,
            type: 'Cardio',
            duration_minutes: 35,
            intensity: 'MEDIUM',
            calories_burned: 310,
            date: new Date(Date.now() - 2 * 86400000),
            notes: 'Zone 2 steady incline treadmill jog.',
          },
          {
            user_id: uid,
            type: 'Yoga',
            duration_minutes: 50,
            intensity: 'LOW',
            calories_burned: 180,
            date: new Date(Date.now() - 3 * 86400000),
            notes: 'Mobility flow and hamstring lengthening.',
          },
          {
            user_id: uid,
            type: 'Running',
            duration_minutes: 40,
            intensity: 'HIGH',
            calories_burned: 480,
            date: new Date(Date.now() - 4 * 86400000),
            notes: '5km outdoor tempo run with sprint surges.',
          },
          {
            user_id: uid,
            type: 'Cycling',
            duration_minutes: 55,
            intensity: 'MEDIUM',
            calories_burned: 420,
            date: new Date(Date.now() - 5 * 86400000),
            notes: 'Cadence RPM intervals on indoor trainer.',
          },
        ];

        await prisma.workoutLog.createMany({ data: pastWorkouts });
        console.log(`  ✅ Seeded 6 Telemetry Workout Sessions for user ${uid}`);
      }
    }

    // 7. Auto-seed System Settings if none exist
    const settingsCount = await prisma.systemSetting.count();
    if (settingsCount === 0) {
      await prisma.systemSetting.createMany({
        data: [
          { key: 'maintenance_mode', value: 'false', description: 'Platform Maintenance Mode' },
          { key: 'require_email_verify', value: 'true', description: 'Require Email Verification for JWT' },
          { key: 'met_scaling', value: 'true', description: 'Dynamic Caloric Burn Multiplier' },
        ],
      });
      console.log('  ✅ Seeded System Platform Settings');
    }

    console.log('✨ Auto-seed verification complete. Database ready for production.');
  } catch (err: any) {
    console.error('⚠️ Warning: Auto-seed encountered an issue (non-fatal):', err.message);
  }
}
