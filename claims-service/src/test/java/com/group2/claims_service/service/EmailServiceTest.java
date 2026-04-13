package com.group2.claims_service.service;

import com.group2.claims_service.service.impl.EmailServiceImpl;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "test@smartsure.com");
    }

    @Test
    @DisplayName("Should send simple text email successfully")
    public void shouldSendSimpleEmail() {
        emailService.sendEmail("to@test.com", "Subject", "Body");
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("Should send HTML email successfully")
    public void shouldSendHtmlEmail() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendHtmlEmail("to@test.com", "Subject", "<h1>Html</h1>");
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should handle HTML email failure gracefully")
    public void shouldHandleHtmlEmailFailure() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("Mail Error")).when(mailSender).send(any(MimeMessage.class));

        // Should not throw exception
        emailService.sendHtmlEmail("to@test.com", "Subject", "<h1>Html</h1>");
        verify(mailSender).send(any(MimeMessage.class));
    }
}
