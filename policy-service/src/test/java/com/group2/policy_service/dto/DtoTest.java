package com.group2.policy_service.dto;

import com.group2.policy_service.entity.PolicyStatus;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

public class DtoTest {

    @Test
    public void testPolicyRequestDTO() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        dto.setPolicyName("Health");
        dto.setDescription("Health Insurance");
        dto.setPolicyTypeId(1L);
        dto.setPremiumAmount(500.0);
        dto.setCoverageAmount(10000.0);
        dto.setDurationInMonths(12);

        assertEquals("Health", dto.getPolicyName());
        assertEquals("Health Insurance", dto.getDescription());
        assertEquals(1L, dto.getPolicyTypeId());
        assertEquals(500.0, dto.getPremiumAmount());
        assertEquals(10000.0, dto.getCoverageAmount());
        assertEquals(12, dto.getDurationInMonths());
    }

    @Test
    public void testPolicyResponseDTO() {
        PolicyResponseDTO dto = new PolicyResponseDTO();
        dto.setId(1L);
        dto.setPolicyName("Term");
        dto.setDescription("Term Plan");
        dto.setPremiumAmount(200.0);
        dto.setCoverageAmount(50000.0);
        dto.setDurationInMonths(24);
        dto.setCategory("Life");
        dto.setPolicyTypeId(2L);

        assertEquals(1L, dto.getId());
        assertEquals("Term", dto.getPolicyName());
        assertEquals("Term Plan", dto.getDescription());
        assertEquals(200.0, dto.getPremiumAmount());
        assertEquals(50000.0, dto.getCoverageAmount());
        assertEquals(24, dto.getDurationInMonths());
        assertEquals("Life", dto.getCategory());
        assertEquals(2L, dto.getPolicyTypeId());
    }

    @Test
    public void testPolicyStatsDTO() {
        PolicyStatsDTO dto = new PolicyStatsDTO();
        dto.setTotalPolicies(100L);
        dto.setTotalRevenue(50000.0);

        assertEquals(100L, dto.getTotalPolicies());
        assertEquals(50000.0, dto.getTotalRevenue());
    }

    @Test
    public void testUserPolicyResponseDTO() {
        UserPolicyResponseDTO dto = new UserPolicyResponseDTO();
        dto.setId(1L);
        dto.setUserId(10L);
        dto.setPolicyName("Auto");
        dto.setStatus(PolicyStatus.ACTIVE);
        dto.setStartDate(LocalDate.now());
        dto.setEndDate(LocalDate.now().plusYears(1));
        dto.setPremiumAmount(300.0);
        dto.setCoverageAmount(20000.0);
        dto.setPolicyId(5L);
        dto.setNextPaymentDueDate(LocalDate.now().plusMonths(1));

        assertEquals(1L, dto.getId());
        assertEquals(10L, dto.getUserId());
        assertEquals("Auto", dto.getPolicyName());
        assertEquals(PolicyStatus.ACTIVE, dto.getStatus());
        assertNotNull(dto.getStartDate());
        assertNotNull(dto.getEndDate());
        assertEquals(300.0, dto.getPremiumAmount());
        assertEquals(20000.0, dto.getCoverageAmount());
        assertEquals(5L, dto.getPolicyId());
        assertNotNull(dto.getNextPaymentDueDate());
    }

    @Test
    public void testPurchasePolicyRequestDTO() {
        PurchasePolicyRequestDTO dto = new PurchasePolicyRequestDTO();
        dto.setPolicyId(1L);
        assertEquals(1L, dto.getPolicyId());
    }
}
