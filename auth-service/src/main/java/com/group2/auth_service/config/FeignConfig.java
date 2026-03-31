package com.group2.auth_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.group2.auth_service.security.JwtUtil;

import feign.RequestInterceptor;
import feign.RequestTemplate;

@Configuration
public class FeignConfig {

    private final JwtUtil jwtUtil;

    public FeignConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                // Generate a temporary admin token for backend-to-backend communication
                String token = jwtUtil.generateToken("system@smartsure.com", 0L, "ROLE_ADMIN");
                template.header("Authorization", "Bearer " + token);
            }
        };
    }
}
