package com.fitpulse.service;

import com.fitpulse.dto.AuthDtos.*;
import com.fitpulse.model.User;

/**
 * Service interface defining authentication, profile, and authorization contracts.
 * Demonstrates OOP Abstraction and Interface Segregation.
 */
public interface IAuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    User getCurrentAuthenticatedUser();
    User updateProfile(UpdateProfileRequest request);
    void changePassword(ChangePasswordRequest request);
}
