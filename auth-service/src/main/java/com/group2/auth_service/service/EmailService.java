package com.group2.auth_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email:np164429@gmail.com}")
    private String senderEmail;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            String body = String.format(
                "{\"sender\": {\"name\": \"SmartSure\", \"email\": \"%s\"}, \"to\": [{\"email\": \"%s\"}], \"subject\": \"%s\", \"htmlContent\": \"%s\"}",
                senderEmail, to, subject, htmlContent.replace("\"", "\\\"")
            );

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            String response = restTemplate.postForObject(BREVO_URL, request, String.class);
            System.out.println("Email sent to " + to + ". Response: " + response);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    public void sendOtpEmail(String to, String otp) {
        String html = "<h3>Your OTP is: <b>" + otp + "</b></h3><p>Valid for 10 minutes.</p>";
        sendEmail(to, "OTP Verification", html);
    }

    public void sendResetPasswordEmail(String to, String token) {
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        String html = "<h2>Password Reset Request</h2>" +
                      "<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>" +
                      "<p>Please click on the following link, or paste this into your browser to complete the process:</p>" +
                      "<a href='" + resetLink + "' style='display:inline-block;padding:10px 20px;background-color:#6366f1;color:white;text-decoration:none;border-radius:8px;'>Reset My Password</a>" +
                      "<br/><br/><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>";
        sendEmail(to, "Password Reset Request", html);
    }
}
