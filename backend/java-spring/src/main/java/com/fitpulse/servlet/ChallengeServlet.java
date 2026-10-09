package com.fitpulse.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.TargetMetric;
import com.fitpulse.service.jdbc.IChallengeJdbcService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Native Java HttpServlet managing Challenge CRUD and Atomic Enrollment Transactions via JDBC Service layer.
 * Demonstrates:
 * - Direct HttpServlet extension and lifecycle handling.
 * - Real GET, POST, PUT, DELETE HTTP method implementations.
 * - End-to-end execution flow: Request → ChallengeServlet → IChallengeJdbcService → ChallengeJdbcDao → Database → JSON Response.
 * - Proper HTTP status codes (200, 201, 400, 404, 500) and application/json headers.
 */
@Component
@WebServlet(name = "ChallengeServlet", urlPatterns = {"/servlet/challenges/*", "/api/servlet/challenges/*"})
public class ChallengeServlet extends HttpServlet {

    private final IChallengeJdbcService challengeJdbcService;
    private final ObjectMapper objectMapper;

    public ChallengeServlet(IChallengeJdbcService challengeJdbcService) {
        this.challengeJdbcService = challengeJdbcService;
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();
        String activeParam = req.getParameter("active");

        try {
            if (pathInfo != null && !pathInfo.equals("/") && !pathInfo.isBlank()) {
                String cleanPath = pathInfo.startsWith("/") ? pathInfo.substring(1) : pathInfo;

                if ("active".equalsIgnoreCase(cleanPath)) {
                    // GET /servlet/challenges/active
                    List<FitnessChallenge> active = challengeJdbcService.getActiveChallenges();
                    resp.setStatus(HttpServletResponse.SC_OK);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Active challenges retrieved via JDBC", active));
                    return;
                }

                // GET /servlet/challenges/{id}
                Long challengeId = parseIdFromPath(pathInfo);
                Optional<FitnessChallenge> challengeOpt = challengeJdbcService.getChallengeById(challengeId);

                if (challengeOpt.isPresent()) {
                    resp.setStatus(HttpServletResponse.SC_OK);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Challenge found via JDBC", challengeOpt.get()));
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Challenge not found with ID: " + challengeId, null));
                }
            } else if ("true".equalsIgnoreCase(activeParam)) {
                // GET /servlet/challenges?active=true
                List<FitnessChallenge> active = challengeJdbcService.getActiveChallenges();
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Active challenges retrieved via JDBC", active));
            } else {
                // GET /servlet/challenges -> All challenges
                List<FitnessChallenge> all = challengeJdbcService.getAllChallenges();
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "All challenges retrieved via JDBC", all));
            }
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (NumberFormatException ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Invalid numeric challenge ID in request path", null));
        }
    }

    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(req.getReader(), Map.class);

            // Enrollment Endpoint: POST /servlet/challenges/{id}/enroll OR payload contains action="ENROLL"
            boolean isEnrollPath = pathInfo != null && (pathInfo.endsWith("/enroll") || pathInfo.endsWith("/enroll/"));
            String action = (String) payload.get("action");

            if (isEnrollPath || "ENROLL".equalsIgnoreCase(action)) {
                Long challengeId;
                if (isEnrollPath) {
                    challengeId = parseIdFromPath(pathInfo);
                } else {
                    Number cId = (Number) payload.get("challengeId");
                    if (cId == null) {
                        resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "challengeId is required for enrollment", null));
                        return;
                    }
                    challengeId = cId.longValue();
                }

                Number userIdNum = (Number) payload.get("userId");
                if (userIdNum == null) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "userId is required for challenge enrollment", null));
                    return;
                }

                // Executes atomic transaction: check existing -> insert enrollment -> insert audit -> commit/rollback
                boolean enrolled = challengeJdbcService.enrollAthleteInChallenge(userIdNum.longValue(), challengeId);

                if (enrolled) {
                    resp.setStatus(HttpServletResponse.SC_CREATED);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Athlete successfully enrolled in challenge via JDBC transaction", null));
                } else {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Athlete is already enrolled in challenge #" + challengeId, null));
                }
                return;
            }

            // Create Challenge Endpoint: POST /servlet/challenges
            String title = (String) payload.get("title");
            String description = (String) payload.get("description");
            String targetMetricStr = (String) payload.get("targetMetric");
            Number targetValueNum = (Number) payload.get("targetValue");
            Number rewardXpNum = (Number) payload.get("rewardXp");
            String badgeIconUrl = (String) payload.get("badgeIconUrl");
            String rewardBadge = (String) payload.get("rewardBadge");
            String statusStr = (String) payload.get("status");

            if (title == null || title.isBlank() || targetValueNum == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "title and targetValue are required fields", null));
                return;
            }

            TargetMetric metric = TargetMetric.CALORIES_BURNED;
            if (targetMetricStr != null) {
                try {
                    metric = TargetMetric.valueOf(targetMetricStr.trim().toUpperCase());
                } catch (IllegalArgumentException ignored) {}
            }

            ChallengeStatus status = ChallengeStatus.ACTIVE;
            if (statusStr != null) {
                try {
                    status = ChallengeStatus.valueOf(statusStr.trim().toUpperCase());
                } catch (IllegalArgumentException ignored) {}
            }

            LocalDateTime now = LocalDateTime.now();
            FitnessChallenge challenge = new FitnessChallenge(
                    title.trim(),
                    description,
                    metric,
                    targetValueNum.intValue(),
                    now,
                    now.plusDays(30),
                    badgeIconUrl != null ? badgeIconUrl : "/badges/default.png",
                    rewardBadge != null ? rewardBadge : "CHALLENGER",
                    rewardXpNum != null ? rewardXpNum.intValue() : 250,
                    status
            );

            FitnessChallenge created = challengeJdbcService.createChallenge(challenge);
            resp.setStatus(HttpServletResponse.SC_CREATED); // 201 Created
            objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Challenge successfully created via JDBC", created));
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (IllegalArgumentException ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, ex.getMessage(), null));
        }
    }

    @Override
    public void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();

        try {
            Long challengeId = parseIdFromPath(pathInfo);
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(req.getReader(), Map.class);

            boolean updated = challengeJdbcService.updateChallenge(challengeId, payload);
            if (updated) {
                Optional<FitnessChallenge> updatedChallenge = challengeJdbcService.getChallengeById(challengeId);
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Challenge updated successfully via JDBC", updatedChallenge.orElse(null)));
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Challenge not found with ID: " + challengeId, null));
            }
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (NumberFormatException ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Invalid challenge ID in request path", null));
        }
    }

    @Override
    public void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();

        try {
            Long challengeId = parseIdFromPath(pathInfo);
            boolean deleted = challengeJdbcService.deleteChallenge(challengeId);

            if (deleted) {
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Challenge deleted successfully via JDBC", null));
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Challenge not found or already deleted: " + challengeId, null));
            }
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (NumberFormatException ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Invalid challenge ID in request path", null));
        }
    }

    private Long parseIdFromPath(String pathInfo) {
        if (pathInfo == null || pathInfo.equals("/")) {
            throw new NumberFormatException("Empty ID");
        }
        String clean = pathInfo.startsWith("/") ? pathInfo.substring(1) : pathInfo;
        if (clean.contains("/")) {
            clean = clean.substring(0, clean.indexOf("/"));
        }
        return Long.parseLong(clean);
    }

    private Map<String, Object> wrapResponse(boolean success, String message, Object data) {
        Map<String, Object> map = new HashMap<>();
        map.put("success", success);
        map.put("message", message);
        map.put("data", data);
        map.put("timestamp", java.time.LocalDateTime.now().toString());
        return map;
    }

    private void handleSqlException(HttpServletResponse resp, SQLException ex) throws IOException {
        resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        Map<String, Object> error = wrapResponse(false, "Database SQL error: " + ex.getMessage(), null);
        error.put("sqlState", ex.getSQLState());
        error.put("errorCode", ex.getErrorCode());
        objectMapper.writeValue(resp.getWriter(), error);
    }
}
