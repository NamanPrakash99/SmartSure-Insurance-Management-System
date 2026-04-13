package com.group2.auth_service.service;

import com.group2.auth_service.dto.AuthResponse;
import com.group2.auth_service.dto.LoginRequest;
import com.group2.auth_service.dto.RegisterRequest;
import com.group2.auth_service.dto.UpdateProfileRequest;
import com.group2.auth_service.entity.PasswordResetToken;
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

import java.util.List;
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
    @DisplayName("Should successfully reset password when token is valid")
    public void shouldResetPasswordSuccessfully() {
        String token = "valid-token";
        String newPassword = "NewPassword123";
        User user = new User();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        
        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode(newPassword)).thenReturn("new_hashed_pass");

        authService.resetPassword(token, newPassword);

        verify(userRepository).save(user);
        verify(tokenRepository).delete(resetToken);
        assertEquals("new_hashed_pass", user.getPassword());
    }

    @Test
    @DisplayName("Should update user profile details correctly")
    public void shouldUpdateUserProfileSuccessfully() {
        Long userId = 1L;
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("New Name");
        request.setPhone("9876543210");
        request.setAddress("New Address");

        User user = new User();
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        User result = authService.updateUser(userId, request);

        assertEquals("New Name", result.getName());
        assertEquals("9876543210", result.getPhone());
        assertEquals("New Address", result.getAddress());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should return list of all customers")
    public void shouldReturnAllCustomers() {
        when(userRepository.findByRole(Role.CUSTOMER)).thenReturn(List.of(new User(), new User()));
        
        List<User> customers = authService.getAllCustomers();
        
        assertEquals(2, customers.size());
        verify(userRepository).findByRole(Role.CUSTOMER);
    }

    @Test
    @DisplayName("Should throw exception when registering existing user")
    public void shouldThrowExceptionWhenRegisteringExistingUser() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(new User()));

        assertThrows(com.group2.auth_service.exception.UserAlreadyExistsException.class, () -> authService.register(request));
    }

    @Test
    @DisplayName("Should throw exception when registering with short password")
    public void shouldThrowExceptionWhenRegisteringWithShortPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");
        request.setPassword("12345");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.register(request));
    }

    @Test
    @DisplayName("Should throw exception when registering with no number in password")
    public void shouldThrowExceptionWhenRegisteringWithNoNumberInPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");
        request.setPassword("Password");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.register(request));
    }

    @Test
    @DisplayName("Should login correctly with uppercase email")
    public void shouldLoginWithUppercaseEmail() {
        LoginRequest request = new LoginRequest();
        request.setEmail("TEST@TEST.COM ");
        request.setPassword("Password123");

        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("hashed_pass");
        user.setRole(Role.CUSTOMER);
        user.setId(1L);

        RefreshToken rt = new RefreshToken();
        rt.setToken("refresh_token");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("jwt_token");
        when(refreshTokenService.createRefreshToken(anyLong())).thenReturn(rt);

        AuthResponse response = authService.login(request);
        assertEquals("jwt_token", response.getToken());
    }

    @Test
    @DisplayName("Should throw exception when password incorrect during login")
    public void shouldThrowExceptionWhenPasswordIncorrectDuringLogin() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("WrongPassword");

        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("hashed_pass");
        user.setRole(Role.CUSTOMER);

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should get user by id successfully")
    public void shouldGetUserByIdSuccessfully() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = authService.getUserById(1L);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("Should throw exception when get user by id not found")
    public void shouldThrowExceptionWhenGetUserByIdNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> authService.getUserById(1L));
    }

    @Test
    @DisplayName("Should forgot password successfully")
    public void shouldForgotPasswordSuccessfully() {
        User user = new User();
        user.setEmail("test@test.com");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        authService.forgotPassword("TEST@test.com");

        verify(tokenRepository).deleteByUser(user);
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendResetPasswordEmail(eq("test@test.com"), anyString());
    }

    @Test
    @DisplayName("Should throw exception when forgot password user not found")
    public void shouldThrowExceptionWhenForgotPasswordUserNotFound() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> authService.forgotPassword("test@test.com"));
    }

    @Test
    @DisplayName("Should throw exception when reset password token expired")
    public void shouldThrowExceptionWhenResetPasswordTokenExpired() {
        String token = "expired-token";
        User user = new User();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        
        // Mock token expiration by somehow setting expiry date in past or overriding isExpired if we could, 
        // but let's see how `isExpired()` is implemented. If we can't easily mock `isExpired()` we might need to mock token creation.
        // Wait, can we mock `PasswordResetToken`? Yes, using spy or just relying on its method if we can set the expiry date.
        // If not, we can just spy it.
        PasswordResetToken spyToken = spy(resetToken);
        when(spyToken.isExpired()).thenReturn(true);

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(spyToken));

        assertThrows(RuntimeException.class, () -> authService.resetPassword(token, "NewPassword123"));
        verify(tokenRepository).delete(spyToken);
    }

    @Test
    @DisplayName("Should throw exception when reset password token not found")
    public void shouldThrowExceptionWhenResetPasswordTokenNotFound() {
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> authService.resetPassword("invalid", "pass"));
    }

    @Test
    @DisplayName("Should init admin when admin does not exist")
    public void shouldInitAdminWhenNotExists() {
        when(userRepository.findByEmail("admin@capgemini.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("admin123")).thenReturn("encoded");
        
        authService.initAdmin();
        
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should not init admin when admin already exists")
    public void shouldNotInitAdminWhenExists() {
        when(userRepository.findByEmail("admin@capgemini.com")).thenReturn(Optional.of(new User()));
        
        authService.initAdmin();
        
        verify(userRepository, never()).save(any(User.class));
    }
}
