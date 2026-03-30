package com.group2.auth_service.service;

public interface OtpService {
    void sendOtp(String email);
    boolean verifyOtp(String email, String otp);
    void validateOtpBeforeRegister(String email);
}
