package com.group2.auth_service.service;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
    void sendOtpEmail(String email, String otp);
    void sendResetPasswordEmail(String email, String token);
}
