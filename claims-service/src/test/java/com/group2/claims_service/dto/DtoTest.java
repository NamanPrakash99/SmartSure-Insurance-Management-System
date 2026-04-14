package com.group2.claims_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DtoTest {

    @Test
    void testClaimResponseDTO() {
        ClaimResponseDTO dto = new ClaimResponseDTO();
        dto.setClaimId(1L);
        dto.setPolicyId(2L);
        dto.setUserId(3L);
        dto.setStatus("APPROVED");
        dto.setMessage("Msg");
        dto.setClaimAmount(1000.0);
        dto.setDescription("Desc");
        dto.setRemark("Remark");

        assertEquals(1L, dto.getClaimId());
        assertEquals(2L, dto.getPolicyId());
        assertEquals(3L, dto.getUserId());
        assertEquals("APPROVED", dto.getStatus());
        assertEquals("Msg", dto.getMessage());
        assertEquals(1000.0, dto.getClaimAmount());
        assertEquals("Desc", dto.getDescription());
        assertEquals("Remark", dto.getRemark());
    }

    @Test
    void testClaimStatsDTO() {
        ClaimStatsDTO dto = new ClaimStatsDTO();
        dto.setTotalClaims(10L);
        dto.setSubmittedClaims(3L);
        dto.setApprovedClaims(5L);
        dto.setRejectedClaims(2L);

        assertEquals(10L, dto.getTotalClaims());
        assertEquals(3L, dto.getSubmittedClaims());
        assertEquals(5L, dto.getApprovedClaims());
        assertEquals(2L, dto.getRejectedClaims());
    }

    @Test
    void testClaimCreatedEvent() {
        ClaimCreatedEvent dto = new ClaimCreatedEvent();
        dto.setClaimId(1L);
        dto.setPolicyId(2L);
        dto.setUserId(3L);
        dto.setClaimAmount(500.0);

        assertEquals(1L, dto.getClaimId());
        assertEquals(2L, dto.getPolicyId());
        assertEquals(3L, dto.getUserId());
        assertEquals(500.0, dto.getClaimAmount());
    }

    @Test
    void testClaimReviewEvent() {
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(1L);
        event.setStatus("APPROVED");
        event.setRemark("OK");

        assertEquals(1L, event.getClaimId());
        assertEquals("APPROVED", event.getStatus());
        assertEquals("OK", event.getRemark());
    }

    @Test
    void testUserPolicyResponseDTO() {
        UserPolicyResponseDTO dto = new UserPolicyResponseDTO();
        dto.setPolicyId(1L);
        dto.setPolicyName("Name");
        dto.setPremiumAmount(100.0);
        dto.setCoverageAmount(1000.0);

        assertEquals(1L, dto.getPolicyId());
        assertEquals("Name", dto.getPolicyName());
        assertEquals(100.0, dto.getPremiumAmount());
        assertEquals(1000.0, dto.getCoverageAmount());
    }
}
