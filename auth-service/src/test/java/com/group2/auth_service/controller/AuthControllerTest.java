package com.group2.auth_service.controller;

import com.group2.auth_service.dto.*;
import com.group2.auth_service.service.AuthService;
import com.group2.auth_service.service.OtpService;
import com.group2.auth_service.service.RefreshTokenService;
import com.group2.auth_service.security.JwtUtil;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.entity.RefreshToken;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private OtpService otpService;

    @MockitoBean
    private RefreshTokenService refreshTokenService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testRegister() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@test.com");
        request.setPassword("Password123");

        User user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");

        when(authService.register(any(RegisterRequest.class))).thenReturn(user);

        mockMvc.perform(post("/api/auth/register")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    public void testLogin() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@test.com");
        request.setPassword("Password123");

        AuthResponse response = new AuthResponse("token", "refreshToken", "CUSTOMER", 1L, "User");

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"));
    }

    @Test
    public void testRefreshToken() throws Exception {
        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("oldRefresh");

        User user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setRole(com.group2.auth_service.entity.Role.CUSTOMER);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken("oldRefresh");

        java.util.Optional<RefreshToken> opt = java.util.Optional.of(refreshToken);
        when(refreshTokenService.findByToken("oldRefresh")).thenReturn(opt);
        when(refreshTokenService.verifyExpiration(any(RefreshToken.class))).thenReturn(refreshToken);
        when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("newToken");

        mockMvc.perform(post("/api/auth/refresh-token")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("newToken"));
    }

    @Test
    public void testSendOtp() throws Exception {
        mockMvc.perform(post("/api/auth/send-otp")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .param("email", "user@test.com"))
                .andExpect(status().isOk());
    }

    @Test
    public void testVerifyOtp() throws Exception {
        mockMvc.perform(post("/api/auth/verify-otp")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .param("email", "user@test.com")
                .param("otp", "123456"))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetUserById() throws Exception {
        User user = new User();
        user.setId(1L);
        when(authService.getUserById(1L)).thenReturn(user);

        mockMvc.perform(get("/api/auth/users/1")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    public void testForgotPassword() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .param("email", "user@test.com"))
                .andExpect(status().isOk());
    }

    @Test
    public void testResetPassword() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("token");
        request.setNewPassword("NewPass123");

        mockMvc.perform(post("/api/auth/reset-password")
                .header("X-Gateway-Secret", "SmartSureSecretKey2026")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
