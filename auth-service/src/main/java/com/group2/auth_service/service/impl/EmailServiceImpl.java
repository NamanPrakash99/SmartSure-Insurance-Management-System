package com.group2.auth_service.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.group2.auth_service.service.EmailService;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@smartsure.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("📧 Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("❌ Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendOtpEmail(String email, String otp) {
        String subject = "SmartSure - Your OTP Verification Code";
        String body = "Hello,\n\nYour OTP for registration is: " + otp + "\n\nThis code will expire in 10 minutes.\n\nThank you,\nSmartSure Team";
        sendEmail(email, subject, body);
    }

    public void sendResetPasswordEmail(String email, String token) {
        String subject = "SmartSure - Password Reset Request";
        String body = "Hello,\n\nYou requested to reset your password. Use the following token to complete the process:\n\n" + token + "\n\nIf you did not request this, please ignore this email.\n\nThank you,\nSmartSure Team";
        sendEmail(email, subject, body);
    }
}
