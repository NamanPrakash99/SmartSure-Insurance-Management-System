package com.group2.auth_service.service;

import com.group2.auth_service.service.impl.EmailServiceImpl;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    @DisplayName("Should call mailSender when sending a general HTML email")
    public void shouldSendGeneralEmailSuccessfully() {
        emailService.sendEmail("user@example.com", "Subject", "<h1>Content</h1>");
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should call mailSender when sending an OTP email")
    public void shouldSendOtpEmailSuccessfully() {
        emailService.sendOtpEmail("user@example.com", "123456");
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should call mailSender when sending a password reset email")
    public void shouldSendPasswordResetEmailSuccessfully() {
        emailService.sendResetPasswordEmail("user@example.com", "token-123");
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should handle exceptions gracefully when mailSender fails")
    public void shouldHandleEmailFailureGracefully() {
        doThrow(new RuntimeException("Mail server down")).when(mailSender).send(any(MimeMessage.class));
        // Should not throw exception to caller as it's caught and logged
        emailService.sendEmail("user@example.com", "Subject", "Content");
        verify(mailSender).send(any(MimeMessage.class));
    }
}
