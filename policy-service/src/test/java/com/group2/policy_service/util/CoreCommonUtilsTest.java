package com.group2.policy_service.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CoreCommonUtilsTest {

    @Test
    public void testCalculateScore() {
        CoreCommonUtils booster = new CoreCommonUtils();
        assertEquals(0, booster.calculateScore(-1));
        assertEquals(30, booster.calculateScore(10));
        assertEquals(100, booster.calculateScore(60));
    }

    @Test
    public void testFormatDetails() {
        CoreCommonUtils booster = new CoreCommonUtils();
        assertEquals("N/A", booster.formatDetails(null, 0));
        assertEquals("N/A", booster.formatDetails("", 0));
        assertEquals("Policy: HEALTH, Premium: 500.00", booster.formatDetails("health", 500.0));
    }
}
