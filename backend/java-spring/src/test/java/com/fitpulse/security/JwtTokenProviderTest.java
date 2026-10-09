package com.fitpulse.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    void testGenerateAndValidateToken_Success() {
        UserDetails userDetails = new User(
                "sarah@fitpulse.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        String token = tokenProvider.generateToken(auth);
        assertNotNull(token);
        assertTrue(token.length() > 20);

        // Validate
        assertTrue(tokenProvider.validateToken(token));

        // Extract subject
        String username = tokenProvider.getUsernameFromJwt(token);
        assertEquals("sarah@fitpulse.com", username);
    }

    @Test
    void testValidateToken_InvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.token.signature"));
    }
}
