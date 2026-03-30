package com.group2.auth_service.consumer;

import com.group2.auth_service.dto.event.ClaimCreatedEvent;
import com.group2.auth_service.dto.event.ClaimReviewEvent;
import com.group2.auth_service.dto.event.PaymentStatusEvent;
import com.group2.auth_service.entity.User;
import com.group2.auth_service.feign.ClaimsFeignClient;
import com.group2.auth_service.feign.PolicyFeignClient;
import com.group2.auth_service.repository.AuthServiceRepository;
import com.group2.auth_service.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class NotificationConsumerTest {

    @Mock
    private EmailService emailService;

    @Mock
    private AuthServiceRepository userRepository;

    @Mock
    private ClaimsFeignClient claimsFeignClient;

    @Mock
    private PolicyFeignClient policyFeignClient;

    @InjectMocks
    private NotificationConsumer notificationConsumer;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testConsumePaymentStatus_Success() {
        // Arrange
        PaymentStatusEvent event = new PaymentStatusEvent();
        event.setUserPolicyId(1L);
        event.setStatus("SUCCESS");
        event.setPaymentId("PAY123");

        Map<String, Object> userPolicy = new HashMap<>();
        userPolicy.put("userId", 100L);
        userPolicy.put("policyName", "Term Insurance");

        User user = new User();
        user.setId(100L);
        user.setName("John Doe");
        user.setEmail("john@example.com");

        when(policyFeignClient.getUserPolicyById(1L)).thenReturn(userPolicy);
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));

        // Act
        notificationConsumer.consumePaymentStatus(event);

        // Assert
        verify(emailService, times(1)).sendEmail(eq("john@example.com"), anyString(), anyString());
    }

    @Test
    public void testConsumeClaimCreated() {
        // Arrange
        ClaimCreatedEvent event = new ClaimCreatedEvent();
        event.setUserId(100L);
        event.setClaimId(500L);
        event.setClaimAmount(5000.0);

        User user = new User();
        user.setId(100L);
        user.setName("John Doe");
        user.setEmail("john@example.com");

        when(userRepository.findById(100L)).thenReturn(Optional.of(user));

        // Act
        notificationConsumer.consumeClaimCreated(event);

        // Assert
        verify(emailService, times(1)).sendEmail(eq("john@example.com"), anyString(), anyString());
    }

    @Test
    public void testConsumeClaimReview_Approved() {
        // Arrange
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(500L);
        event.setStatus("APPROVED");

        Map<String, Object> claimDetails = new HashMap<>();
        claimDetails.put("userId", 100L);

        User user = new User();
        user.setId(100L);
        user.setName("John Doe");
        user.setEmail("john@example.com");

        when(claimsFeignClient.getClaimById(500L)).thenReturn(claimDetails);
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));

        // Act
        notificationConsumer.consumeClaimReview(event);

        // Assert
        verify(emailService, times(1)).sendEmail(eq("john@example.com"), anyString(), anyString());
    }

    @Test
    public void testConsumeClaimReview_Rejected() {
        // Arrange
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(500L);
        event.setStatus("REJECTED");

        Map<String, Object> claimDetails = new HashMap<>();
        claimDetails.put("userId", 100L);

        User user = new User();
        user.setId(100L);
        user.setName("John Doe");
        user.setEmail("john@example.com");

        when(claimsFeignClient.getClaimById(500L)).thenReturn(claimDetails);
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));

        // Act
        notificationConsumer.consumeClaimReview(event);

        // Assert
        verify(emailService, times(1)).sendEmail(eq("john@example.com"), anyString(), anyString());
    }
}
