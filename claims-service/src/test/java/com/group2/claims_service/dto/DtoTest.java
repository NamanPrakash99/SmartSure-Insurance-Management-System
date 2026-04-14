package com.group2.claims_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DtoTest {

    @Test
    void testClaimRequestDTO() {
        ClaimRequestDTO dto = new ClaimRequestDTO();
        dto.setPolicyId(1L);
        dto.setUserId(1L);
        dto.setClaimAmount(100.0);
        dto.setDescription("Test");

        assertEquals(1L, dto.getPolicyId());
        assertEquals(1L, dto.getUserId());
        assertEquals(100.0, dto.getClaimAmount());
        assertEquals("Test", dto.getDescription());
    }

    @Test
    void testClaimResponseDTO() {
        ClaimResponseDTO dto = new ClaimResponseDTO();
        dto.setClaimId(1L);
        dto.setPolicyId(2L);
        dto.setUserId(3L);
        dto.setStatus("APPROVED");
        dto.setMessage("Ok");
        dto.setClaimAmount(500.0);
        dto.setDescription("Desc");
        dto.setRemark("Remark");

        assertEquals(1L, dto.getClaimId());
        assertEquals(2L, dto.getPolicyId());
        assertEquals(3L, dto.getUserId());
        assertEquals("APPROVED", dto.getStatus());
        assertEquals("Ok", dto.getMessage());
        assertEquals(500.0, dto.getClaimAmount());
        assertEquals("Desc", dto.getDescription());
        assertEquals("Remark", dto.getRemark());
    }

    @Test
    void testClaimCreatedEvent() {
        ClaimCreatedEvent event = new ClaimCreatedEvent();
        event.setClaimId(1L);
        event.setUserId(2L);
        event.setPolicyId(3L);
        event.setClaimAmount(100.0);

        assertEquals(1L, event.getClaimId());
        assertEquals(2L, event.getUserId());
        assertEquals(3L, event.getPolicyId());
        assertEquals(100.0, event.getClaimAmount());
    }

    @Test
    void testClaimReviewEvent() {
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(1L);
        event.setStatus("REJECTED");
        event.setRemark("No proof");

        assertEquals(1L, event.getClaimId());
        assertEquals("REJECTED", event.getStatus());
        assertEquals("No proof", event.getRemark());
    }

    @Test
    void testClaimStatsDTO() {
        ClaimStatsDTO dto = new ClaimStatsDTO();
        dto.setTotalClaims(10L);
        dto.setSubmittedClaims(2L);
        dto.setApprovedClaims(7L);
        dto.setRejectedClaims(1L);

        assertEquals(10L, dto.getTotalClaims());
        assertEquals(2L, dto.getSubmittedClaims());
        assertEquals(7L, dto.getApprovedClaims());
        assertEquals(1L, dto.getRejectedClaims());
    }

    @Test
    void testClaimStatusUpdateDTO() {
        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("CLOSED");
        dto.setRemark("Finished");

        assertEquals("CLOSED", dto.getStatus());
        assertEquals("Finished", dto.getRemark());
    }

    @Test
    void testUserPolicyResponseDTO() {
        UserPolicyResponseDTO dto = new UserPolicyResponseDTO();
        dto.setId(1L);
        dto.setUserId(2L);
        dto.setPolicyId(3L);
        dto.setStatus("ACTIVE");
        dto.setPolicyName("Name");
        dto.setPremiumAmount(100.0);
        dto.setCoverageAmount(1000.0);
        dto.setStartDate(java.time.LocalDate.now());
        dto.setEndDate(java.time.LocalDate.now().plusYears(1));
        dto.setNextPaymentDueDate(java.time.LocalDate.now().plusMonths(1));

        assertEquals(1L, dto.getId());
        assertEquals(2L, dto.getUserId());
        assertEquals(3L, dto.getPolicyId());
        assertEquals("ACTIVE", dto.getStatus());
        assertEquals("Name", dto.getPolicyName());
        assertEquals(100.0, dto.getPremiumAmount());
        assertEquals(1000.0, dto.getCoverageAmount());
        assertNotNull(dto.getStartDate());
        assertNotNull(dto.getEndDate());
        assertNotNull(dto.getNextPaymentDueDate());
    }
}
