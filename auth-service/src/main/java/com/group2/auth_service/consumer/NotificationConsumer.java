package com.group2.auth_service.consumer;

import com.group2.auth_service.config.RabbitConfig;
import com.group2.auth_service.dto.event.ClaimCreatedEvent;
import com.group2.auth_service.dto.event.ClaimReviewEvent;
import com.group2.auth_service.dto.event.PaymentStatusEvent;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.feign.ClaimsFeignClient;
import com.group2.auth_service.feign.PolicyFeignClient;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    private final EmailService emailService;
    private final AuthServiceRepository userRepository;
    private final ClaimsFeignClient claimsFeignClient;
    private final PolicyFeignClient policyFeignClient;

    public NotificationConsumer(EmailService emailService, 
                               AuthServiceRepository userRepository,
                               ClaimsFeignClient claimsFeignClient,
                               PolicyFeignClient policyFeignClient) {
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.claimsFeignClient = claimsFeignClient;
        this.policyFeignClient = policyFeignClient;
    }

    // @RabbitListener(queues = RabbitConfig.AUTH_POLICY_STATUS_QUEUE)
    public void consumePaymentStatus(PaymentStatusEvent event) {
        if ("SUCCESS".equalsIgnoreCase(event.getStatus())) {
            try {
                // To get userId, we fetch UserPolicy details from policy-service
                Map<String, Object> userPolicy = policyFeignClient.getUserPolicyById(event.getUserPolicyId());
                if (userPolicy != null && userPolicy.get("userId") != null) {
                    Long userId = Long.valueOf(userPolicy.get("userId").toString());
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        String policyName = userPolicy.get("policyName") != null ? userPolicy.get("policyName").toString() : "Policy";
                        String subject = "Policy Purchase Successful - SmartSure";
                        String body = "Hello " + user.getName() + ",\n\nCongratulations! Your purchase of " + policyName + 
                                     " has been processed successfully.\n\nPolicy Status: ACTIVE\nPayment ID: " + event.getPaymentId() +
                                     "\n\nThank you for choosing SmartSure!";
                        emailService.sendEmail(user.getEmail(), subject, body);
                    }
                }
            } catch (Exception e) {
                logger.error("❌ Error processing payment notification: {}", e.getMessage());
            }
        }
    }

    // @RabbitListener(queues = RabbitConfig.AUTH_CLAIM_CREATED_QUEUE)
    public void consumeClaimCreated(ClaimCreatedEvent event) {
        try {
            User user = userRepository.findById(event.getUserId()).orElse(null);
            if (user != null) {
                String subject = "Claim Successfully Filed - SmartSure";
                String body = "Hello " + user.getName() + ",\n\nYour claim (ID: " + event.getClaimId() + 
                             ") has been successfully filed and is now under review.\n\nClaim Amount: ₹" + event.getClaimAmount() +
                             "\n\nWe will notify you once the status is updated by our admin.";
                emailService.sendEmail(user.getEmail(), subject, body);
            }
        } catch (Exception e) {
            logger.error("❌ Error processing claim created notification: {}", e.getMessage());
        }
    }

    // @RabbitListener(queues = RabbitConfig.AUTH_CLAIM_REVIEW_QUEUE)
    public void consumeClaimReview(ClaimReviewEvent event) {
        try {
            // Get userId from claim details
            Map<String, Object> claimDetails = claimsFeignClient.getClaimById(event.getClaimId());
            if (claimDetails != null && claimDetails.get("userId") != null) {
                Long userId = Long.valueOf(claimDetails.get("userId").toString());
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    String statusStr = event.getStatus().equalsIgnoreCase("APPROVED") ? "✅ APPROVED" : "❌ REJECTED";
                    String subject = "Claim Status Update - " + event.getStatus() + " - SmartSure";
                    String body = "Hello " + user.getName() + ",\n\nYour claim (ID: " + event.getClaimId() + 
                                 ") status has been updated.\n\nNew Status: " + statusStr +
                                 "\n\nPlease login to your account for more details.";
                    emailService.sendEmail(user.getEmail(), subject, body);
                }
            }
        } catch (Exception e) {
            logger.error("❌ Error processing claim review notification: {}", e.getMessage());
        }
    }
}

