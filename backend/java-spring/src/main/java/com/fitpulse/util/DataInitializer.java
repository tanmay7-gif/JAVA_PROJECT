package com.fitpulse.util;

import com.fitpulse.model.*;
import com.fitpulse.model.enums.*;
import com.fitpulse.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Initializes demonstrative seed data for the FitPulse Enterprise platform on cold boot.
 * Populates Users, Workouts, Goals, Challenges, Content, and Activity Audit Logs.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final GoalRepository goalRepository;
    private final FitnessChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final FitnessContentRepository contentRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           WorkoutLogRepository workoutLogRepository,
                           GoalRepository goalRepository,
                           FitnessChallengeRepository challengeRepository,
                           UserChallengeRepository userChallengeRepository,
                           FitnessContentRepository contentRepository,
                           SystemSettingRepository systemSettingRepository,
                           ActivityLogRepository activityLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.goalRepository = goalRepository;
        this.challengeRepository = challengeRepository;
        this.userChallengeRepository = userChallengeRepository;
        this.contentRepository = contentRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        System.out.println(">>> Initializing FitPulse Enterprise Demo Data (Clinical Health OS)...");

        // 1. Create Users
        User admin = userRepository.save(new User(
                "System Administrator",
                "admin@fitpulse.com",
                passwordEncoder.encode("Admin123!"),
                Role.ADMIN,
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        ));

        User sarah = userRepository.save(new User(
                "Sarah Connor",
                "sarah@fitpulse.com",
                passwordEncoder.encode("User123!"),
                Role.USER,
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        ));
        sarah.setTotalXp(1450);
        userRepository.save(sarah);

        // 2. Create Workout Logs for Sarah
        LocalDateTime now = LocalDateTime.now();
        WorkoutLog w1 = workoutLogRepository.save(new WorkoutLog(sarah, WorkoutType.STRENGTH, 60, Intensity.HIGH, 620, now.minusDays(5), "Heavy PPL - Flat Barbell Bench 105kg & DB Incline"));
        WorkoutLog w2 = workoutLogRepository.save(new WorkoutLog(sarah, WorkoutType.CARDIO, 45, Intensity.MEDIUM, 480, now.minusDays(4), "Zone 2 aerobic base pacing on Concept2 Ergometer"));
        WorkoutLog w3 = workoutLogRepository.save(new WorkoutLog(sarah, WorkoutType.HIIT, 30, Intensity.HIGH, 410, now.minusDays(3), "Tabata sprints with assault bike intervals"));
        WorkoutLog w4 = workoutLogRepository.save(new WorkoutLog(sarah, WorkoutType.STRENGTH, 75, Intensity.HIGH, 750, now.minusDays(2), "Back & Posterior Chain - Deadlifts 160kg, Weighted Pull-ups"));
        WorkoutLog w5 = workoutLogRepository.save(new WorkoutLog(sarah, WorkoutType.YOGA, 40, Intensity.LOW, 210, now.minusDays(1), "Deep myofascial recovery and hip mobility flow"));
        WorkoutLog w6 = workoutLogRepository.save(new WorkoutLog(sarah, WorkoutType.RUNNING, 50, Intensity.MEDIUM, 540, now, "Tempo threshold 10km run on outdoor track"));

        // 3. Create Personal Fitness Goals
        Goal g1 = new Goal(sarah, "March Metabolic Calorie Burn", "Surpass 10,000 active burned calories in March",
                GoalType.CALORIE_BURN, 10000.0, now.plusDays(20));
        g1.setCurrentValue(3010.0);
        goalRepository.save(g1);

        Goal g2 = new Goal(sarah, "Consistency King: 15 Sessions", "Log at least 15 separate workouts this month",
                GoalType.WORKOUT_COUNT, 15.0, now.plusDays(15));
        g2.setCurrentValue(6.0);
        goalRepository.save(g2);

        Goal g3 = new Goal(sarah, "Aerobic Endurance: 600 Mins", "Achieve 600 total minutes of active conditioning",
                GoalType.DURATION_MINUTES, 600.0, now.plusDays(25));
        g3.setCurrentValue(300.0);
        goalRepository.save(g3);

        // 4. Create Fitness Challenges
        FitnessChallenge c1 = challengeRepository.save(new FitnessChallenge(
                "5000 kcal Metabolic Burn",
                "Burn cumulative 5,000 active kilocalories across any high-intensity conditioning sessions.",
                TargetMetric.CALORIES,
                5000,
                now.minusDays(7),
                now.plusDays(21),
                "https://cdn-icons-png.flaticon.com/512/785/785116.png",
                "Metabolic Inferno",
                500
        ));

        FitnessChallenge c2 = challengeRepository.save(new FitnessChallenge(
                "Century Conditioning Split",
                "Log 180 total minutes of high-cadence cycling or rowing endurance.",
                TargetMetric.DURATION,
                180,
                now.minusDays(3),
                now.plusDays(25),
                "https://cdn-icons-png.flaticon.com/512/3074/3074058.png",
                "Century Velocity",
                300
        ));

        FitnessChallenge c3 = challengeRepository.save(new FitnessChallenge(
                "14-Day Consistency Master",
                "Complete at least 10 logged sessions over a 14-day rolling training cycle.",
                TargetMetric.WORKOUT_COUNT,
                10,
                now.minusDays(10),
                now.plusDays(4),
                "https://cdn-icons-png.flaticon.com/512/2583/2583344.png",
                "Titanium Athlete",
                450
        ));

        // 5. Enroll Sarah into Challenges
        UserChallenge uc1 = new UserChallenge(sarah, c1);
        uc1.setCurrentProgress(3010);
        userChallengeRepository.save(uc1);

        UserChallenge uc2 = new UserChallenge(sarah, c2);
        uc2.setCurrentProgress(180);
        uc2.setStatus(ChallengeStatus.COMPLETED);
        uc2.setCompletedAt(now.minusDays(1));
        userChallengeRepository.save(uc2);

        // 6. Community Content Guides
        contentRepository.save(new FitnessContent(
                admin,
                "Science-Backed 4-Day Conditioning Split",
                "A balanced high-frequency split combining heavy compound lifting with Zone 2 aerobic pacing for maximal VO2 max improvements.",
                "Strength & Hypertrophy",
                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
                ContentStatus.APPROVED
        ));

        contentRepository.save(new FitnessContent(
                sarah,
                "Post-Session Glycogen & Hydration Recovery",
                "Optimal sodium-potassium ratios and rapid-digesting carbohydrate timing following 90-minute depletion sessions.",
                "Nutrition & Telemetry",
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
                ContentStatus.APPROVED
        ));

        // 7. System Settings
        systemSettingRepository.save(new SystemSetting("platform.maintenance_mode", "false", "Global maintenance flag"));
        systemSettingRepository.save(new SystemSetting("platform.require_email_verification", "true", "Enforce email confirmation"));
        systemSettingRepository.save(new SystemSetting("telemetry.met_formula_calibration", "3.5_ml_o2_kg_min", "Standard VO2 basal coefficient"));

        // 8. Activity Audit Logs
        activityLogRepository.save(ActivityLog.of(admin.getId(), admin.getEmail(), ActivityType.USER_REGISTERED,
                "Administrator bootstrapped during initialization", "USER", admin.getId(), "127.0.0.1"));
        activityLogRepository.save(ActivityLog.of(sarah.getId(), sarah.getEmail(), ActivityType.USER_REGISTERED,
                "Athlete Sarah Connor joined platform", "USER", sarah.getId(), "127.0.0.1"));
        activityLogRepository.save(ActivityLog.of(sarah.getId(), sarah.getEmail(), ActivityType.WORKOUT_LOGGED,
                "Logged Strength session (60 mins, 620 kcal)", "WORKOUT", w1.getId(), "127.0.0.1"));
        activityLogRepository.save(ActivityLog.of(sarah.getId(), sarah.getEmail(), ActivityType.CHALLENGE_ENROLLED,
                "Enrolled in 5000 kcal Metabolic Burn", "CHALLENGE", c1.getId(), "127.0.0.1"));
        activityLogRepository.save(ActivityLog.of(sarah.getId(), sarah.getEmail(), ActivityType.GOAL_CREATED,
                "Created goal: March Metabolic Calorie Burn", "GOAL", g1.getId(), "127.0.0.1"));

        System.out.println(">>> FitPulse Enterprise Seed Data Complete: Admin (admin@fitpulse.com), Athlete (sarah@fitpulse.com) with Workouts, Goals, Challenges, & Audit Trails.");
    }
}
