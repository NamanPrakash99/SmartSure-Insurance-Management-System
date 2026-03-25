package com.group2.policy_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.group2.policy_service.dto.PolicyResponseDTO;
import com.group2.policy_service.dto.PolicyStatsDTO;
import com.group2.policy_service.dto.UserPolicyResponseDTO;
import com.group2.policy_service.entity.Policy;
import com.group2.policy_service.entity.PolicyStatus;
import com.group2.policy_service.entity.PolicyType;
import com.group2.policy_service.entity.UserPolicy;
import com.group2.policy_service.repository.PolicyRepository;
import com.group2.policy_service.repository.PolicyTypeRepository;
import com.group2.policy_service.repository.UserPolicyRepository;

@ExtendWith(MockitoExtension.class)
public class PolicyQueryServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private UserPolicyRepository userPolicyRepository;

    @Mock
    private PolicyTypeRepository policyTypeRepository;

    @InjectMocks
    private PolicyQueryService policyQueryService;

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

    @Test
    void testGetPoliciesByUserId() {
        when(userPolicyRepository.findByUserId(100L)).thenReturn(Collections.singletonList(mockUserPolicy));

        List<UserPolicyResponseDTO> result = policyQueryService.getPoliciesByUserId(100L);

        assertEquals(1, result.size());
        assertEquals(5L, result.get(0).getId());
    }

    @Test
    void testGetAllPolicies() {
        when(policyRepository.findByActiveTrue()).thenReturn(Collections.singletonList(mockPolicy));

        List<PolicyResponseDTO> result = policyQueryService.getAllPolicies();

        assertEquals(1, result.size());
        assertEquals("Health Plan", result.get(0).getPolicyName());
    }

    @Test
    void testGetAllPolicyTypes() {
        when(policyTypeRepository.findAll()).thenReturn(Arrays.asList(new PolicyType(), new PolicyType()));

        List<PolicyType> types = policyQueryService.getAllPolicyTypes();

        assertEquals(2, types.size());
    }

    @Test
    void testGetPolicyById() {
        when(policyRepository.findById(10L)).thenReturn(Optional.of(mockPolicy));

        PolicyResponseDTO result = policyQueryService.getPolicyById(10L);

        assertEquals(10L, result.getId());
        assertEquals("Health Plan", result.getPolicyName());
    }

    @Test
    void testGetPolicyStats() {
        when(userPolicyRepository.count()).thenReturn(15L);
        when(userPolicyRepository.sumPremiumAmount()).thenReturn(5000.0);

        PolicyStatsDTO stats = policyQueryService.getPolicyStats();

        assertEquals(15L, stats.getTotalPolicies());
        assertEquals(5000.0, stats.getTotalRevenue());
    }
}
