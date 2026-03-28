package com.group2.claims_service.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

public class ClaimEntityTest {

    @Test
    public void testClaimEntity() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setPolicyId(2L);
        claim.setUserId(3L);
        claim.setClaimAmount(500.0);
        claim.setDescription("Test claim");
        claim.setClaimStatus(ClaimStatus.SUBMITTED);
        LocalDateTime now = LocalDateTime.now();
        claim.setCreatedAt(now);

        assertEquals(1L, claim.getId());
        assertEquals(2L, claim.getPolicyId());
        assertEquals(3L, claim.getUserId());
        assertEquals(500.0, claim.getClaimAmount());
        assertEquals("Test claim", claim.getDescription());
        assertEquals(ClaimStatus.SUBMITTED, claim.getClaimStatus());
        assertEquals(now, claim.getCreatedAt());

        // Test toString
        String str = claim.toString();
        assertNotNull(str);
        assertTrue(str.contains("policyId=2"));
    }

    @Test
    public void testClaimDocumentEntity() {
        ClaimDocument doc = new ClaimDocument();
        doc.setId(1L);
        doc.setClaimId(2L);
        doc.setFileUrl("file.pdf");
        doc.setDocumentType("application/pdf");
        LocalDateTime now = LocalDateTime.now();
        doc.setUploadedDate(now);
        byte[] data = new byte[]{1, 2, 3};
        doc.setFileData(data);

        assertEquals(1L, doc.getId());
        assertEquals(2L, doc.getClaimId());
        assertEquals("file.pdf", doc.getFileUrl());
        assertEquals("application/pdf", doc.getDocumentType());
        assertEquals(now, doc.getUploadedDate());
        assertArrayEquals(data, doc.getFileData());
    }

    @Test
    public void testClaimStatusEnum() {
        assertEquals("SUBMITTED", ClaimStatus.SUBMITTED.name());
        assertEquals("UNDER_REVIEW", ClaimStatus.UNDER_REVIEW.name());
        assertEquals("APPROVED", ClaimStatus.APPROVED.name());
        assertEquals("REJECTED", ClaimStatus.REJECTED.name());
        assertEquals("CLOSED", ClaimStatus.CLOSED.name());

        // Test valueOf
        assertEquals(ClaimStatus.SUBMITTED, ClaimStatus.valueOf("SUBMITTED"));
        assertEquals(ClaimStatus.APPROVED, ClaimStatus.valueOf("APPROVED"));
    }
}
