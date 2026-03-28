package com.group2.claims_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ClaimDtoTest {

    @Test
    public void testClaimRequestDTO() {
        ClaimRequestDTO dto = new ClaimRequestDTO();
        dto.setPolicyId(1L);
        dto.setUserId(2L);
        dto.setClaimAmount(500.0);
        dto.setDescription("Test");

        assertEquals(1L, dto.getPolicyId());
        assertEquals(2L, dto.getUserId());
        assertEquals(500.0, dto.getClaimAmount());
        assertEquals("Test", dto.getDescription());
    }

    @Test
    public void testClaimResponseDTO() {
        ClaimResponseDTO dto = new ClaimResponseDTO();
        dto.setClaimId(1L);
        dto.setStatus("APPROVED");
        dto.setClaimAmount(100.0);
        dto.setMessage("Ok");
        dto.setPolicyId(2L);
        dto.setUserId(3L);
        dto.setDescription("Desc");

        assertEquals(1L, dto.getClaimId());
        assertEquals("APPROVED", dto.getStatus());
        assertEquals(100.0, dto.getClaimAmount());
        assertEquals("Ok", dto.getMessage());
        assertEquals(2L, dto.getPolicyId());
        assertEquals(3L, dto.getUserId());
        assertEquals("Desc", dto.getDescription());
    }

    @Test
    public void testClaimCreatedEvent() {
        ClaimCreatedEvent event = new ClaimCreatedEvent();
        event.setClaimId(1L);
        event.setPolicyId(2L);
        event.setUserId(3L);
        event.setClaimAmount(100.0);

        assertEquals(1L, event.getClaimId());
        assertEquals(2L, event.getPolicyId());
        assertEquals(3L, event.getUserId());
        assertEquals(100.0, event.getClaimAmount());
    }

    @Test
    public void testClaimStatsDTO() {
        ClaimStatsDTO dto = new ClaimStatsDTO();
        dto.setTotalClaims(10L);
        dto.setSubmittedClaims(5L);
        dto.setApprovedClaims(3L);
        dto.setRejectedClaims(2L);

        assertEquals(10L, dto.getTotalClaims());
        assertEquals(5L, dto.getSubmittedClaims());
        assertEquals(3L, dto.getApprovedClaims());
        assertEquals(2L, dto.getRejectedClaims());
    }

    @Test
    public void testClaimReviewEvent() {
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(1L);
        event.setStatus("APPROVED");

        assertEquals(1L, event.getClaimId());
        assertEquals("APPROVED", event.getStatus());
    }

    @Test
    public void testClaimStatusUpdateDTO() {
        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("UNDER_REVIEW");
        assertEquals("UNDER_REVIEW", dto.getStatus());
    }
}
