package com.fitpulse.config;

import com.fitpulse.servlet.ChallengeServlet;
import com.fitpulse.servlet.UserServlet;
import com.fitpulse.servlet.WorkoutServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Boot Configuration for native Java HttpServlet registrations.
 * Registers UserServlet, WorkoutServlet, and ChallengeServlet within the embedded web container,
 * providing direct HTTP endpoints powered by the underlying JDBC layer.
 *
 * Mappings:
 * - UserServlet:      /servlet/users/*,      /api/servlet/users/*
 * - WorkoutServlet:   /servlet/workouts/*,   /api/servlet/workouts/*
 * - ChallengeServlet: /servlet/challenges/*, /api/servlet/challenges/*
 */
@Configuration
public class ServletConfig {

    @Bean
    public ServletRegistrationBean<UserServlet> userServletRegistration(UserServlet userServlet) {
        ServletRegistrationBean<UserServlet> registration = new ServletRegistrationBean<>(
                userServlet,
                "/servlet/users/*",
                "/api/servlet/users/*"
        );
        registration.setName("UserJdbcServlet");
        registration.setLoadOnStartup(1);
        return registration;
    }

    @Bean
    public ServletRegistrationBean<WorkoutServlet> workoutServletRegistration(WorkoutServlet workoutServlet) {
        ServletRegistrationBean<WorkoutServlet> registration = new ServletRegistrationBean<>(
                workoutServlet,
                "/servlet/workouts/*",
                "/api/servlet/workouts/*"
        );
        registration.setName("WorkoutJdbcServlet");
        registration.setLoadOnStartup(1);
        return registration;
    }

    @Bean
    public ServletRegistrationBean<ChallengeServlet> challengeServletRegistration(ChallengeServlet challengeServlet) {
        ServletRegistrationBean<ChallengeServlet> registration = new ServletRegistrationBean<>(
                challengeServlet,
                "/servlet/challenges/*",
                "/api/servlet/challenges/*"
        );
        registration.setName("ChallengeJdbcServlet");
        registration.setLoadOnStartup(1);
        return registration;
    }
}
