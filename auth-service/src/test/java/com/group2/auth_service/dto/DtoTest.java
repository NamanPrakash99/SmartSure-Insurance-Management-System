package com.group2.auth_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DtoTest {

    @Test
    void testAuthResponse() {
        AuthResponse dto = new AuthResponse("token", "refresh", "ROLE_USER", 1L, "user");
        assertEquals("token", dto.getToken());
        assertEquals("refresh", dto.getRefreshToken());
        assertEquals(1L, dto.getId());
        assertEquals("user", dto.getName());
        assertEquals("ROLE_USER", dto.getRole());
    }

    @Test
    void testLoginRequest() {
        LoginRequest dto = new LoginRequest();
        dto.setEmail("test@test.com");
        dto.setPassword("pass");
        assertEquals("test@test.com", dto.getEmail());
        assertEquals("pass", dto.getPassword());
    }

    @Test
    void testRegisterRequest() {
        RegisterRequest dto = new RegisterRequest();
        dto.setName("user");
        dto.setEmail("e");
        dto.setPassword("p");
        assertEquals("user", dto.getName());
    }
}
