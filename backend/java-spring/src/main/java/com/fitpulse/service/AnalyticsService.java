package com.fitpulse.service;

import com.fitpulse.dto.WorkoutDtos.AnalyticsSummaryDto;
import com.fitpulse.dto.WorkoutDtos.ChallengeProgressSummaryDto;
import com.fitpulse.dto.WorkoutDtos.DailyTrendPoint;
import com.fitpulse.dto.WorkoutDtos.DisciplineDistributionDto;
import com.fitpulse.dto.WorkoutDtos.GoalProgressSummaryDto;
import com.fitpulse.model.Goal;
import com.fitpulse.model.User;
import com.fitpulse.model.UserChallenge;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.GoalStatus;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.repository.GoalRepository;
import com.fitpulse.repository.UserChallengeRepository;
import com.fitpulse.repository.WorkoutLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation for biometric telemetry calculations and analytics.
 * Implements IAnalyticsService.
 * Calculates REAL metrics purely from database entities:
 * - Total workouts, duration, calories burned
 * - Weekly & Monthly activity aggregation
 * - Dynamic Goal Progress tracking
 * - Dynamic Challenge Progress tracking
 * - Zero hardcoded or fake statistics
 */
@Service
public class AnalyticsService implements IAnalyticsService {

    private final WorkoutLogRepository workoutLogRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final GoalRepository goalRepository;

    public AnalyticsService(WorkoutLogRepository workoutLogRepository,
                            UserChallengeRepository userChallengeRepository,
                            GoalRepository goalRepository) {
        this.workoutLogRepository = workoutLogRepository;
        this.userChallengeRepository = userChallengeRepository;
        this.goalRepository = goalRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummaryDto getAnalyticsForUser(User user) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        AnalyticsSummaryDto dto = new AnalyticsSummaryDto();

        // 1. Weekly Activity Metrics (Calculated from database logs)
        int weeklyMinutes = workoutLogRepository.sumDurationSince(user, sevenDaysAgo);
        int weeklyCalories = workoutLogRepository.sumCaloriesSince(user, sevenDaysAgo);
        long weeklyCount = workoutLogRepository.countByUserAndLoggedAtSince(user, sevenDaysAgo);

        dto.setWeeklyWorkoutHours(Math.round((weeklyMinutes / 60.0) * 10.0) / 10.0);
        dto.setWeeklyCaloriesBurned(weeklyCalories);
        dto.setWeeklyWorkoutsCount((int) weeklyCount);

        // 2. Monthly Activity Metrics (Calculated from database logs in last 30 days)
        int monthlyMinutes = workoutLogRepository.sumDurationSince(user, thirtyDaysAgo);
        int monthlyCalories = workoutLogRepository.sumCaloriesSince(user, thirtyDaysAgo);
        long monthlyCount = workoutLogRepository.countByUserAndLoggedAtSince(user, thirtyDaysAgo);

        dto.setMonthlyWorkoutHours(Math.round((monthlyMinutes / 60.0) * 10.0) / 10.0);
        dto.setMonthlyCaloriesBurned(monthlyCalories);
        dto.setMonthlyWorkoutsCount((int) monthlyCount);

        // 3. Lifetime Totals (Real aggregates from database)
        long totalWorkouts = workoutLogRepository.countByUser(user);
        int totalMinutes = workoutLogRepository.sumTotalDuration(user);
        int totalCalories = workoutLogRepository.sumTotalCalories(user);

        dto.setTotalLifetimeWorkouts(totalWorkouts);
        dto.setTotalLifetimeHours(Math.round((totalMinutes / 60.0) * 10.0) / 10.0);
        dto.setTotalLifetimeCalories(totalCalories);

        // 4. Real Goal Progress Aggregation
        List<Goal> userGoals = goalRepository.findByUserOrderByCreatedAtDesc(user);
        int totalGoals = userGoals.size();
        int activeGoals = (int) userGoals.stream().filter(g -> g.getStatus() == GoalStatus.IN_PROGRESS).count();
        int completedGoals = (int) userGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
        double avgGoalPct = totalGoals > 0
                ? userGoals.stream().mapToDouble(Goal::getCompletionPercentage).average().orElse(0.0)
                : 0.0;
        avgGoalPct = Math.round(avgGoalPct * 10.0) / 10.0;

        dto.setGoalProgress(new GoalProgressSummaryDto(totalGoals, activeGoals, completedGoals, avgGoalPct));

        // 5. Real Challenge Progress Aggregation
        List<UserChallenge> userChallenges = userChallengeRepository.findByUser(user);
        int enrolledChallenges = userChallenges.size();
        int activeChallenges = (int) userChallenges.stream().filter(uc -> uc.getStatus() == ChallengeStatus.IN_PROGRESS).count();
        int completedChallenges = (int) userChallenges.stream().filter(uc -> uc.getStatus() == ChallengeStatus.COMPLETED).count();
        double challengeCompletionRate = enrolledChallenges > 0
                ? Math.round(((double) completedChallenges / enrolledChallenges) * 100.0 * 10.0) / 10.0
                : 0.0;

        dto.setActiveChallengesCount(activeChallenges);
        dto.setChallengeProgress(new ChallengeProgressSummaryDto(enrolledChallenges, activeChallenges, completedChallenges, challengeCompletionRate));

        // 6. Real Daily Trend Points (Rolling 7 Days from database)
        List<WorkoutLog> recentLogs = workoutLogRepository.findByUserAndLoggedAtBetweenOrderByLoggedAtAsc(
                user, sevenDaysAgo, now
        );

        Map<LocalDate, Integer> caloriesByDay = new HashMap<>();
        Map<LocalDate, Integer> durationByDay = new HashMap<>();

        for (WorkoutLog log : recentLogs) {
            LocalDate date = log.getLoggedAt().toLocalDate();
            caloriesByDay.merge(date, log.getCaloriesBurned(), Integer::sum);
            durationByDay.merge(date, log.getDurationMinutes(), Integer::sum);
        }

        List<DailyTrendPoint> trends = new ArrayList<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dayName = date.format(dayFormatter);
            int cal = caloriesByDay.getOrDefault(date, 0);
            int dur = durationByDay.getOrDefault(date, 0);
            trends.add(new DailyTrendPoint(dayName, date.toString(), cal, dur));
        }
        dto.setDailyTrend(trends);
        dto.setDailyTrends(trends);

        // 7. Discipline Distribution (Grouped purely from user's actual workouts)
        List<WorkoutLog> allUserLogs = workoutLogRepository.findByUser(user);
        List<DisciplineDistributionDto> disciplines = new ArrayList<>();

        if (!allUserLogs.isEmpty()) {
            Map<WorkoutType, Long> countsByType = allUserLogs.stream()
                    .collect(Collectors.groupingBy(WorkoutLog::getWorkoutType, Collectors.counting()));
            long totalLogged = allUserLogs.size();

            for (Map.Entry<WorkoutType, Long> entry : countsByType.entrySet()) {
                double pct = Math.round(((double) entry.getValue() / totalLogged) * 100.0 * 10.0) / 10.0;
                disciplines.add(new DisciplineDistributionDto(entry.getKey().name(), entry.getValue().intValue(), pct));
            }
        }
        // When zero workouts exist, return pure empty list — ZERO fake/hardcoded data!

        dto.setTypeBreakdown(disciplines);
        dto.setDisciplineDistribution(disciplines);

        return dto;
    }
}
