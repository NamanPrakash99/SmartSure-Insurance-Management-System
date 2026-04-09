package com.group2.auth_service.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.group2.auth_service.service.EmailService;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("no-reply@smartsure.com", "SmartSure Support");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("📧 HTML Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("❌ Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendOtpEmail(String email, String otp) {
        String subject = "SmartSure - Your OTP Verification Code";
        
        String htmlContent = "<div style=\"background-color: #111111; padding: 30px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; text-align: center;\">" +
                "    <div style=\"max-width: 400px; margin: 0 auto; background-color: #1a1a1a; border-radius: 16px; padding: 40px 20px; border: 1px solid #333333;\">" +
                "        <div style=\"margin-bottom: 30px;\">" +
                "            <span style=\"font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1px;\">SmartSure</span>" +
                "        </div>" +
                "        <h2 style=\"color: #ffffff; font-size: 20px; margin-bottom: 10px; font-weight: 600;\">Email Verification</h2>" +
                "        <p style=\"color: #888888; font-size: 14px; margin-bottom: 30px;\">Use the verification code below to continue:</p>" +
                "        " +
                "        <div style=\"background-color: #222222; border: 1px dashed #444444; border-radius: 8px; padding: 15px 10px; display: block; margin: 0 20px 30px 20px;\">" +
                "            <span style=\"font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #6366f1; white-space: nowrap; font-family: monospace;\">" + otp + "</span>" +
                "        </div>" +
                "        " +
                "        <p style=\"color: #555555; font-size: 12px; line-height: 1.5;\">" +
                "            This code is valid for <b>10 minutes</b>.<br/>" +
                "            If you didn't request this, you can safely ignore this email." +
                "        </p>" +
                "    </div>" +
                "</div>";

        sendEmail(email, subject, htmlContent);
    }

    public void sendResetPasswordEmail(String email, String token) {
        String subject = "SmartSure - Password Reset Request";
        String htmlContent = "<div style=\"background-color: #111111; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;\">" +
                "    <div style=\"max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 3px; border-radius: 20px;\">" +
                "        <div style=\"background-color: #1a1a1a; padding: 40px; border-radius: 18px; text-align: center;\">" +
                "            <div style=\"margin-bottom: 25px;\">" +
                "                <span style=\"font-size: 32px; font-weight: 800; color: #ffffff;\">🛡️ SmartSure</span>" +
                "            </div>" +
                "            <h2 style=\"color: #ffffff; font-size: 24px; margin-bottom: 10px;\">Password Reset</h2>" +
                "            <p style=\"color: #9ca3af; font-size: 16px; margin-bottom: 30px;\">You requested to reset your password. Use the following code:</p>" +
                "            " +
                "            <div style=\"background: rgba(239, 68, 68, 0.1); border: 2px dashed #ef4444; border-radius: 12px; padding: 20px; margin-bottom: 30px;\">" +
                "                <span style=\"font-size: 24px; font-weight: 800; color: #ef4444; word-break: break-all;\">" + token + "</span>" +
                "            </div>" +
                "            " +
                "            <p style=\"color: #6b7280; font-size: 14px; margin-bottom: 30px;\">" +
                "                If you did not request this, please ignore this email." +
                "            </p>" +
                "        </div>" +
                "    </div>" +
                "</div>";
        sendEmail(email, subject, htmlContent);
    }
}
