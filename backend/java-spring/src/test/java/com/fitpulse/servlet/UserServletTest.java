package com.fitpulse.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.Role;
import com.fitpulse.service.jdbc.IUserJdbcService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServletTest {

    @Mock
    private IUserJdbcService userJdbcService;

    private UserServlet userServlet;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        userServlet = new UserServlet(userJdbcService);
    }

    @Test
    @DisplayName("GET /servlet/users should return 200 OK and list of users")
    void testDoGet_AllUsers() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setPathInfo("/");
        MockHttpServletResponse response = new MockHttpServletResponse();

        User user1 = new User("Alice", "alice@example.com", "hash", Role.USER, null);
        user1.setId(1L);
        when(userJdbcService.getAllUsers(50, 0)).thenReturn(List.of(user1));

        userServlet.doGet(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Users retrieved successfully via JDBC"));
        assertTrue(response.getContentAsString().contains("Alice"));
        verify(userJdbcService, times(1)).getAllUsers(50, 0);
    }

    @Test
    @DisplayName("GET /servlet/users/1 should return 200 OK and user details")
    void testDoGet_SingleUser_Found() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setPathInfo("/1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        User user = new User("Bob", "bob@example.com", "hash", Role.ADMIN, null);
        user.setId(1L);
        when(userJdbcService.getUserById(1L)).thenReturn(Optional.of(user));

        userServlet.doGet(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Bob"));
        verify(userJdbcService, times(1)).getUserById(1L);
    }

    @Test
    @DisplayName("GET /servlet/users/999 should return 404 Not Found")
    void testDoGet_SingleUser_NotFound() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setPathInfo("/999");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(userJdbcService.getUserById(999L)).thenReturn(Optional.empty());

        userServlet.doGet(request, response);

        assertEquals(404, response.getStatus());
        assertTrue(response.getContentAsString().contains("User not found"));
    }

    @Test
    @DisplayName("POST /servlet/users should return 201 Created and new user")
    void testDoPost_Success() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        Map<String, String> body = Map.of(
                "name", "Charlie",
                "email", "charlie@example.com",
                "password", "secretPass123",
                "role", "USER"
        );
        request.setContent(objectMapper.writeValueAsBytes(body));
        MockHttpServletResponse response = new MockHttpServletResponse();

        User created = new User("Charlie", "charlie@example.com", "hashed", Role.USER, null);
        created.setId(2L);
        when(userJdbcService.registerUser(eq("Charlie"), eq("charlie@example.com"), eq("secretPass123"), eq(Role.USER), isNull()))
                .thenReturn(created);

        userServlet.doPost(request, response);

        assertEquals(201, response.getStatus());
        assertTrue(response.getContentAsString().contains("Athlete account successfully created via JDBC"));
        assertTrue(response.getContentAsString().contains("Charlie"));
    }

    @Test
    @DisplayName("POST /servlet/users with missing fields should return 400 Bad Request")
    void testDoPost_ValidationFailure() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        Map<String, String> body = Map.of("name", "Incomplete");
        request.setContent(objectMapper.writeValueAsBytes(body));
        MockHttpServletResponse response = new MockHttpServletResponse();

        userServlet.doPost(request, response);

        assertEquals(400, response.getStatus());
        assertTrue(response.getContentAsString().contains("required fields"));
        verify(userJdbcService, never()).registerUser(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("PUT /servlet/users/1 should return 200 OK after updating")
    void testDoPut_Success() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("PUT");
        request.setPathInfo("/1");
        Map<String, Object> body = Map.of("name", "Updated Bob");
        request.setContent(objectMapper.writeValueAsBytes(body));
        MockHttpServletResponse response = new MockHttpServletResponse();

        User updatedUser = new User("Updated Bob", "bob@example.com", "hash", Role.ADMIN, null);
        updatedUser.setId(1L);

        when(userJdbcService.updateUser(eq(1L), anyMap())).thenReturn(true);
        when(userJdbcService.getUserById(1L)).thenReturn(Optional.of(updatedUser));

        userServlet.doPut(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("Updated Bob"));
    }

    @Test
    @DisplayName("DELETE /servlet/users/1 should return 200 OK after deletion")
    void testDoDelete_Success() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("DELETE");
        request.setPathInfo("/1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(userJdbcService.deleteUser(1L)).thenReturn(true);

        userServlet.doDelete(request, response);

        assertEquals(200, response.getStatus());
        assertTrue(response.getContentAsString().contains("User successfully deleted via JDBC"));
    }
}
