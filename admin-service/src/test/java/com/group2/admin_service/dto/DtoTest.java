package com.group2.admin_service.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DtoTest {

    @Test
    void testClaimDTO() {
        ClaimDTO dto = new ClaimDTO();
        dto.setClaimId(1L);
        dto.setPolicyId(2L);
        dto.setUserId(3L);
        dto.setStatus("PENDING");
        dto.setClaimAmount(100.0);

        assertEquals(1L, dto.getClaimId());
        assertEquals(2L, dto.getPolicyId());
        assertEquals(3L, dto.getUserId());
        assertEquals("PENDING", dto.getStatus());
        assertEquals(100.0, dto.getClaimAmount());
    }

    @Test
    void testPolicyDTO() {
        PolicyDTO dto = new PolicyDTO();
        dto.setId(1L);
        dto.setPolicyName("Name");
        dto.setPremiumAmount(100.0);

        assertEquals(1L, dto.getId());
        assertEquals("Name", dto.getPolicyName());
        assertEquals(100.0, dto.getPremiumAmount());
    }
}
