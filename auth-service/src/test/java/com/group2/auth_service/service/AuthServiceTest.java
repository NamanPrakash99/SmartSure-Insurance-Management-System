package com.group2.auth_service.service;

import com.group2.auth_service.dto.AuthResponse;
import com.group2.auth_service.dto.LoginRequest;
import com.group2.auth_service.dto.RegisterRequest;
import com.group2.auth_service.entity.RefreshToken;
import com.group2.auth_service.entity.Role;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.repository.PasswordResetTokenRepository;
import com.group2.auth_service.security.JwtUtil;
import com.group2.auth_service.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
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
    @DisplayName("Should create a new user successfully when registration details are valid")
    public void shouldRegisterUserSuccessfully() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");
        request.setPassword("Password123");
        request.setName("Test User");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_pass");
        when(userRepository.save(any(User.class))).thenReturn(new User());

        User result = authService.register(request);
        assertNotNull(result);
    }

    @Test
    @DisplayName("Should return valid tokens when login credentials are correct")
    public void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("Password123");

        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("hashed_pass");
        user.setRole(Role.CUSTOMER);
        user.setId(1L);

        RefreshToken rt = new RefreshToken();
        rt.setToken("refresh_token");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("jwt_token");
        when(refreshTokenService.createRefreshToken(anyLong())).thenReturn(rt);

        AuthResponse response = authService.login(request);
        assertEquals("jwt_token", response.getToken());
        assertEquals("refresh_token", response.getRefreshToken());
    }

    @Test
    @DisplayName("Should throw exception when attempting to login with non-existent user")
    public void shouldThrowExceptionWhenUserNotFoundDuringLogin() {
        LoginRequest request = new LoginRequest();
        request.setEmail("none@none.com");
        request.setPassword("pass");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should trigger password reset process successfully when email exists")
    public void shouldInitiateForgotPasswordSuccessfully() {
        String email = "test@test.com";
        User user = new User();
        user.setEmail(email);

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        authService.forgotPassword(email);

        verify(tokenRepository).deleteByUser(user);
        verify(tokenRepository).save(any());
        verify(emailService).sendResetPasswordEmail(eq(email), anyString());
    }
}
