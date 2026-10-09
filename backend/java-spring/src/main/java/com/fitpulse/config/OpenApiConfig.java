package com.fitpulse.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "BearerAuthentication";

        return new OpenAPI()
                .info(new Info()
                        .title("FitPulse Enterprise API")
                        .description("Clinical Wellness & Biometric Telemetry Online Fitness Platform - Spring Boot 3 & Security 6")
                        .version("1.0.0")
                        .contact(new Contact().name("FitPulse Architectural Team").email("engineering@fitpulse.com"))
                        .license(new License().name("Apache 2.0").url("https://fitpulse.com/license")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
