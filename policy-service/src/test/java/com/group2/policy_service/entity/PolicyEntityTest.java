package com.group2.policy_service.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

public class PolicyEntityTest {

    @Test
    public void testPolicyEntity() {
        Policy policy = new Policy();
        policy.setId(1L);
        policy.setPolicyName("Health");
        policy.setDescription("Desc");
        policy.setPremiumAmount(500.0);
        policy.setCoverageAmount(10000.0);
        policy.setDurationInMonths(12);
        policy.setActive(true);
        PolicyType type = new PolicyType();
        policy.setPolicyType(type);

        assertEquals(1L, policy.getId());
        assertEquals("Health", policy.getPolicyName());
        assertEquals("Desc", policy.getDescription());
        assertEquals(500.0, policy.getPremiumAmount());
        assertEquals(10000.0, policy.getCoverageAmount());
        assertEquals(12, policy.getDurationInMonths());
        assertTrue(policy.isActive());
        assertEquals(type, policy.getPolicyType());
    }

    @Test
    public void testPolicyTypeEntity() {
        PolicyType type = new PolicyType();
        type.setId(1L);
        type.setCategory(PolicyCategory.HEALTH);
        type.setDescription("Health Category");

        assertEquals(1L, type.getId());
        assertEquals(PolicyCategory.HEALTH, type.getCategory());
        assertEquals("Health Category", type.getDescription());
    }

    @Test
    public void testUserPolicyEntity() {
        UserPolicy up = new UserPolicy();
        up.setId(1L);
        up.setUserId(10L);
        Policy p = new Policy();
        up.setPolicy(p);
        up.setStatus(PolicyStatus.ACTIVE);
        up.setPremiumAmount(500.0);
        up.setStartDate(LocalDate.now());
        up.setEndDate(LocalDate.now().plusMonths(12));

        assertEquals(1L, up.getId());
        assertEquals(10L, up.getUserId());
        assertEquals(p, up.getPolicy());
        assertEquals(PolicyStatus.ACTIVE, up.getStatus());
        assertEquals(500.0, up.getPremiumAmount());
        assertNotNull(up.getStartDate());
        assertNotNull(up.getEndDate());
    }

    @Test
    public void testEnums() {
        assertNotNull(PolicyCategory.LIFE);
        assertNotNull(PolicyStatus.CANCELLED);
    }
}
