package com.fitpulse.service;

import com.fitpulse.dto.AuthDtos.*;
import com.fitpulse.exception.BadRequestException;
import com.fitpulse.exception.DuplicateResourceException;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.Role;
import com.fitpulse.repository.UserRepository;
import com.fitpulse.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private IActivityLogService activityLogService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("Sarah Connor", "sarah@fitpulse.com", "encodedHash", Role.USER, "avatar.png");
        testUser.setId(101L);
    }

    @Test
    @DisplayName("Should successfully register a new athlete")
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Sarah Connor");
        request.setEmail("sarah@fitpulse.com");
        request.setPassword("Password123!");

        when(userRepository.existsByEmail("sarah@fitpulse.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encodedHash");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(tokenProvider.generateToken(any())).thenReturn("mock.jwt.token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("sarah@fitpulse.com", response.getEmail());
        assertEquals(101L, response.getId());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email already exists")
    void testRegister_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Duplicate User");
        request.setEmail("sarah@fitpulse.com");
        request.setPassword("Password123!");

        when(userRepository.existsByEmail("sarah@fitpulse.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should authenticate user and return token on login")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("sarah@fitpulse.com");
        request.setPassword("User123!");

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(userRepository.findByEmail("sarah@fitpulse.com")).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateToken(any())).thenReturn("valid.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid.jwt.token", response.getToken());
        assertEquals("sarah@fitpulse.com", response.getEmail());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when logging in with unknown email")
    void testLogin_UserNotFound_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@fitpulse.com");
        request.setPassword("Password123!");

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(userRepository.findByEmail("unknown@fitpulse.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should reject password change if current password does not match")
    void testChangePassword_WrongPassword_ThrowsException() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("sarah@fitpulse.com");
        when(userRepository.findByEmail("sarah@fitpulse.com")).thenReturn(Optional.of(testUser));

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("WrongPassword!");
        request.setNewPassword("NewSecurePassword123!");

        when(passwordEncoder.matches("WrongPassword!", "encodedHash")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.changePassword(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
