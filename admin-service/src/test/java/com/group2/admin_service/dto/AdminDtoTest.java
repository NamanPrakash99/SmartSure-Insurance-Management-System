package com.group2.admin_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AdminDtoTest {

    @Test
    void testClaimStatusDTO() {
        ClaimStatusDTO dto = new ClaimStatusDTO();
        dto.setTotalClaims(10);
        dto.setApprovedClaims(5);
        dto.setRejectedClaims(5);

        assertEquals(10, dto.getTotalClaims());
        assertEquals(5, dto.getApprovedClaims());
        assertEquals(5, dto.getRejectedClaims());
    }

    @Test
    void testPolicyStatsDTO() {
        PolicyStatsDTO dto = new PolicyStatsDTO();
        dto.setTotalPolicies(20L);
        dto.setTotalRevenue(1000.0);

        assertEquals(20L, dto.getTotalPolicies());
        assertEquals(1000.0, dto.getTotalRevenue());
    }

    @Test
    void testReportResponse() {
        ReportResponse response = new ReportResponse();
        response.setTotalClaims(10);
        response.setTotalPolicies(20);
        response.setTotalRevenue(1000.0);
        response.setApprovedClaims(6);
        response.setRejectedClaims(4);

        assertEquals(10, response.getTotalClaims());
        assertEquals(20, response.getTotalPolicies());
        assertEquals(1000.0, response.getTotalRevenue());
        assertEquals(6, response.getApprovedClaims());
        assertEquals(4, response.getRejectedClaims());
    }

    @Test
    void testReviewRequest() {
        ReviewRequest request = new ReviewRequest();
        request.setStatus("APPROVED");
        assertEquals("APPROVED", request.getStatus());
    }

    @Test
    void testPolicyDTO() {
        PolicyDTO dto = new PolicyDTO();
        dto.setId(1L);
        dto.setPolicyName("Health");
        dto.setPremiumAmount(500.0);
        dto.setDurationInMonths(12);
        dto.setCoverageAmount(10000.0);

        assertEquals(1L, dto.getId());
        assertEquals("Health", dto.getPolicyName());
        assertEquals(500.0, dto.getPremiumAmount());
        assertEquals(12, dto.getDurationInMonths());
        assertEquals(10000.0, dto.getCoverageAmount());
    }

    @Test
    void testClaimDTO() {
        ClaimDTO dto = new ClaimDTO();
        dto.setClaimId(1L);
        dto.setUserId(10L);
        dto.setClaimAmount(500.0);
        dto.setStatus("PENDING");
        dto.setDescription("Test");

        assertEquals(1L, dto.getClaimId());
        assertEquals(10L, dto.getUserId());
        assertEquals(500.0, dto.getClaimAmount());
        assertEquals("PENDING", dto.getStatus());
        assertEquals("Test", dto.getDescription());
    }

    @Test
    void testPageResponse() {
        PageResponse<String> response = new PageResponse<>();
        java.util.List<String> content = java.util.Collections.singletonList("item");
        response.setContent(content);
        response.setTotalElements(1L);
        response.setTotalPages(1);
        response.setNumber(0);
        response.setSize(10);

        assertEquals(content, response.getContent());
        assertEquals(1L, response.getTotalElements());
        assertEquals(1, response.getTotalPages());
        assertEquals(0, response.getNumber());
        assertEquals(10, response.getSize());
    }

    @Test
    void testClaimReviewEvent() {
        ClaimReviewEvent event = new ClaimReviewEvent();
        event.setClaimId(1L);
        event.setStatus("APPROVED");

        assertEquals(1L, event.getClaimId());
        assertEquals("APPROVED", event.getStatus());
    }

    @Test
    void testPolicyRequestDTO() {
        PolicyRequestDTO dto = new PolicyRequestDTO();
        dto.setPolicyName("Policy X");
        dto.setPremiumAmount(100.0);
        dto.setCoverageAmount(5000.0);
        dto.setDescription("Desc");
        dto.setPolicyTypeId(2L);

        assertEquals("Policy X", dto.getPolicyName());
        assertEquals(100.0, dto.getPremiumAmount());
        assertEquals(5000.0, dto.getCoverageAmount());
        assertEquals("Desc", dto.getDescription());
        assertEquals(2L, dto.getPolicyTypeId());
    }

    @Test
    void testClaimCreatedEvent() {
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
    void testClaimStatusUpdateDTO() {
        ClaimStatusUpdateDTO dto = new ClaimStatusUpdateDTO();
        dto.setStatus("APPROVED");
        assertEquals("APPROVED", dto.getStatus());
    }
}
