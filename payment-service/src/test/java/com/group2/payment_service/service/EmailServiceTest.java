package com.group2.payment_service.service;

import com.group2.payment_service.service.impl.EmailServiceImpl;
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
class EmailServiceTest {

    @InjectMocks
    private EmailServiceImpl emailService;

    @Mock
    private JavaMailSender mailSender;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@smartsure.com");
    }

    @Test
    @DisplayName("Should send HTML email successfully")
    void testSendHtmlEmail_Success() {
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendHtmlEmail("recipient@test.com", "Test Subject", "<html><body>Hello</body></html>");

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should handle exception gracefully when HTML email fails")
    void testSendHtmlEmail_ExceptionHandled() {
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Mail server unavailable"));

        emailService.sendHtmlEmail("recipient@test.com", "Test Subject", "<html><body>Hello</body></html>");

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Should send plain text email successfully")
    void testSendEmail_Success() {
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        emailService.sendEmail("recipient@test.com", "Test Subject", "Plain text body");

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
