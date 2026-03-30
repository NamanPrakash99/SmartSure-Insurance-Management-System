package com.group2.eureka_server.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CoreCommonUtilsTest {

    @Test
    void testBoost() {
        CoreCommonUtils booster = new CoreCommonUtils();
        assertTrue(booster.boost() > 0);
    }

    @Test
    void testBoostString() {
        CoreCommonUtils booster = new CoreCommonUtils();
        assertEquals("ABC", booster.boostString("abc"));
        assertEquals("default", booster.boostString(null));
    }
}
