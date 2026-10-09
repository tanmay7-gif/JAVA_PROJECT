package com.fitpulse.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.Role;
import com.fitpulse.service.jdbc.IUserJdbcService;
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
 * Native Java HttpServlet managing User CRUD operations via JDBC Service layer.
 * Demonstrates:
 * - Direct HttpServlet extension and lifecycle handling.
 * - Real GET, POST, PUT, DELETE HTTP method implementations.
 * - End-to-end execution flow: Request → Servlet → Service → JDBC/Repository → Database → Response.
 * - Proper HTTP status codes (200, 201, 400, 404, 500) and application/json headers.
 */
@Component
@WebServlet(name = "UserServlet", urlPatterns = {"/servlet/users/*", "/api/servlet/users/*"})
public class UserServlet extends HttpServlet {

    private final IUserJdbcService userJdbcService;
    private final ObjectMapper objectMapper;

    public UserServlet(IUserJdbcService userJdbcService) {
        this.userJdbcService = userJdbcService;
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();

        try {
            if (pathInfo == null || pathInfo.equals("/") || pathInfo.isBlank()) {
                // GET /servlet/users -> List all users
                int limit = parseParam(req.getParameter("limit"), 50);
                int offset = parseParam(req.getParameter("offset"), 0);

                List<User> users = userJdbcService.getAllUsers(limit, offset);
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Users retrieved successfully via JDBC", users));
            } else {
                // GET /servlet/users/{id} -> Single user detail
                Long userId = parseIdFromPath(pathInfo);
                Optional<User> userOpt = userJdbcService.getUserById(userId);

                if (userOpt.isPresent()) {
                    resp.setStatus(HttpServletResponse.SC_OK);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "User found via JDBC", userOpt.get()));
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "User not found with ID: " + userId, null));
                }
            }
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (NumberFormatException ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Invalid numeric user ID in request path", null));
        }
    }

    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");

        try {
            Map<?, ?> rawPayload = objectMapper.readValue(req.getReader(), Map.class);
            String name = (String) rawPayload.get("name");
            String email = (String) rawPayload.get("email");
            String rawPassword = (String) rawPayload.get("password");
            String roleStr = (String) rawPayload.get("role");
            String avatarUrl = (String) rawPayload.get("avatarUrl");

            if (name == null || name.isBlank() || email == null || email.isBlank() || rawPassword == null || rawPassword.isBlank()) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Name, email, and password are required fields", null));
                return;
            }

            Role role = Role.USER;
            if (roleStr != null) {
                try {
                    role = Role.valueOf(roleStr.trim().toUpperCase());
                } catch (IllegalArgumentException ignored) {}
            }

            User created = userJdbcService.registerUser(name, email, rawPassword, role, avatarUrl);

            resp.setStatus(HttpServletResponse.SC_CREATED); // 201 Created
            objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "Athlete account successfully created via JDBC", created));
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
            Long userId = parseIdFromPath(pathInfo);
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(req.getReader(), Map.class);

            boolean updated = userJdbcService.updateUser(userId, payload);
            if (updated) {
                Optional<User> updatedUser = userJdbcService.getUserById(userId);
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "User updated successfully via JDBC", updatedUser.orElse(null)));
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "User not found with ID: " + userId, null));
            }
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (NumberFormatException ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Invalid user ID format in path", null));
        }
    }

    @Override
    public void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();

        try {
            Long userId = parseIdFromPath(pathInfo);
            boolean deleted = userJdbcService.deleteUser(userId);

            if (deleted) {
                resp.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(true, "User successfully deleted via JDBC", null));
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "User not found or already deleted: " + userId, null));
            }
        } catch (SQLException ex) {
            handleSqlException(resp, ex);
        } catch (NumberFormatException ex) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            objectMapper.writeValue(resp.getWriter(), wrapResponse(false, "Invalid user ID in request path", null));
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
