package com.group2.auth_service.service.impl;


import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.group2.auth_service.entity.Otp;
import com.group2.auth_service.exception.OtpException;
import com.group2.auth_service.exception.UserAlreadyExistsException;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.repository.OtpRepository;
import com.group2.auth_service.service.EmailService;
import com.group2.auth_service.service.OtpService;

@Service
@Transactional
public class OtpServiceImpl implements OtpService {

    private final OtpRepository otpRepository;
    private final AuthServiceRepository authServiceRepository;
    private final EmailService emailService;

    public OtpServiceImpl(OtpRepository otpRepository, 
                      AuthServiceRepository authServiceRepository,
                      EmailService emailService) {
        this.otpRepository = otpRepository;
        this.authServiceRepository = authServiceRepository;
        this.emailService = emailService;
    }

    // 🔹 Generate & Send OTP
    public void sendOtp(String email) {

        if (authServiceRepository.findByEmail(email.toLowerCase()).isPresent()) {
            throw new UserAlreadyExistsException("User with email " + email + " is already registered.");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        // delete old OTP if exists
        otpRepository.deleteByEmail(email);

        Otp otpEntity = new Otp();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setVerified(false);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(10));

        otpRepository.save(otpEntity);

        emailService.sendOtpEmail(email, otp);
    }

    // 🔹 Verify OTP
    public boolean verifyOtp(String email, String otp) {

        Otp otpEntity = otpRepository.findByEmail(email)
                .orElseThrow(() -> new OtpException("OTP not found"));

        if (otpEntity.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new OtpException("OTP expired");
        }

        if (!otpEntity.getOtp().equals(otp)) {
            throw new OtpException("Invalid OTP");
        }

        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);

        return true;
    }

    // 🔹 Validate before registration
    public void validateOtpBeforeRegister(String email) {

        if (authServiceRepository.findByEmail(email).isPresent()) {
            throw new UserAlreadyExistsException("User with email " + email + " is already registered.");
        }

        Otp otp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new OtpException("OTP not found"));

        if (!otp.isVerified()) {
            throw new OtpException("OTP not verified");
        }
    }
}
