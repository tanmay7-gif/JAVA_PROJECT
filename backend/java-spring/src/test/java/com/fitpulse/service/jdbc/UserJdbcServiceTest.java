package com.fitpulse.service.jdbc;

import com.fitpulse.jdbc.UserJdbcDao;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserJdbcServiceTest {

    @Mock
    private UserJdbcDao userJdbcDao;

    @InjectMocks
    private UserJdbcService userJdbcService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("John Doe", "john@example.com", "encodedPassword", Role.USER, null);
        sampleUser.setId(1L);
    }

    @Test
    @DisplayName("getAllUsers should delegate to userJdbcDao.findAll")
    void testGetAllUsers() throws SQLException {
        when(userJdbcDao.findAll(10, 0)).thenReturn(List.of(sampleUser));

        List<User> result = userJdbcService.getAllUsers(10, 0);

        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getName());
        verify(userJdbcDao).findAll(10, 0);
    }

    @Test
    @DisplayName("getUserById should delegate to userJdbcDao.findById")
    void testGetUserById() throws SQLException {
        when(userJdbcDao.findById(1L)).thenReturn(Optional.of(sampleUser));

        Optional<User> result = userJdbcService.getUserById(1L);

        assertTrue(result.isPresent());
        assertEquals("john@example.com", result.get().getEmail());
        verify(userJdbcDao).findById(1L);
    }

    @Test
    @DisplayName("registerUser should validate input, encode password, and call userJdbcDao.create")
    void testRegisterUser_Success() throws SQLException {
        when(userJdbcDao.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(userJdbcDao.create(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(2L);
            return u;
        });

        User created = userJdbcService.registerUser("New Athlete", "new@example.com", "secure123", Role.USER, "avatar.jpg");

        assertNotNull(created);
        assertEquals(2L, created.getId());
        assertEquals("new@example.com", created.getEmail());
        assertNotEquals("secure123", created.getPasswordHash()); // Ensure hashed
        verify(userJdbcDao).create(any(User.class));
    }

    @Test
    @DisplayName("registerUser with duplicate email should throw IllegalArgumentException")
    void testRegisterUser_DuplicateEmail() throws SQLException {
        when(userJdbcDao.findByEmail("existing@example.com")).thenReturn(Optional.of(sampleUser));

        assertThrows(IllegalArgumentException.class, () ->
                userJdbcService.registerUser("Existing", "existing@example.com", "password", Role.USER, null));

        verify(userJdbcDao, never()).create(any(User.class));
    }

    @Test
    @DisplayName("updateUser should update fields and delegate to userJdbcDao.update")
    void testUpdateUser_Success() throws SQLException {
        when(userJdbcDao.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userJdbcDao.update(any(User.class))).thenReturn(true);

        boolean updated = userJdbcService.updateUser(1L, Map.of("name", "Updated Name", "totalXp", 150));

        assertTrue(updated);
        assertEquals("Updated Name", sampleUser.getName());
        assertEquals(150, sampleUser.getTotalXp());
        verify(userJdbcDao).update(sampleUser);
    }

    @Test
    @DisplayName("deleteUser should delegate to userJdbcDao.delete")
    void testDeleteUser() throws SQLException {
        when(userJdbcDao.delete(1L)).thenReturn(true);

        boolean deleted = userJdbcService.deleteUser(1L);

        assertTrue(deleted);
        verify(userJdbcDao).delete(1L);
    }
}
