package com.group2.policy_service.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class EntityTest {

    @Test
    void testPolicyEntity() {
        Policy policy = new Policy();
        policy.setId(1L);
        policy.setPolicyName("Health");
        policy.setDescription("Desc");
        policy.setPremiumAmount(500.0);
        policy.setCoverageAmount(5000.0);
        policy.setDurationInMonths(12);

        assertEquals(1L, policy.getId());
        assertEquals("Health", policy.getPolicyName());
        assertEquals("Desc", policy.getDescription());
        assertEquals(500.0, policy.getPremiumAmount());
        assertEquals(5000.0, policy.getCoverageAmount());
        assertEquals(12, policy.getDurationInMonths());
    }

    @Test
    void testPolicyType() {
        PolicyType type = new PolicyType();
        type.setId(1L);
        type.setCategory(PolicyCategory.HEALTH);
        type.setDescription("Desc");

        assertEquals(1L, type.getId());
        assertEquals(PolicyCategory.HEALTH, type.getCategory());
        assertEquals("Desc", type.getDescription());
    }

    @Test
    void testUserPolicy() {
        UserPolicy up = new UserPolicy();
        up.setId(1L);
        up.setUserId(2L);
        up.setStartDate(LocalDate.now());
        up.setEndDate(LocalDate.now().plusYears(1));
        up.setStatus(PolicyStatus.ACTIVE);

        assertEquals(1L, up.getId());
        assertEquals(2L, up.getUserId());
        assertNotNull(up.getStartDate());
        assertNotNull(up.getEndDate());
        assertEquals(PolicyStatus.ACTIVE, up.getStatus());
    }
}
