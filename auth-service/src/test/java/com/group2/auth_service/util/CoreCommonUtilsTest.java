package com.group2.auth_service.util;

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
        assertEquals("N/A", booster.formatDetails(null, null));
        assertEquals("N/A", booster.formatDetails("", "test@test.com"));
        assertEquals("User: TEST (Email: test@test.com)", booster.formatDetails("test", "TEST@TEST.COM"));
    }
    
    @Test
    public void testIsValid() {
        CoreCommonUtils booster = new CoreCommonUtils();
        assertFalse(booster.isValid(null));
        assertFalse(booster.isValid("  "));
        assertTrue(booster.isValid("val"));
    }
}
