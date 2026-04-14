package com.group2.policy_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DtoTest {

    @Test
    void testPolicyRequestDTO() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        dto.setPolicyName("Health");
        dto.setDescription("Desc");
        dto.setPremiumAmount(100.0);
        dto.setCoverageAmount(1000.0);
        dto.setDurationInMonths(12);
        dto.setPolicyTypeId(1L);

        assertEquals("Health", dto.getPolicyName());
        assertEquals("Desc", dto.getDescription());
        assertEquals(100.0, dto.getPremiumAmount());
        assertEquals(1000.0, dto.getCoverageAmount());
        assertEquals(12, dto.getDurationInMonths());
        assertEquals(1L, dto.getPolicyTypeId());
    }

    @Test
    void testPolicyResponseDTO() {
        PolicyResponseDTO dto = new PolicyResponseDTO();
        dto.setId(1L);
        dto.setPolicyName("Health");
        dto.setCoverageAmount(5000.0);
        dto.setPremiumAmount(500.0);
        dto.setDurationInMonths(12);
        dto.setDescription("Desc");
        dto.setCategory("CAT");
        dto.setPolicyTypeId(1L);

        assertEquals(1L, dto.getId());
        assertEquals("Health", dto.getPolicyName());
        assertEquals(5000.0, dto.getCoverageAmount());
        assertEquals(500.0, dto.getPremiumAmount());
        assertEquals(12, dto.getDurationInMonths());
        assertEquals("Desc", dto.getDescription());
        assertEquals("CAT", dto.getCategory());
        assertEquals(1L, dto.getPolicyTypeId());
    }

    @Test
    void testPolicyStatsDTO() {
        PolicyStatsDTO dto = new PolicyStatsDTO();
        dto.setTotalPolicies(10L);
        dto.setTotalRevenue(1000.0);

        assertEquals(10L, dto.getTotalPolicies());
        assertEquals(1000.0, dto.getTotalRevenue());
    }

    @Test
    void testPurchasePolicyRequestDTO() {
        PurchasePolicyRequestDTO dto = new PurchasePolicyRequestDTO();
        dto.setPolicyId(1L);
        dto.setUserId(2L);

        assertEquals(1L, dto.getPolicyId());
        assertEquals(2L, dto.getUserId());
    }

    @Test
    void testUserPolicyResponseDTO() {
        UserPolicyResponseDTO dto = new UserPolicyResponseDTO();
        dto.setId(1L);
        dto.setUserId(2L);
        dto.setPolicyId(3L);
        dto.setPolicyName("Name");
        dto.setPremiumAmount(100.0);
        dto.setCoverageAmount(1000.0);
        dto.setStatus(com.group2.policy_service.entity.PolicyStatus.ACTIVE);

        assertEquals(1L, dto.getId());
        assertEquals(2L, dto.getUserId());
        assertEquals(3L, dto.getPolicyId());
        assertEquals("Name", dto.getPolicyName());
        assertEquals(100.0, dto.getPremiumAmount());
        assertEquals(1000.0, dto.getCoverageAmount());
        assertEquals(com.group2.policy_service.entity.PolicyStatus.ACTIVE, dto.getStatus());
    }
}
