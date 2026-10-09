package com.fitpulse.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.service.jdbc.IWorkoutJdbcService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Native Java HttpServlet managing Workout CRUD and Atomic Transactions via JDBC Service layer.
 * Demonstrates:
 * - Direct HttpServlet extension and lifecycle handling.
 * - Real GET, POST, PUT, DELETE HTTP method implementations.
 * - End-to-end execution flow: Request → WorkoutServlet → IWorkoutJdbcService → WorkoutJdbcDao → Database → JSON Response.
 * - Proper HTTP status codes (200, 201, 400, 404, 500) and application/json headers.
 */
@Component
@WebServlet(name = "WorkoutServlet", urlPatterns = {"/servlet/workouts/*", "/api/servlet/workouts/*"})
public class WorkoutServlet extends HttpServlet {

    private final IWorkoutJdbcService workoutJdbcService;
    private final ObjectMapper objectMapper;

    public WorkoutServlet(IWorkoutJdbcService workoutJdbcService) {
        this.workoutJdbcService = workoutJdbcService;
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();
        String userIdParam = req.getParameter("userId");

        try {
            if (pathInfo != null && !pathInfo.equals("/") && !pathInfo.isBlank()) {
                // GET /servlet/workouts/{id}
                Long workoutId = parseIdFromPath(pathInfo);
                Optional<WorkoutLog> logOpt = workoutJdbcService.getWorkoutById(workoutId);

                if (logOpt.isPresent()) {
                    resp.setStatus(HttpServletResponse.SC_OK);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Workout session found via JDBC", logOpt.get()));
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Workout not found with ID: " + workoutId, null));
                }
            } else if (userIdParam != null && !userIdParam.isBlank()) {
                // GET /servlet/workouts?userId={userId}
                Long userId = Long.parseLong(userIdParam.trim());
                List<WorkoutLog> userWorkouts = workoutJdbcService.getWorkoutsByUserId(userId);
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Workouts retrieved for athlete #" + userId, userWorkouts));
            } else {
                // GET /servlet/workouts -> All paginated workouts
                int limit = parseParam(req.getParameter("limit"), 50);
                int offset = parseParam(req.getParameter("offset"), 0);

                List<WorkoutLog> all = workoutJdbcService.getAllWorkouts(limit, offset);
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Workouts retrieved successfully via JDBC", all));
            }
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (NumberFormatException ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Invalid numeric ID format", null));
        }
    }

    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");

        try {
            Map<?, ?> payload = objectMapper.readValue(req.getReader(), Map.class);
            Number userIdNum = (Number) payload.get("userId");
            String workoutTypeStr = (String) payload.get("workoutType");
            Number durationNum = (Number) payload.get("durationMinutes");
            String intensityStr = (String) payload.get("intensity");
            Number caloriesNum = (Number) payload.get("caloriesBurned");
            Number volumeNum = (Number) payload.get("volumeKg");
            String notes = (String) payload.get("notes");
            Number xpAwardNum = (Number) payload.get("xpAward");

            if (userIdNum == null || workoutTypeStr == null || durationNum == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "userId, workoutType, and durationMinutes are required fields", null));
                return;
            }

            Long userId = userIdNum.longValue();
            WorkoutType workoutType = WorkoutType.valueOf(workoutTypeStr.trim().toUpperCase());
            Intensity intensity = intensityStr != null ? Intensity.valueOf(intensityStr.trim().toUpperCase()) : Intensity.MEDIUM;
            int durationMinutes = durationNum.intValue();
            Integer caloriesBurned = caloriesNum != null ? caloriesNum.intValue() : null;
            Double volumeKg = volumeNum != null ? volumeNum.doubleValue() : 0.0;
            int xpAward = xpAwardNum != null ? xpAwardNum.intValue() : 50;

            // Flow: Servlet → Service → JDBC DAO (ACID Transaction) → Database
            WorkoutLog saved = workoutJdbcService.logWorkoutSession(
                    userId,
                    workoutType,
                    durationMinutes,
                    intensity,
                    caloriesBurned,
                    volumeKg,
                    notes,
                    xpAward
            );

            resp.setStatus(HttpServletResponse.SC_CREATED); // 201 Created
            objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Workout session logged and XP awarded via JDBC transaction", saved));
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
            Long workoutId = parseIdFromPath(pathInfo);
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(req.getReader(), Map.class);

            boolean updated = workoutJdbcService.updateWorkout(workoutId, payload);
            if (updated) {
                Optional<WorkoutLog> updatedLog = workoutJdbcService.getWorkoutById(workoutId);
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Workout telemetry updated successfully via JDBC", updatedLog.orElse(null)));
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Workout not found with ID: " + workoutId, null));
            }
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (Exception ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Invalid update payload: " + ex.getMessage(), null));
        }
    }

    @Override
    public void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();

        try {
            Long workoutId = parseIdFromPath(pathInfo);
            boolean deleted = workoutJdbcService.deleteWorkout(workoutId);

            if (deleted) {
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Workout session deleted via JDBC", null));
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Workout record not found or already deleted: " + workoutId, null));
            }
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (NumberFormatException ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Invalid workout ID in request path", null));
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

    private int parseParam(String param, int defaultValue) {
        if (param == null || param.isBlank()) return defaultValue;
        try { return Integer.parseInt(param.trim()); } catch (Exception e) { return defaultValue; }
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
