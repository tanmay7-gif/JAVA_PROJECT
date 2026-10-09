package com.fitpulse.service.jdbc;

import com.fitpulse.jdbc.ChallengeJdbcDao;
import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.TargetMetric;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Concrete implementation of IChallengeJdbcService.
 * Connects the ChallengeServlet with ChallengeJdbcDao and atomic enrollment transactions.
 * Flow: Request → Servlet → ChallengeJdbcService → ChallengeJdbcDao → Database.
 */
@Service
public class ChallengeJdbcService implements IChallengeJdbcService {

    private final ChallengeJdbcDao challengeJdbcDao;

    public ChallengeJdbcService(ChallengeJdbcDao challengeJdbcDao) {
        this.challengeJdbcDao = challengeJdbcDao;
    }

    @Override
    public List<FitnessChallenge> getAllChallenges() throws SQLException {
        return challengeJdbcDao.findAll();
    }

    @Override
    public List<FitnessChallenge> getActiveChallenges() throws SQLException {
        return challengeJdbcDao.findActive();
    }

    @Override
    public Optional<FitnessChallenge> getChallengeById(Long id) throws SQLException {
        return challengeJdbcDao.findById(id);
    }

    @Override
    public FitnessChallenge createChallenge(FitnessChallenge challenge) throws SQLException {
        if (challenge.getTitle() == null || challenge.getTitle().isBlank()) {
            throw new IllegalArgumentException("Challenge title is required");
        }
        if (challenge.getTargetMetric() == null) {
            challenge.setTargetMetric(TargetMetric.CALORIES_BURNED);
        }
        if (challenge.getTargetValue() <= 0) {
            throw new IllegalArgumentException("Target value must be greater than zero");
        }
        if (challenge.getStatus() == null) {
            challenge.setStatus(ChallengeStatus.ACTIVE);
        }
        return challengeJdbcDao.create(challenge);
    }

    @Override
    public boolean updateChallenge(Long challengeId, Map<String, Object> updates) throws SQLException {
        Optional<FitnessChallenge> challengeOpt = challengeJdbcDao.findById(challengeId);
        if (challengeOpt.isEmpty()) {
            return false;
        }

        FitnessChallenge existing = challengeOpt.get();

        if (updates.containsKey("title")) {
            String title = (String) updates.get("title");
            if (title != null && !title.isBlank()) existing.setTitle(title.trim());
        }
        if (updates.containsKey("description")) {
            existing.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("targetMetric")) {
            try {
                existing.setTargetMetric(TargetMetric.valueOf(((String) updates.get("targetMetric")).trim().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (updates.containsKey("targetValue")) {
            Number tv = (Number) updates.get("targetValue");
            if (tv != null) existing.setTargetValue(tv.intValue());
        }
        if (updates.containsKey("rewardXp")) {
            Number rx = (Number) updates.get("rewardXp");
            if (rx != null) existing.setRewardXp(rx.intValue());
        }
        if (updates.containsKey("status")) {
            try {
                existing.setStatus(ChallengeStatus.valueOf(((String) updates.get("status")).trim().toUpperCase()));
            } catch (Exception ignored) {}
        }

        return challengeJdbcDao.update(existing);
    }

    @Override
    public boolean deleteChallenge(Long challengeId) throws SQLException {
        return challengeJdbcDao.delete(challengeId);
    }

    @Override
    public boolean enrollAthleteInChallenge(Long userId, Long challengeId) throws SQLException {
        if (userId == null || challengeId == null) {
            throw new IllegalArgumentException("User ID and Challenge ID are required for enrollment");
        }
        // Executes atomic transaction: check existing -> insert enrollment -> insert audit -> commit/rollback
        return challengeJdbcDao.enrollUserInChallengeWithTransaction(userId, challengeId);
    }
}
