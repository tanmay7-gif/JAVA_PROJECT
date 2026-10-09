package com.fitpulse.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitpulse.model.User;
import com.fitpulse.model.WorkoutLog;
import com.fitpulse.model.enums.Intensity;
import com.fitpulse.model.enums.Role;
import com.fitpulse.model.enums.WorkoutType;
import com.fitpulse.service.jdbc.IWorkoutJdbcService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkoutServletTest {

    @Mock
    private IWorkoutJdbcService workoutJdbcService;

    private WorkoutServlet workoutServlet;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private User testUser;

    @BeforeEach
    void setUp() {
        workoutServlet = new WorkoutServlet(workoutJdbcService);
        testUser = new User("Athlete One", "athlete@fitpulse.com", "hash", Role.USER, null);
        testUser.setId(10L);
    }

    @Test
    @DisplayName("GET /servlet/workouts should return 200 OK and list of workouts")
    void testDoGet_AllWorkouts() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setPathInfo("/");
        MockHttpServletResponse response = new MockHttpServletResponse();

        WorkoutLog log = new WorkoutLog(testUser, WorkoutType.STRENGTH, 45, Intensity.HIGH, 420, 1500.0, LocalDateTime.now(), "Leg day");
        log.setId(101L);

        when(workoutJdbcService.getAllWorkouts(50, 0)).thenReturn(List.of(log));

        workoutServlet.doGet(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Workouts retrieved successfully via JDBC"));
        assertTrue(response.getContentAsString().contains("STRENGTH"));
    }

    @Test
    @DisplayName("GET /servlet/workouts?userId=10 should return user specific workouts")
    void testDoGet_ByUserId() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setParameter("userId", "10");
        MockHttpServletResponse response = new MockHttpServletResponse();

        WorkoutLog log = new WorkoutLog(testUser, WorkoutType.CARDIO, 30, Intensity.MEDIUM, 300, 0.0, LocalDateTime.now(), "Morning run");
        log.setId(102L);

        when(workoutJdbcService.getWorkoutsByUserId(10L)).thenReturn(List.of(log));

        workoutServlet.doGet(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Workouts retrieved for athlete #10"));
        assertTrue(response.getContentAsString().contains("CARDIO"));
    }

    @Test
    @DisplayName("POST /servlet/workouts should log workout and award XP via JDBC transaction")
    void testDoPost_Success() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        Map<String, Object> body = Map.of(
                "userId", 10,
                "workoutType", "HIIT",
                "durationMinutes", 40,
                "intensity", "HIGH",
                "caloriesBurned", 500,
                "volumeKg", 0.0,
                "notes", "Tabata protocol"
        );
        request.setContent(objectMapper.writeValueAsBytes(body));
        MockHttpServletResponse response = new MockHttpServletResponse();

        WorkoutLog saved = new WorkoutLog(testUser, WorkoutType.HIIT, 40, Intensity.HIGH, 500, 0.0, LocalDateTime.now(), "Tabata protocol");
        saved.setId(103L);

        when(workoutJdbcService.logWorkoutSession(eq(10L), eq(WorkoutType.HIIT), eq(40), eq(Intensity.HIGH), eq(500), eq(0.0), eq("Tabata protocol"), anyInt()))
                .thenReturn(saved);

        workoutServlet.doPost(request, response);

        assertEquals(201, response.getStatus());
        assertTrue(response.getContentAsString().contains("Workout session logged and XP awarded via JDBC transaction"));
        assertTrue(response.getContentAsString().contains("HIIT"));
    }

    @Test
    @DisplayName("POST /servlet/workouts with missing required fields should return 400 Bad Request")
    void testDoPost_MissingFields() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        Map<String, Object> body = Map.of("userId", 10);
        request.setContent(objectMapper.writeValueAsBytes(body));
        MockHttpServletResponse response = new MockHttpServletResponse();

        workoutServlet.doPost(request, response);

        assertEquals(400, response.getStatus());
        assertTrue(response.getContentAsString().contains("required fields"));
    }

    @Test
    @DisplayName("PUT /servlet/workouts/101 should update workout telemetry")
    void testDoPut_Success() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("PUT");
        request.setPathInfo("/101");
        Map<String, Object> body = Map.of("durationMinutes", 55, "notes", "Updated workout duration");
        request.setContent(objectMapper.writeValueAsBytes(body));
        MockHttpServletResponse response = new MockHttpServletResponse();

        WorkoutLog updated = new WorkoutLog(testUser, WorkoutType.STRENGTH, 55, Intensity.HIGH, 500, 1600.0, LocalDateTime.now(), "Updated workout duration");
        updated.setId(101L);

        when(workoutJdbcService.updateWorkout(eq(101L), anyMap())).thenReturn(true);
        when(workoutJdbcService.getWorkoutById(101L)).thenReturn(Optional.of(updated));

        workoutServlet.doPut(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Workout telemetry updated successfully via JDBC"));
        assertTrue(response.getContentAsString().contains("Updated workout duration"));
    }

    @Test
    @DisplayName("DELETE /servlet/workouts/101 should delete workout record")
    void testDoDelete_Success() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("DELETE");
        request.setPathInfo("/101");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(workoutJdbcService.deleteWorkout(101L)).thenReturn(true);

        workoutServlet.doDelete(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Workout session deleted via JDBC"));
    }
}
