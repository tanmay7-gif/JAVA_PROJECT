package com.fitpulse.service.jdbc;

import com.fitpulse.model.FitnessChallenge;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service interface for Challenge operations executed through the JDBC layer.
 * Enforces the architectural flow: Request → Servlet → Service → JDBC Repository → Database.
 */
public interface IChallengeJdbcService {

    List<FitnessChallenge> getAllChallenges() throws SQLException;

    List<FitnessChallenge> getActiveChallenges() throws SQLException;

    Optional<FitnessChallenge> getChallengeById(Long id) throws SQLException;

    FitnessChallenge createChallenge(FitnessChallenge challenge) throws SQLException;

    boolean updateChallenge(Long challengeId, Map<String, Object> updates) throws SQLException;

    boolean deleteChallenge(Long challengeId) throws SQLException;

    boolean enrollAthleteInChallenge(Long userId, Long challengeId) throws SQLException;
}
