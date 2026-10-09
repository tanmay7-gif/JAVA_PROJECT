package com.fitpulse.service;

import com.fitpulse.dto.AuthDtos.*;
import com.fitpulse.exception.BadRequestException;
import com.fitpulse.exception.DuplicateResourceException;
import com.fitpulse.exception.ResourceNotFoundException;
import com.fitpulse.model.User;
import com.fitpulse.model.enums.ActivityType;
import com.fitpulse.model.enums.Role;
import com.fitpulse.repository.UserRepository;
import com.fitpulse.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for user authentication and credentials management.
 * Implements IAuthService.
 */
@Service
public class AuthService implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final IActivityLogService activityLogService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       IActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("User", "email", normalizedEmail);
        }

        String avatar = request.getAvatarUrl();
        if (avatar == null || avatar.isBlank()) {
            avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.getName().replace(" ", "");
        }

        User user = new User(
                request.getName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                Role.USER,
                avatar
        );

        User savedUser = userRepository.save(user);

        // Record audit activity
        activityLogService.logActivity(savedUser, ActivityType.USER_REGISTERED,
                "New athlete registered: " + savedUser.getEmail(), "USER", savedUser.getId());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole(), savedUser.getAvatarUrl());
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", normalizedEmail));

        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAvatarUrl());
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("No active authentication context found");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    @Override
    @Transactional
    public User updateProfile(UpdateProfileRequest request) {
        User user = getCurrentAuthenticatedUser();
        user.setName(request.getName().trim());
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        User updated = userRepository.save(user);
        activityLogService.logActivity(updated, ActivityType.PROFILE_UPDATED,
                "Athlete updated profile parameters", "USER", updated.getId());
        return updated;
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentAuthenticatedUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password provided does not match records");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        activityLogService.logActivity(user, ActivityType.PROFILE_UPDATED,
                "Athlete updated password credentials", "USER", user.getId());
    }
}
