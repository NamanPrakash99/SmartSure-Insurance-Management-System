package com.group2.auth_service.service;

import com.group2.auth_service.entity.Otp;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.exception.OtpException;
import com.group2.auth_service.exception.UserAlreadyExistsException;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.repository.OtpRepository;
import com.group2.auth_service.service.impl.OtpServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceExtraTest {

    @InjectMocks
    private OtpServiceImpl otpService;

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private AuthServiceRepository authServiceRepository;

    @Mock
    private EmailService emailService;

    @Test
    public void testSendOtp_UserExists() {
        when(authServiceRepository.findByEmail(anyString())).thenReturn(Optional.of(new User()));
        assertThrows(UserAlreadyExistsException.class, () -> otpService.sendOtp("test@test.com"));
    }

    @Test
    public void testSendOtp_Success() {
        when(authServiceRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        otpService.sendOtp("test@test.com");
        verify(otpRepository, times(1)).deleteByEmail("test@test.com");
        verify(otpRepository, times(1)).save(any(Otp.class));
        verify(emailService, times(1)).sendOtpEmail(anyString(), anyString());
    }

    @Test
    public void testVerifyOtp_Success() {
        Otp otp = new Otp();
        otp.setOtp("123456");
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        when(otpRepository.findByEmail("test@test.com")).thenReturn(Optional.of(otp));

        assertTrue(otpService.verifyOtp("test@test.com", "123456"));
        assertTrue(otp.isVerified());
        verify(otpRepository, times(1)).save(otp);
    }

    @Test
    public void testVerifyOtp_Expired() {
        Otp otp = new Otp();
        otp.setOtp("123456");
        otp.setExpiryTime(LocalDateTime.now().minusMinutes(5));
        when(otpRepository.findByEmail("test@test.com")).thenReturn(Optional.of(otp));

        assertThrows(OtpException.class, () -> otpService.verifyOtp("test@test.com", "123456"));
    }

    @Test
    public void testVerifyOtp_InvalidOtp() {
        Otp otp = new Otp();
        otp.setOtp("123456");
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        when(otpRepository.findByEmail("test@test.com")).thenReturn(Optional.of(otp));

        assertThrows(OtpException.class, () -> otpService.verifyOtp("test@test.com", "999999"));
    }

    @Test
    public void testVerifyOtp_NotFound() {
        when(otpRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());
        assertThrows(OtpException.class, () -> otpService.verifyOtp("test@test.com", "123456"));
    }

    @Test
    public void testValidateOtpBeforeRegister_UserExists() {
        when(authServiceRepository.findByEmail("test@test.com")).thenReturn(Optional.of(new User()));
        assertThrows(UserAlreadyExistsException.class, () -> otpService.validateOtpBeforeRegister("test@test.com"));
    }

    @Test
    public void testValidateOtpBeforeRegister_OtpNotFound() {
        when(authServiceRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());
        when(otpRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());
        assertThrows(OtpException.class, () -> otpService.validateOtpBeforeRegister("test@test.com"));
    }

    @Test
    public void testValidateOtpBeforeRegister_OtpNotVerified() {
        Otp otp = new Otp();
        otp.setVerified(false);
        when(authServiceRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());
        when(otpRepository.findByEmail("test@test.com")).thenReturn(Optional.of(otp));
        assertThrows(OtpException.class, () -> otpService.validateOtpBeforeRegister("test@test.com"));
    }

    @Test
    public void testValidateOtpBeforeRegister_Success() {
        Otp otp = new Otp();
        otp.setVerified(true);
        when(authServiceRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());
        when(otpRepository.findByEmail("test@test.com")).thenReturn(Optional.of(otp));
        // Should not throw
        otpService.validateOtpBeforeRegister("test@test.com");
    }
}
