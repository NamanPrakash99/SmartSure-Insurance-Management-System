package com.group2.auth_service.service;

import com.group2.auth_service.entity.Otp;
import com.group2.auth_service.exception.OtpException;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.repository.OtpRepository;
import com.group2.auth_service.service.impl.OtpServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OtpServiceTest {

    @Mock
    private OtpRepository otpRepository;
    @Mock
    private AuthServiceRepository authServiceRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private OtpServiceImpl otpService;

    @Test
    @DisplayName("Should successfully generate and send OTP when email is valid and not registered")
    void shouldSendOtpSuccessfully() {
        String email = "test@test.com";
        when(authServiceRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        otpService.sendOtp(email);

        verify(otpRepository).deleteByEmail(email);
        verify(otpRepository).save(any(Otp.class));
        verify(emailService).sendOtpEmail(eq(email), anyString());
    }

    @Test
    @DisplayName("Should return true and verify OTP when correct OTP is provided before expiry")
    void shouldVerifyOtpSuccessfully() {
        String email = "test@test.com";
        String otp = "123456";
        Otp otpEntity = new Otp();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otpEntity));

        boolean res = otpService.verifyOtp(email, otp);

        assertTrue(res);
        assertTrue(otpEntity.isVerified());
        verify(otpRepository).save(otpEntity);
    }

    @Test
    @DisplayName("Should throw exception when verifying an expired OTP")
    void shouldThrowExceptionWhenOtpIsExpired() {
        String email = "test@test.com";
        String otp = "123456";
        Otp otpEntity = new Otp();
        otpEntity.setExpiryTime(LocalDateTime.now().minusMinutes(1));

        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otpEntity));

        assertThrows(OtpException.class, () -> otpService.verifyOtp(email, otp));
    }

    @Test
    @DisplayName("Should throw exception when verifying with incorrect OTP")
    void shouldThrowExceptionWhenOtpIsIncorrect() {
        String email = "test@test.com";
        Otp otpEntity = new Otp();
        otpEntity.setOtp("123456");
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otpEntity));

        assertThrows(OtpException.class, () -> otpService.verifyOtp(email, "000000"));
    }

    @Test
    @DisplayName("Should validate successfully before registration when OTP is verified")
    void shouldValidateBeforeRegisterSuccessfully() {
        String email = "test@test.com";
        Otp otpEntity = new Otp();
        otpEntity.setVerified(true);

        when(authServiceRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otpEntity));

        assertDoesNotThrow(() -> otpService.validateOtpBeforeRegister(email));
    }

    @Test
    @DisplayName("Should throw exception during validation if OTP is not verified")
    void shouldThrowExceptionIfOtpNotVerified() {
        String email = "test@test.com";
        Otp otpEntity = new Otp();
        otpEntity.setVerified(false);

        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otpEntity));

        assertThrows(OtpException.class, () -> otpService.validateOtpBeforeRegister(email));
    }
}
