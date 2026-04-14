package com.group2.auth_service.service;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import com.group2.auth_service.service.impl.EmailServiceImpl;

import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    @Test
    void testSendOtpEmail() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendOtpEmail("test@test.com", "123456");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void testSendResetPasswordEmail() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendResetPasswordEmail("test@test.com", "token123");

        verify(mailSender).send(any(MimeMessage.class));
    }
}
