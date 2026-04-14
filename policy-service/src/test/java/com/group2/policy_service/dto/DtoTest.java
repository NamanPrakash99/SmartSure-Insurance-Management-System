package com.group2.policy_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DtoTest {

    @Test
    public void testPolicyRequestDTO() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        dto.setPolicyName("Name");
        dto.setPolicyTypeId(1L);
        dto.setCoverageAmount(100.0);
        dto.setPremiumAmount(10.0);
        dto.setDurationInMonths(12);
        dto.setDescription("Desc");
        
        assertEquals("Name", dto.getPolicyName());
        assertEquals(1L, dto.getPolicyTypeId());
        assertEquals(100.0, dto.getCoverageAmount());
        assertEquals(10.0, dto.getPremiumAmount());
        assertEquals(12, dto.getDurationInMonths());
        assertEquals("Desc", dto.getDescription());
    }

    @Test
    public void testPolicyResponseDTO() {
        PolicyResponseDTO dto = new PolicyResponseDTO();
        dto.setPolicyId(1L);
        dto.setPolicyName("Name");
        dto.setPolicyTypeId(2L);
        dto.setCoverageAmount(100.0);
        dto.setPremiumAmount(10.0);
        dto.setDurationInMonths(12);
        dto.setDescription("Desc");
        
        assertEquals(1L, dto.getPolicyId());
        assertEquals("Name", dto.getPolicyName());
        assertEquals(2L, dto.getPolicyTypeId());
        assertEquals(100.0, dto.getCoverageAmount());
        assertEquals(10.0, dto.getPremiumAmount());
        assertEquals(12, dto.getDurationInMonths());
        assertEquals("Desc", dto.getDescription());
    }

    @Test
    public void testPolicyStatsDTO() {
        PolicyStatsDTO dto = new PolicyStatsDTO();
        dto.setTotalPolicies(10L);
        dto.setTotalActivePolicies(5L);
        dto.setTotalRevenue(1000.0);
        
        assertEquals(10L, dto.getTotalPolicies());
        assertEquals(5L, dto.getTotalActivePolicies());
        assertEquals(1000.0, dto.getTotalRevenue());
    }

    @Test
    public void testPurchasePolicyRequestDTO() {
        PurchasePolicyRequestDTO dto = new PurchasePolicyRequestDTO();
        dto.setUserId(1L);
        dto.setPolicyId(2L);
        
        assertEquals(1L, dto.getUserId());
        assertEquals(2L, dto.getPolicyId());
    }

    @Test
    public void testUserPolicyResponseDTO() {
        UserPolicyResponseDTO dto = new UserPolicyResponseDTO();
        dto.setUserPolicyId(1L);
        dto.setUserId(2L);
        dto.setPolicyId(3L);
        dto.setPolicyName("Name");
        dto.setPolicyTypeId(4L);
        dto.setPremiumAmount(10.0);
        dto.setCoverageAmount(100.0);
        dto.setStatus("ACTIVE");
        dto.setPurchaseDate(java.time.LocalDateTime.now());
        dto.setExpiryDate(java.time.LocalDateTime.now().plusMonths(12));
        
        assertEquals(1L, dto.getUserPolicyId());
        assertEquals(2L, dto.getUserId());
        assertEquals(3L, dto.getPolicyId());
        assertEquals("Name", dto.getPolicyName());
        assertEquals(4L, dto.getPolicyTypeId());
        assertEquals("ACTIVE", dto.getStatus());
        assertNotNull(dto.getPurchaseDate());
        assertNotNull(dto.getExpiryDate());
    }
}
