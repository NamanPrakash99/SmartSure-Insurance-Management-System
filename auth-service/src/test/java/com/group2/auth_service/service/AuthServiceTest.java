package com.group2.auth_service.service;

import com.group2.auth_service.dto.AuthResponse;
import com.group2.auth_service.dto.LoginRequest;
import com.group2.auth_service.dto.RegisterRequest;
import com.group2.auth_service.entity.PasswordResetToken;
import com.group2.auth_service.entity.RefreshToken;
import com.group2.auth_service.entity.Role;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.repository.PasswordResetTokenRepository;
import com.group2.auth_service.security.JwtUtil;
import com.group2.auth_service.service.impl.AuthServiceImpl;
import com.group2.auth_service.service.impl.RefreshTokenServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthServiceRepository userRepository;
    @Mock
    private PasswordResetTokenRepository tokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    public void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");
        request.setPassword("Password123");
        request.setName("Test User");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        
        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail("test@test.com");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register(request);

        assertNotNull(result);
        assertEquals("test@test.com", result.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    public void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("Password123");

        User user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
        user.setPassword("encodedPass");
        user.setRole(Role.CUSTOMER);
        user.setName("Test User");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123", "encodedPass")).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("jwtToken");
        
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refreshToken");
        when(refreshTokenService.createRefreshToken(1L)).thenReturn(refreshToken);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwtToken", response.getToken());
        assertEquals("refreshToken", response.getRefreshToken());
    }

    @Test
    public void testLogin_UserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("none@none.com");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertTrue(exception.getMessage().contains("User not found"));
    }

    @Test
    public void testForgotPassword_Success() {
        String email = "test@test.com";
        User user = new User();
        user.setEmail(email);

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        authService.forgotPassword(email);

        verify(tokenRepository).deleteByUser(user);
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendResetPasswordEmail(eq(email), anyString());
    }
}
