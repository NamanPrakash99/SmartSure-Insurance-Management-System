package com.group2.claims_service.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EntityTest {

    @Test
    void testClaimEntity() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setPolicyId(2L);
        claim.setUserId(3L);
        claim.setClaimAmount(1000.0);
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        claim.setDescription("Desc");

        assertEquals(1L, claim.getId());
        assertEquals(2L, claim.getPolicyId());
        assertEquals(3L, claim.getUserId());
        assertEquals(1000.0, claim.getClaimAmount());
        assertEquals(ClaimStatus.SUBMITTED, claim.getClaimStatus());
        assertEquals("Desc", claim.getDescription());
    }

    @Test
    void testClaimDocumentEntity() {
        ClaimDocument doc = new ClaimDocument();
        doc.setId(1L);
        doc.setFileUrl("http://test.com/doc.pdf");
        doc.setDocumentType("PDF");
        doc.setClaimId(2L);

        assertEquals(1L, doc.getId());
        assertEquals("http://test.com/doc.pdf", doc.getFileUrl());
        assertEquals("PDF", doc.getDocumentType());
        assertEquals(2L, doc.getClaimId());
    }
}
