package com.group2.admin_service.dto;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Collections;

import org.junit.jupiter.api.Test;

class AdminDtoTest {

    @Test
    void testDtoBoilerplate() {
        // ClaimCreatedEvent
        ClaimCreatedEvent cce = new ClaimCreatedEvent();
        cce.setUserId(1L);
        cce.setPolicyId(2L);
        assertEquals(1L, cce.getUserId());
        assertEquals(2L, cce.getPolicyId());

        // ClaimDTO
        ClaimDTO claim = new ClaimDTO();
        claim.setClaimId(1L);
        claim.setStatus("PENDING");
        assertEquals(1L, claim.getClaimId());
        assertEquals("PENDING", claim.getStatus());

        // ClaimReviewEvent
        ClaimReviewEvent cre = new ClaimReviewEvent();
        cre.setClaimId(1L);
        cre.setStatus("APPROVED");
        assertEquals(1L, cre.getClaimId());
        assertEquals("APPROVED", cre.getStatus());

        // ClaimStatusDTO
        ClaimStatusDTO cs = new ClaimStatusDTO();
        cs.setTotalClaims(10);
        assertEquals(10, cs.getTotalClaims());

        // ClaimStatusUpdateDTO
        ClaimStatusUpdateDTO csu = new ClaimStatusUpdateDTO();
        csu.setStatus("REJECTED");
        assertEquals("REJECTED", csu.getStatus());

        // PageResponse
        PageResponse<String> pr = new PageResponse<>();
        pr.setTotalPages(1);
        pr.setContent(Collections.singletonList("test"));
        assertEquals(1, pr.getTotalPages());
        assertNotNull(pr.getContent());

        // PolicyDTO
        PolicyDTO p = new PolicyDTO();
        p.setId(1L);
        p.setPolicyName("Life");
        assertEquals(1L, p.getId());
        assertEquals("Life", p.getPolicyName());

        // PolicyRequestDTO
        PolicyRequestDTO prd = new PolicyRequestDTO();
        prd.setPolicyName("Home");
        assertEquals("Home", prd.getPolicyName());

        // PolicyStatsDTO
        PolicyStatsDTO ps = new PolicyStatsDTO();
        ps.setTotalRevenue(100.0);
        assertEquals(100.0, ps.getTotalRevenue());

        // ReportResponse
        ReportResponse rr = new ReportResponse();
        rr.setTotalClaims(50);
        assertEquals(50, rr.getTotalClaims());

        // ReviewRequest
        ReviewRequest req = new ReviewRequest();
        req.setRemark("OK");
        assertEquals("OK", req.getRemark());

        // UserDTO
        UserDTO user = new UserDTO();
        user.setId(1L);
        user.setName("Naman");
        assertEquals(1L, user.getId());
        assertEquals("Naman", user.getName());
    }
}
