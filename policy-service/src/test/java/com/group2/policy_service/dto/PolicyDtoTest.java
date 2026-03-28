package com.group2.policy_service.dto;

import com.group2.policy_service.entity.PolicyStatus;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

public class PolicyDtoTest {

    @Test
    public void testPolicyRequestDTO() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        dto.setPolicyName("Health");
        dto.setDescription("Desc");
        dto.setPremiumAmount(500.0);
        dto.setCoverageAmount(10000.0);
        dto.setDurationInMonths(12);
        dto.setPolicyTypeId(1L);

        assertEquals("Health", dto.getPolicyName());
        assertEquals("Desc", dto.getDescription());
        assertEquals(500.0, dto.getPremiumAmount());
        assertEquals(10000.0, dto.getCoverageAmount());
        assertEquals(12, dto.getDurationInMonths());
        assertEquals(1L, dto.getPolicyTypeId());
    }

    @Test
    public void testPolicyResponseDTO() {
        PolicyResponseDTO dto = new PolicyResponseDTO();
        dto.setId(1L);
        dto.setPolicyName("Health");
        dto.setDescription("Desc");
        dto.setPremiumAmount(500.0);
        dto.setCoverageAmount(10000.0);
        dto.setDurationInMonths(12);
        dto.setCategory("HEALTH");
        dto.setPolicyTypeId(1L);

        assertEquals(1L, dto.getId());
        assertEquals("Health", dto.getPolicyName());
        assertEquals("Desc", dto.getDescription());
        assertEquals(500.0, dto.getPremiumAmount());
        assertEquals(10000.0, dto.getCoverageAmount());
        assertEquals(12, dto.getDurationInMonths());
        assertEquals("HEALTH", dto.getCategory());
        assertEquals(1L, dto.getPolicyTypeId());
    }

    @Test
    public void testPolicyStatsDTO() {
        PolicyStatsDTO stats = new PolicyStatsDTO();
        stats.setTotalPolicies(10L);
        stats.setTotalRevenue(5000.0);

        assertEquals(10L, stats.getTotalPolicies());
        assertEquals(5000.0, stats.getTotalRevenue());
    }

    @Test
    public void testPurchasePolicyRequestDTO() {
        PurchasePolicyRequestDTO dto = new PurchasePolicyRequestDTO();
        dto.setPolicyId(1L);
        dto.setUserId(10L);

        assertEquals(1L, dto.getPolicyId());
        assertEquals(10L, dto.getUserId());
    }

    @Test
    public void testUserPolicyResponseDTO() {
        UserPolicyResponseDTO response = new UserPolicyResponseDTO();
        response.setId(100L);
        response.setUserId(1L);
        response.setPolicyName("Health");
        response.setStatus(PolicyStatus.ACTIVE);
        response.setPremiumAmount(500.0);
        response.setStartDate(LocalDate.now());
        response.setEndDate(LocalDate.now().plusMonths(12));
        response.setPolicyId(10L);

        assertEquals(100L, response.getId());
        assertEquals(1L, response.getUserId());
        assertEquals("Health", response.getPolicyName());
        assertEquals(PolicyStatus.ACTIVE, response.getStatus());
        assertEquals(500.0, response.getPremiumAmount());
        assertNotNull(response.getStartDate());
        assertNotNull(response.getEndDate());
        assertEquals(10L, response.getPolicyId());
    }
}
