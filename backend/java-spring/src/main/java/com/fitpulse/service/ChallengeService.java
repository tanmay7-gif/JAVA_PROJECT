package com.fitpulse.service;

import com.fitpulse.dto.ChallengeDtos;
import com.fitpulse.dto.ChallengeDtos.ChallengeCreateRequest;
import com.fitpulse.dto.ChallengeDtos.ChallengeResponse;
import com.fitpulse.dto.ChallengeDtos.ChallengeUpdateRequest;
import com.fitpulse.dto.ChallengeDtos.ChallengeMonitorResponse;
import com.fitpulse.dto.ChallengeDtos.UserChallengeResponse;
import com.fitpulse.exception.BadRequestException;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.model.User;
import com.fitpulse.model.UserChallenge;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.ActivityType;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.repository.FitnessChallengeRepository;
import com.fitpulse.repository.UserChallengeRepository;
import com.fitpulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service implementation for community athletic challenges.
 * Demonstrates:
 * - OOP Interface Implementation (IChallengeService).
 * - Java Collections & Stream API pipelines.
 * - Activity and XP Reward Logging.
 */
@Service
public class ChallengeService implements IChallengeService {

    private final FitnessChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final UserRepository userRepository;
    private final IActivityLogService activityLogService;

    public ChallengeService(FitnessChallengeRepository challengeRepository,
                            UserChallengeRepository userChallengeRepository,
                            UserRepository userRepository,
                            IActivityLogService activityLogService) {
        this.challengeRepository = challengeRepository;
        this.userChallengeRepository = userChallengeRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChallengeResponse> getAvailableChallenges(User currentUser) {
        List<FitnessChallenge> challenges = challengeRepository.findAllByOrderByStartDateDesc();
        Map<Long, UserChallenge> myEnrolled = currentUser != null
                ? userChallengeRepository.findByUser(currentUser).stream()
                    .collect(Collectors.toMap(uc -> uc.getChallenge().getId(), uc -> uc))
                : Collections.emptyMap();

        return challenges.stream().map(c -> {
            ChallengeResponse dto = new ChallengeResponse();
            dto.setId(c.getId());
            dto.setTitle(c.getTitle());
            dto.setDescription(c.getDescription());
            dto.setTargetMetric(c.getTargetMetric());
            dto.setTargetValue(c.getTargetValue());
            dto.setStartDate(c.getStartDate());
            dto.setEndDate(c.getEndDate());
            dto.setRewardBadge(c.getRewardBadge());

            UserChallenge uc = myEnrolled.get(c.getId());
            if (uc != null) {
                dto.setJoined(true);
                dto.setProgressPercent(uc.getProgressPercentage());
            } else {
                dto.setJoined(false);
                dto.setProgressPercent(0);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserChallengeResponse joinChallenge(User user, Long challengeId) {
        FitnessChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found: " + challengeId));

        if (userChallengeRepository.findByUserAndChallenge(user, challenge).isPresent()) {
            throw new BadRequestException("You have already enrolled in this endurance challenge.");
        }

        UserChallenge uc = new UserChallenge(user, challenge);
        UserChallenge saved = userChallengeRepository.save(uc);

        activityLogService.logActivity(user, ActivityType.CHALLENGE_ENROLLED,
                "Enrolled in quest: " + challenge.getTitle(), "CHALLENGE", challenge.getId());

        return mapToUserChallengeResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserChallengeResponse> getMyChallenges(User user, ChallengeStatus status) {
        List<UserChallenge> list = status != null
                ? userChallengeRepository.findByUserAndStatus(user, status)
                : userChallengeRepository.findByUser(user);

        return list.stream().map(this::mapToUserChallengeResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void processWorkoutForChallenges(User user, WorkoutLog workout) {
        List<UserChallenge> active = userChallengeRepository.findByUserAndStatus(user, ChallengeStatus.IN_PROGRESS);

        for (UserChallenge uc : active) {
            FitnessChallenge fc = uc.getChallenge();
            int increment = 0;

            switch (fc.getTargetMetric()) {
                case CALORIES -> increment = workout.getCaloriesBurned();
                case DURATION -> increment = workout.getDurationMinutes();
                case WORKOUT_COUNT -> increment = 1;
            }

            int newProgress = uc.getCurrentProgress() + increment;
            uc.setCurrentProgress(newProgress);

            if (newProgress >= fc.getTargetValue()) {
                uc.setStatus(ChallengeStatus.COMPLETED);
                uc.setCompletedAt(LocalDateTime.now());
                user.addXp(fc.getRewardXp() != null ? fc.getRewardXp() : 250);
                userRepository.save(user);

                activityLogService.logActivity(user, ActivityType.CHALLENGE_COMPLETED,
                        "Successfully conquered challenge: " + fc.getTitle(), "CHALLENGE", fc.getId());
            }

            userChallengeRepository.save(uc);
        }
    }

    @Override
    @Transactional
    public UserChallengeResponse claimReward(User user, Long challengeId) {
        FitnessChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found: " + challengeId));

        UserChallenge uc = userChallengeRepository.findByUserAndChallenge(user, challenge)
                .orElseThrow(() -> new ResourceNotFoundException("Not enrolled in challenge: " + challengeId));

        if (uc.getProgressPercentage() < 100) {
            throw new BadRequestException("Challenge has not reached 100% completion requirement");
        }

        user.addXp(challenge.getRewardXp() != null ? challenge.getRewardXp() : 250);
        userRepository.save(user);

        activityLogService.logActivity(user, ActivityType.CHALLENGE_COMPLETED,
                "Claimed reward for challenge: " + challenge.getTitle(), "CHALLENGE", challengeId);

        return mapToUserChallengeResponse(uc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserChallengeResponse> getUserChallengeHistory(User user) {
        List<UserChallenge> history = userChallengeRepository.findByUser(user);
        return history.stream().map(this::mapToUserChallengeResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChallengeResponse createChallenge(ChallengeCreateRequest request) {
        FitnessChallenge challenge = new FitnessChallenge(
                request.getTitle().trim(),
                request.getDescription(),
                request.getTargetMetric(),
                request.getTargetValue(),
                request.getStartDate(),
                request.getEndDate(),
                null,
                request.getRewardBadge(),
                request.getRewardXp()
        );

        FitnessChallenge saved = challengeRepository.save(challenge);
        activityLogService.logActivity(null, ActivityType.CHALLENGE_CREATED,
                "New endurance challenge launched: " + saved.getTitle(), "CHALLENGE", saved.getId());

        return mapToChallengeResponse(saved, false, 0);
    }

    @Override
    @Transactional
    public ChallengeResponse updateChallenge(Long id, ChallengeUpdateRequest request) {
        FitnessChallenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found: " + id));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            challenge.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            challenge.setDescription(request.getDescription());
        }
        if (request.getTargetMetric() != null) {
            challenge.setTargetMetric(request.getTargetMetric());
        }
        if (request.getTargetValue() != null) {
            challenge.setTargetValue(request.getTargetValue());
        }
        if (request.getStartDate() != null) {
            challenge.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            challenge.setEndDate(request.getEndDate());
        }
        if (request.getRewardBadge() != null) {
            challenge.setRewardBadge(request.getRewardBadge());
        }
        if (request.getRewardXp() != null) {
            challenge.setRewardXp(request.getRewardXp());
        }
        if (request.getStatus() != null) {
            challenge.setStatus(request.getStatus());
        }

        FitnessChallenge saved = challengeRepository.save(challenge);
        activityLogService.logActivity(null, ActivityType.CHALLENGE_UPDATED,
                "Updated parameters for challenge: " + saved.getTitle(), "CHALLENGE", saved.getId());

        return mapToChallengeResponse(saved, false, 0);
    }

    @Override
    @Transactional
    public void deleteChallenge(Long id) {
        FitnessChallenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found: " + id));

        userChallengeRepository.deleteByChallenge(challenge);
        challengeRepository.delete(challenge);

        activityLogService.logActivity(null, ActivityType.CHALLENGE_DELETED,
                "Archived fitness challenge: " + challenge.getTitle(), "CHALLENGE", id);
    }

    @Override
    @Transactional(readOnly = true)
    public ChallengeMonitorResponse monitorChallenge(Long id) {
        FitnessChallenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found: " + id));

        List<UserChallenge> enrollments = userChallengeRepository.findByChallenge(challenge);
        int total = enrollments.size();
        int completed = (int) enrollments.stream().filter(UserChallenge::isCompleted).count();
        int inProgress = total - completed;
        double rate = total > 0 ? Math.round(((double) completed / total) * 100.0 * 10.0) / 10.0 : 0.0;

        List<ChallengeDtos.ParticipantSummary> participantSummaries = enrollments.stream().map(uc -> {
            User u = uc.getUser();
            return new ChallengeDtos.ParticipantSummary(
                    uc.getId(),
                    u.getId(),
                    u.getName(),
                    u.getEmail(),
                    uc.getCurrentProgress(),
                    uc.getProgressPercentage(),
                    uc.getStatus(),
                    uc.getCreatedAt(),
                    uc.getCompletedAt()
            );
        }).collect(Collectors.toList());

        ChallengeMonitorResponse monitor = new ChallengeMonitorResponse();
        monitor.setChallenge(mapToChallengeResponse(challenge, false, 0));
        monitor.setTotalParticipants(total);
        monitor.setCompletedCount(completed);
        monitor.setInProgressCount(inProgress);
        monitor.setCompletionRate(rate);
        monitor.setParticipants(participantSummaries);

        return monitor;
    }

    private ChallengeResponse mapToChallengeResponse(FitnessChallenge c, boolean isJoined, int progressPercent) {
        ChallengeResponse dto = new ChallengeResponse();
        dto.setId(c.getId());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setTargetMetric(c.getTargetMetric());
        dto.setTargetValue(c.getTargetValue());
        dto.setStartDate(c.getStartDate());
        dto.setEndDate(c.getEndDate());
        dto.setRewardBadge(c.getRewardBadge());
        dto.setJoined(isJoined);
        dto.setProgressPercent(progressPercent);
        return dto;
    }

    private UserChallengeResponse mapToUserChallengeResponse(UserChallenge uc) {
        UserChallengeResponse dto = new UserChallengeResponse();
        dto.setId(uc.getId());
        dto.setStatus(uc.getStatus());
        dto.setCurrentProgress(uc.getCurrentProgress());
        dto.setProgressPercentage(uc.getProgressPercentage());
        dto.setCompletedAt(uc.getCompletedAt());

        FitnessChallenge c = uc.getChallenge();
        ChallengeResponse cr = mapToChallengeResponse(c, true, uc.getProgressPercentage());

        dto.setChallenge(cr);
        return dto;
    }
}
