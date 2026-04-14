package com.group2.admin_service.dto;

import org.junit.jupiter.api.Test;
import java.util.Collections;
import static org.junit.jupiter.api.Assertions.*;

class DtoTest {

    @Test
    void testClaimDTO() {
        ClaimDTO dto = new ClaimDTO();
        dto.setClaimId(1L);
        dto.setPolicyId(2L);
        dto.setUserId(3L);
        dto.setStatus("PENDING");
        dto.setMessage("Msg");
        dto.setClaimAmount(100.0);
        dto.setDescription("Desc");
        dto.setRemark("Remark");

        assertEquals(1L, dto.getClaimId());
        assertEquals(2L, dto.getPolicyId());
        assertEquals(3L, dto.getUserId());
        assertEquals("PENDING", dto.getStatus());
        assertEquals("Msg", dto.getMessage());
        assertEquals(100.0, dto.getClaimAmount());
        assertEquals("Desc", dto.getDescription());
        assertEquals("Remark", dto.getRemark());
    }

    @Test
    void testPolicyDTO() {
        PolicyDTO dto = new PolicyDTO();
        dto.setId(1L);
        dto.setPolicyName("Name");
        dto.setDescription("Desc");
        dto.setPremiumAmount(100.0);
        dto.setCoverageAmount(1000.0);
        dto.setDurationInMonths(12);

        assertEquals(1L, dto.getId());
        assertEquals("Name", dto.getPolicyName());
        assertEquals("Desc", dto.getDescription());
        assertEquals(100.0, dto.getPremiumAmount());
        assertEquals(1000.0, dto.getCoverageAmount());
        assertEquals(12, dto.getDurationInMonths());
    }

    @Test
    void testPageResponse() {
        PageResponse<String> dto = new PageResponse<>();
        dto.setContent(Collections.singletonList("test"));
        dto.setNumber(1);
        dto.setSize(10);
        dto.setTotalElements(1L);
        dto.setTotalPages(1);
        dto.setLast(true);

        assertEquals(1, dto.getContent().size());
        assertEquals(1, dto.getNumber());
        assertEquals(10, dto.getSize());
        assertEquals(1L, dto.getTotalElements());
        assertEquals(1, dto.getTotalPages());
        assertTrue(dto.isLast());
    }

    @Test
    void testReportResponse() {
        ReportResponse dto = new ReportResponse();
        dto.setTotalPolicies(10L);
        dto.setTotalClaims(5);
        dto.setApprovedClaims(3);
        dto.setRejectedClaims(2);
        dto.setTotalRevenue(1000.0);

        assertEquals(10L, dto.getTotalPolicies());
        assertEquals(5, dto.getTotalClaims());
        assertEquals(3, dto.getApprovedClaims());
        assertEquals(2, dto.getRejectedClaims());
        assertEquals(1000.0, dto.getTotalRevenue());
    }

    @Test
    void testReviewRequest() {
        ReviewRequest dto = new ReviewRequest();
        dto.setStatus("APPROVED");
        dto.setRemark("OK");

        assertEquals("APPROVED", dto.getStatus());
        assertEquals("OK", dto.getRemark());
    }
}
