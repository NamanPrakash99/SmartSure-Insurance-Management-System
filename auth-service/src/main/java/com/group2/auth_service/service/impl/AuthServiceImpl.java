package com.group2.auth_service.service.impl;

import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import com.group2.auth_service.dto.AuthResponse;
import com.group2.auth_service.dto.LoginRequest;
import com.group2.auth_service.dto.RegisterRequest;
import com.group2.auth_service.dto.UpdateProfileRequest;
import com.group2.auth_service.entity.Role;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.repository.PasswordResetTokenRepository;
import com.group2.auth_service.entity.RefreshToken;
import com.group2.auth_service.security.JwtUtil;
import com.group2.auth_service.service.AuthService;
import com.group2.auth_service.service.EmailService;
import com.group2.auth_service.service.RefreshTokenService;

@Service
public class AuthServiceImpl implements AuthService {

	private final AuthServiceRepository userRepository;
	private final PasswordResetTokenRepository tokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final RefreshTokenService refreshTokenService;
	private final EmailService emailService;

	public AuthServiceImpl(AuthServiceRepository userRepository, 
	                  PasswordResetTokenRepository tokenRepository,
	                  PasswordEncoder passwordEncoder, 
	                  JwtUtil jwtUtil,
	                  RefreshTokenService refreshTokenService,
	                  EmailService emailService) {
		this.userRepository = userRepository;
		this.tokenRepository = tokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
		this.refreshTokenService = refreshTokenService;
		this.emailService = emailService;
	}
	
	@PostConstruct
	public void initAdmin() {
		Optional<User> adminOpt = userRepository.findByEmail("admin@capgemini.com");
		if (adminOpt.isEmpty()) {
			User admin = new User();
			admin.setName("Admin");
			admin.setEmail("admin@capgemini.com");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setRole(Role.ADMIN);
			admin.setPhone("0000000000"); 
			admin.setAddress("Admin Address");
			userRepository.save(admin);
		}
	}

    @Transactional
	public User register(RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            throw new com.group2.auth_service.exception.UserAlreadyExistsException("Email is already registered.");
        } 
        
        // Password Validation
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
        }
        if (!request.getPassword().matches(".*\\d.*")) {
            throw new RuntimeException("Password must contain at least one number.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));    
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(Role.CUSTOMER); 
        
        return userRepository.save(user);
	}

	public AuthResponse login(LoginRequest request) {
	    String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
	    System.out.println("Login attempt for email: '" + email + "'");
	    
	    Optional<User> userOpt = userRepository.findByEmail(email);
	    
	    if (userOpt.isEmpty()) {
	        userOpt = userRepository.findByEmail(request.getEmail());
	    }
	    
	    if (userOpt.isEmpty()) {
	    	System.out.println("Login Failed: User not found for email: " + email);
	    	throw new RuntimeException("Invalid credentials: User not found. Please register first.");
	    }
	    
	    User user = userOpt.get();        

		if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
			RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
			return new AuthResponse(token, refreshToken.getToken(), user.getRole().name(), user.getId(), user.getName());
		} else {
			System.out.println("Login Failed: Password does not match for email: " + email);
			throw new RuntimeException("Invalid credentials: Password is incorrect.");
		}
	}

	public User getUserById(Long id) {
	    return userRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
	}

    @Transactional
    public void forgotPassword(String email) {
        // Handle case-insensitivity by looking up by lowercase if your DB doesn't handle it
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseGet(() -> userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found with the email: " + email)));

        // Delete existing tokens if any
        tokenRepository.deleteByUser(user);

        // Generate token
        String token = java.util.UUID.randomUUID().toString();
        com.group2.auth_service.entity.PasswordResetToken resetToken = 
                new com.group2.auth_service.entity.PasswordResetToken(token, user);
        
        tokenRepository.save(resetToken);

        // SEND REAL EMAIL VIA BREVO
        emailService.sendResetPasswordEmail(user.getEmail(), token);

        System.out.println("Password reset link sent to: " + user.getEmail());
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        com.group2.auth_service.entity.PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete token after successful reset
        tokenRepository.delete(resetToken);
    }

    public java.util.List<User> getAllCustomers() {
        return userRepository.findByRole(Role.CUSTOMER);
    }

    @jakarta.transaction.Transactional
    public User updateUser(Long id, UpdateProfileRequest updateRequest) {
        User user = getUserById(id);
        user.setName(updateRequest.getName());
        user.setPhone(updateRequest.getPhone());
        user.setAddress(updateRequest.getAddress());
        return userRepository.save(user);
    }
}
