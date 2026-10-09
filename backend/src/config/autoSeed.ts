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

    // 8. Auto-seed Clinical Protocols across Guide, Nutrition, and Recovery if not present
    const clinicalProtocols = [
      {
        title: 'Biomechanical Barbell Kinematics: Eliminating Spinal Shear in Posterior Chain Lifts',
        category: 'Guide',
        creator_id: adminUser.id,
        media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
        status: 'APPROVED',
        description: 'Comprehensive kinematic breakdown of pelvic tilt, intra-abdominal bracing, and hip hinge levers to maximize force transfer while minimizing lumbar strain.\n\nKey Points:\n* Valsalva maneuver mechanics and hydraulic intra-abdominal pressure.\n* Hip-dominant vs knee-dominant hinge cues.\n* Strict perpendicular bar path tracking over midfoot.',
      },
      {
        title: 'Zone-2 Aerobic Base Architecture: Mitochondrial Density & Lactate Clearance',
        category: 'Guide',
        creator_id: adminUser.id,
        media_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
        status: 'APPROVED',
        description: 'Step-by-step programming guidelines for building an expansive aerobic base below 2.0 mmol/L blood lactate.\n\nKey Points:\n* Calculating true Zone-2 thresholds via conversational pacing.\n* Weekly volume distribution following the 80/20 polarized matrix.\n* PGC-1α signaling and mitochondrial cristae expansion.',
      },
      {
        title: 'Grip Dynamics & Kinetic Chain Radiations in Overhead Presses',
        category: 'Guide',
        creator_id: sarahUser.id,
        media_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
        status: 'APPROVED',
        description: "Exploring Sherrington's law of irradiation to unlock vertical pressing stability through active forearm tension and scapulohumeral rhythm.\n\nKey Points:\n* Sherrington's Law of Neural Irradiation.\n* Bulldog grip placement to stack wrist and olecranon vertically.\n* Scapulohumeral rhythm with upward rotation to clear the subacromial space.",
      },
      {
        title: 'Peri-Workout Glycogen Supercompensation: Precision Nutrient Timing',
        category: 'Nutrition',
        creator_id: adminUser.id,
        media_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
        status: 'APPROVED',
        description: 'A clinical roadmap to pre-, intra-, and post-workout macronutrient ratios designed to maximize muscle protein synthesis and accelerate glycogen resynthesis.\n\nKey Points:\n* High-glycemic intra-workout carbohydrate-to-electrolyte solutions (6-8% solution).\n* 0.4g/kg post-workout leucine thresholds (3g free L-Leucine).\n* Hydration osmolarity formulas and rapid GLUT-4 translocation.',
      },
      {
        title: 'Micronutrient Optimization for High-Volume Endurance & Electrolyte Balance',
        category: 'Nutrition',
        creator_id: sarahUser.id,
        media_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
        status: 'APPROVED',
        description: 'Combatting hyponatremia and exercise-induced cramping through customized sodium, potassium, and magnesium dosing strategies.\n\nKey Points:\n* Sweat-rate loss estimation formulas.\n* Bioavailable chelates (magnesium glycinate vs citrate).\n* Timing mineral supplementation relative to training and thermal stress.',
      },
      {
        title: 'Metabolic Hypertrophy Diet: Surplus Calculations Without Adipose Accumulation',
        category: 'Nutrition',
        creator_id: adminUser.id,
        media_url: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=80',
        status: 'APPROVED',
        description: 'Fine-tuning caloric surplus increments (200–350 kcal) to bias nutrient partitioning toward lean skeletal muscle tissue over body fat.\n\nKey Points:\n* Calculating P-Ratio energy partitioning and avoiding dirty bulking.\n* Hypercaloric titration floor of +200-350 kcal/day.\n* 1.8-2.2g/kg protein anchor and insulin sensitivity cycling.',
      },
      {
        title: 'Central Nervous System Deload Architecture: Preventing Neuro-Endocrine Burnout',
        category: 'Recovery',
        creator_id: adminUser.id,
        media_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
        status: 'APPROVED',
        description: 'A structured 7-day protocol reducing systemic volume while maintaining movement motor patterns to restore neuromuscular readiness and endocrine baseline.\n\nKey Points:\n* 50% volume drop with 85% intensity preservation (50/85 rule).\n* Assessing morning resting heart rate and HRV deltas.\n* Non-training day parasympathetic walks and box-breathing down-regulation.',
      },
      {
        title: 'Sleep Architecture & Circadian Pacing for Maximal Growth Hormone Secretion',
        category: 'Recovery',
        creator_id: sarahUser.id,
        media_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
        status: 'APPROVED',
        description: 'Evidence-based environmental and behavioral adjustments to expand Slow Wave Sleep (SWS) and Stage 3/4 REM for tissue regeneration.\n\nKey Points:\n* Core body temperature down-regulation (18°C / 65°F sleep environment).\n* Blue-wavelength attenuation and retinal photobiology.\n* Magnesium L-threonate, apigenin, and L-theanine neurochemical synergy.',
      },
      {
        title: 'Targeted Myofascial Release & Dynamic Floss Band Compression',
        category: 'Recovery',
        creator_id: adminUser.id,
        media_url: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80',
        status: 'APPROVED',
        description: 'Clinical manual therapy routines focusing on joint capsule distraction, tissue shear, and venous flush for knee and shoulder complex longevity.\n\nKey Points:\n* Ischemic compression principles and hyaluronic acid viscosity.\n* Voodoo floss band occlusion timing (max 2 minutes) with reactive hyperemia.\n* Joint capsule mobilization under active distraction.',
      },
    ];

    for (const proto of clinicalProtocols) {
      const exists = await prisma.fitnessContent.findFirst({
        where: { title: proto.title },
      });
      if (!exists) {
        await prisma.fitnessContent.create({ data: proto });
      }
    }
    console.log('  ✅ Seeded and verified all clinical protocols');

    console.log('✨ Auto-seed verification complete. Database ready for production.');
  } catch (err: any) {
    console.error('⚠️ Warning: Auto-seed encountered an issue (non-fatal):', err.message);
  }
}
