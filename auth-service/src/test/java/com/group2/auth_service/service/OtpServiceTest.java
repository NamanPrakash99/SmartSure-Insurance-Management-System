package com.group2.auth_service.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.group2.auth_service.entity.Otp;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.exception.OtpException;
import com.group2.auth_service.exception.UserAlreadyExistsException;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.repository.OtpRepository;
import com.group2.auth_service.service.impl.OtpServiceImpl;

@ExtendWith(MockitoExtension.class)
public class OtpServiceTest {

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private AuthServiceRepository authServiceRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private OtpServiceImpl otpService;

    @Test
    void testSendOtp_Success() {
        String email = "test@test.com";
        when(authServiceRepository.findByEmail(email)).thenReturn(Optional.empty());

        otpService.sendOtp(email);

        verify(otpRepository).deleteByEmail(email);
        verify(otpRepository).save(any(Otp.class));
        verify(emailService).sendOtpEmail(eq(email), anyString());
    }

    @Test
    void testSendOtp_UserExists() {
        String email = "test@test.com";
        when(authServiceRepository.findByEmail(email)).thenReturn(Optional.of(new User()));

        assertThrows(UserAlreadyExistsException.class, () -> otpService.sendOtp(email));
    }

    @Test
    void testVerifyOtp_Success() {
        String email = "test@test.com";
        String otpValue = "123456";
        Otp otpEntity = new Otp();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otpValue);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(10));

        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otpEntity));

        boolean result = otpService.verifyOtp(email, otpValue);

        assertTrue(result);
        assertTrue(otpEntity.isVerified());
        verify(otpRepository).save(otpEntity);
    }

    @Test
    void testVerifyOtp_Expired() {
        String email = "test@test.com";
        Otp otpEntity = new Otp();
        otpEntity.setExpiryTime(LocalDateTime.now().minusMinutes(1));

        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otpEntity));

        assertThrows(OtpException.class, () -> otpService.verifyOtp(email, "123456"));
    }

    @Test
    void testVerifyOtp_Invalid() {
        String email = "test@test.com";
        Otp otpEntity = new Otp();
        otpEntity.setOtp("123456");
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(10));

        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otpEntity));

        assertThrows(OtpException.class, () -> otpService.verifyOtp(email, "000000"));
    }

    @Test
    void testValidateOtpBeforeRegister_Success() {
        String email = "test@test.com";
        Otp otp = new Otp();
        otp.setVerified(true);

        when(authServiceRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otp));

        assertDoesNotThrow(() -> otpService.validateOtpBeforeRegister(email));
    }

    @Test
    void testValidateOtpBeforeRegister_NotVerified() {
        String email = "test@test.com";
        Otp otp = new Otp();
        otp.setVerified(false);

        when(authServiceRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(otpRepository.findByEmail(email)).thenReturn(Optional.of(otp));

        assertThrows(OtpException.class, () -> otpService.validateOtpBeforeRegister(email));
    }
}
