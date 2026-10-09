package com.fitpulse.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitpulse.model.FitnessChallenge;
import com.fitpulse.model.enums.ChallengeStatus;
import com.fitpulse.model.enums.TargetMetric;
import com.fitpulse.service.jdbc.IChallengeJdbcService;
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
public class ChallengeServletTest {

    @Mock
    private IChallengeJdbcService challengeJdbcService;

    private ChallengeServlet challengeServlet;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        challengeServlet = new ChallengeServlet(challengeJdbcService);
    }

    @Test
    @DisplayName("GET /servlet/challenges should return 200 OK and list of all challenges")
    void testDoGet_AllChallenges() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setPathInfo("/");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FitnessChallenge c = new FitnessChallenge("Spring Sprint", "Burn 5000 kcal", TargetMetric.CALORIES_BURNED,
                5000, LocalDateTime.now(), LocalDateTime.now().plusDays(30), null, "SPRINTER", 300, ChallengeStatus.ACTIVE);
        c.setId(1L);

        when(challengeJdbcService.getAllChallenges()).thenReturn(List.of(c));

        challengeServlet.doGet(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("All challenges retrieved via JDBC"));
        assertTrue(response.getContentAsString().contains("Spring Sprint"));
    }

    @Test
    @DisplayName("GET /servlet/challenges/active should return active challenges")
    void testDoGet_ActiveChallenges() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setPathInfo("/active");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FitnessChallenge c = new FitnessChallenge("Active Challenge", "Active desc", TargetMetric.WORKOUT_COUNT,
                10, LocalDateTime.now(), LocalDateTime.now().plusDays(10), null, "ACTIVE", 200, ChallengeStatus.ACTIVE);
        c.setId(2L);

        when(challengeJdbcService.getActiveChallenges()).thenReturn(List.of(c));

        challengeServlet.doGet(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Active challenges retrieved via JDBC"));
        assertTrue(response.getContentAsString().contains("Active Challenge"));
    }

    @Test
    @DisplayName("POST /servlet/challenges should create a new challenge")
    void testDoPost_CreateChallenge() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        Map<String, Object> body = Map.of(
                "title", "Iron Titan",
                "description", "Lift 10,000 kg total volume",
                "targetMetric", "TOTAL_VOLUME_KG",
                "targetValue", 10000,
                "rewardXp", 500
        );
        request.setContent(objectMapper.writeValueAsBytes(body));
        MockHttpServletResponse response = new MockHttpServletResponse();

        FitnessChallenge created = new FitnessChallenge("Iron Titan", "Lift 10,000 kg total volume",
                TargetMetric.TOTAL_VOLUME_KG, 10000, LocalDateTime.now(), LocalDateTime.now().plusDays(30),
                null, "CHALLENGER", 500, ChallengeStatus.ACTIVE);
        created.setId(3L);

        when(challengeJdbcService.createChallenge(any(FitnessChallenge.class))).thenReturn(created);

        challengeServlet.doPost(request, response);

        assertEquals(201, response.getStatus());
        assertTrue(response.getContentAsString().contains("Challenge successfully created via JDBC"));
        assertTrue(response.getContentAsString().contains("Iron Titan"));
    }

    @Test
    @DisplayName("POST /servlet/challenges/1/enroll should enroll athlete via atomic transaction")
    void testDoPost_EnrollAthlete() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        request.setPathInfo("/1/enroll");
        Map<String, Object> body = Map.of("userId", 5);
        request.setContent(objectMapper.writeValueAsBytes(body));
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(challengeJdbcService.enrollAthleteInChallenge(5L, 1L)).thenReturn(true);

        challengeServlet.doPost(request, response);

        assertEquals(201, response.getStatus());
        assertTrue(response.getContentAsString().contains("Athlete successfully enrolled in challenge via JDBC transaction"));
    }

    @Test
    @DisplayName("PUT /servlet/challenges/1 should update challenge parameters")
    void testDoPut_Success() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("PUT");
        request.setPathInfo("/1");
        Map<String, Object> body = Map.of("title", "Updated Iron Titan", "targetValue", 12000);
        request.setContent(objectMapper.writeValueAsBytes(body));
        MockHttpServletResponse response = new MockHttpServletResponse();

        FitnessChallenge updated = new FitnessChallenge("Updated Iron Titan", "Lift 12,000 kg",
                TargetMetric.TOTAL_VOLUME_KG, 12000, LocalDateTime.now(), LocalDateTime.now().plusDays(30),
                null, "CHALLENGER", 500, ChallengeStatus.ACTIVE);
        updated.setId(1L);

        when(challengeJdbcService.updateChallenge(eq(1L), anyMap())).thenReturn(true);
        when(challengeJdbcService.getChallengeById(1L)).thenReturn(Optional.of(updated));

        challengeServlet.doPut(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Challenge updated successfully via JDBC"));
        assertTrue(response.getContentAsString().contains("Updated Iron Titan"));
    }

    @Test
    @DisplayName("DELETE /servlet/challenges/1 should soft-delete challenge")
    void testDoDelete_Success() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("DELETE");
        request.setPathInfo("/1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(challengeJdbcService.deleteChallenge(1L)).thenReturn(true);

        challengeServlet.doDelete(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Challenge deleted successfully via JDBC"));
    }
}
