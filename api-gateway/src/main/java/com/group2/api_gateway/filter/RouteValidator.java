package com.group2.api_gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RouteValidator {

    // Endpoints that do NOT require JWT authentication
    public static final List<String> OPEN_API_ENDPOINTS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/send-otp",
            "/api/auth/verify-otp",
            "/api/auth/refresh-token",
            "/v3/api-docs",
            "/swagger-ui",
            "/swagger-ui.html",
            "/webjars",
            "/swagger-resources",
            "/aggregate",
            "/actuator",
            "/eureka",
            "/error"
    );

    public boolean isOpenEndpoint(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        return OPEN_API_ENDPOINTS.stream()
                .anyMatch(path::contains);
    }
}
