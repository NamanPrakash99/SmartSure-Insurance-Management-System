package com.group2.policy_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.group2.policy_service.config.RabbitConfig;
import com.group2.policy_service.dto.PolicyRequestDTO;
import com.group2.policy_service.dto.PolicyResponseDTO;
import com.group2.policy_service.dto.UserPolicyResponseDTO;
import com.group2.policy_service.dto.event.PolicyPurchaseEvent;
import com.group2.policy_service.entity.Policy;
import com.group2.policy_service.entity.PolicyStatus;
import com.group2.policy_service.entity.PolicyType;
import com.group2.policy_service.entity.UserPolicy;
import com.group2.policy_service.repository.PolicyRepository;
import com.group2.policy_service.repository.PolicyTypeRepository;
import com.group2.policy_service.repository.UserPolicyRepository;

@ExtendWith(MockitoExtension.class)
public class PolicyCommandServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private UserPolicyRepository userPolicyRepository;

    @Mock
    private PolicyTypeRepository policyTypeRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private PolicyCommandService policyCommandService;

    private Policy mockPolicy;
    private UserPolicy mockUserPolicy;

    @BeforeEach
    void setUp() {
        mockPolicy = new Policy();
        mockPolicy.setId(10L);
        mockPolicy.setPolicyName("Health Plan");
        mockPolicy.setDurationInMonths(12);
        mockPolicy.setPremiumAmount(100.0);

        mockUserPolicy = new UserPolicy();
        mockUserPolicy.setId(5L);
        mockUserPolicy.setPolicy(mockPolicy);
        mockUserPolicy.setUserId(100L);
        mockUserPolicy.setStatus(PolicyStatus.ACTIVE);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testPurchasePolicy() {
        // Mock Security Context
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(100L); // Current user ID
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        when(policyRepository.findById(10L)).thenReturn(Optional.of(mockPolicy));
        when(userPolicyRepository.existsByUserIdAndPolicyIdAndStatus(100L, 10L, PolicyStatus.ACTIVE)).thenReturn(false);
        when(userPolicyRepository.save(any(UserPolicy.class))).thenReturn(mockUserPolicy);

        UserPolicyResponseDTO response = policyCommandService.purchasePolicy(10L);

        assertNotNull(response);
        assertEquals(100L, response.getUserId());
        assertEquals("Health Plan", response.getPolicyName());
        verify(userPolicyRepository, times(1)).save(any(UserPolicy.class));
        verify(rabbitTemplate, times(1)).convertAndSend(eq(RabbitConfig.EXCHANGE), eq(RabbitConfig.PURCHASE_ROUTING_KEY), any(PolicyPurchaseEvent.class));
    }

    @Test
    void testCreatePolicy_Success() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        dto.setPolicyTypeId(1L);
        dto.setPolicyName("New Plan");
        
        when(policyTypeRepository.findById(1L)).thenReturn(Optional.of(new PolicyType()));
        when(policyRepository.save(any(Policy.class))).thenReturn(mockPolicy);

        PolicyResponseDTO response = policyCommandService.createPolicy(dto);

        assertNotNull(response);
        assertEquals("Health Plan", response.getPolicyName()); // mockPolicy has "Health Plan"
        verify(policyRepository, times(1)).save(any(Policy.class));
    }

    @Test
    void testUpdatePolicy() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        dto.setPolicyName("Updated Plan");

        when(policyRepository.findById(10L)).thenReturn(Optional.of(mockPolicy));
        
        PolicyResponseDTO response = policyCommandService.updatePolicy(10L, dto);

        assertEquals("Updated Plan", response.getPolicyName());
        verify(policyRepository, times(1)).save(mockPolicy);
    }

    @Test
    void testDeletePolicy() {
        when(policyRepository.findById(10L)).thenReturn(Optional.of(mockPolicy));

        policyCommandService.deletePolicy(10L);

        assertEquals(false, mockPolicy.isActive());
        verify(policyRepository, times(1)).save(mockPolicy);
    }

    @Test
    void testCancelPolicy_Success() {
        when(userPolicyRepository.findById(5L)).thenReturn(Optional.of(mockUserPolicy));

        UserPolicyResponseDTO response = policyCommandService.cancelPolicy(5L);

        assertEquals(PolicyStatus.CANCELLED, response.getStatus());
        verify(userPolicyRepository, times(1)).save(mockUserPolicy);
    }

    @Test
    void testCancelPolicy_NotActive() {
        mockUserPolicy.setStatus(PolicyStatus.CANCELLED);
        when(userPolicyRepository.findById(5L)).thenReturn(Optional.of(mockUserPolicy));

        assertThrows(RuntimeException.class, () -> policyCommandService.cancelPolicy(5L));
    }

    @Test
    void testRenewPolicy() {
        when(userPolicyRepository.findById(5L)).thenReturn(Optional.of(mockUserPolicy));
        mockUserPolicy.setStatus(PolicyStatus.EXPIRED);

        UserPolicyResponseDTO response = policyCommandService.renewPolicy(5L);

        assertEquals(PolicyStatus.ACTIVE, response.getStatus());
        verify(userPolicyRepository, times(1)).save(mockUserPolicy);
    }
}
