package com.group2.auth_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.group2.auth_service.dto.AuthResponse;
import com.group2.auth_service.dto.LoginRequest;
import com.group2.auth_service.dto.RegisterRequest;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.dto.TokenRefreshRequest;
import com.group2.auth_service.dto.TokenRefreshResponse;
import com.group2.auth_service.entity.RefreshToken;
import com.group2.auth_service.service.AuthService;
import com.group2.auth_service.service.OtpService;
import com.group2.auth_service.service.RefreshTokenService;
import com.group2.auth_service.security.JwtUtil;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	
	private final OtpService otpService;
	private final AuthService service;
	private final RefreshTokenService refreshTokenService;
	private final JwtUtil jwtUtil;

	public AuthController(AuthService service, OtpService otpService, RefreshTokenService refreshTokenService, JwtUtil jwtUtil) {
		this.service = service;
		this.otpService = otpService;
		this.refreshTokenService = refreshTokenService;
		this.jwtUtil = jwtUtil;
	}
	

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
    
    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
	    	otpService.validateOtpBeforeRegister(request.getEmail());
	    	return ResponseEntity.ok(service.register(request));
    }
    
    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam String email) {
        otpService.sendOtp(email);
        return "OTP sent to email";
    }
    
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam String email,
                            @RequestParam String otp) {

        otpService.verifyOtp(email, otp);
        return "OTP verified successfully";
    }

    @org.springframework.web.bind.annotation.GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@org.springframework.web.bind.annotation.PathVariable Long id) {
        return ResponseEntity.ok(service.getUserById(id));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        service.forgotPassword(email);
        return ResponseEntity.ok("Recovery email sent successfully (Simulated)");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody com.group2.auth_service.dto.ResetPasswordRequest request) {
        service.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successfully");
    }

    @org.springframework.web.bind.annotation.GetMapping("/customers")
    public java.util.List<User> getAllCustomers() {
        return service.getAllCustomers();
    }
    @org.springframework.web.bind.annotation.PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@org.springframework.web.bind.annotation.PathVariable Long id, @Valid @RequestBody com.group2.auth_service.dto.UpdateProfileRequest request) {
        return ResponseEntity.ok(service.updateUser(id, request));
    }
}
