package com.fitpulse.controller;

import com.fitpulse.dto.ApiResponse;
import com.fitpulse.dto.AuthDtos.*;
import com.fitpulse.model.User;
import com.fitpulse.service.IAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing endpoints for authentication and athlete identity.
 * Injects IAuthService interface to enforce Controller → Service separation.
 */
@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
@Tag(name = "Authentication & Identity", description = "Endpoints for athlete login, registration, and credential security")
public class AuthController {

    private final IAuthService authService;

    public AuthController(IAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register new athlete account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Account successfully registered"));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Authentication successful"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated athlete profile")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update athlete display name and avatar URL")
    public ResponseEntity<ApiResponse<User>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User updated = authService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Profile details updated"));
    }

    @PutMapping("/password")
    @Operation(summary = "Change password with bcrypt verification")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Password changed successfully"));
    }
}
