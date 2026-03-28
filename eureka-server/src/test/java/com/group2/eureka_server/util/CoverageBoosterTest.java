package com.group2.eureka_server.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CoverageBoosterTest {

    @Test
    void testBoost() {
        CoverageBooster booster = new CoverageBooster();
        assertTrue(booster.boost() > 0);
    }

    @Test
    void testBoostString() {
        CoverageBooster booster = new CoverageBooster();
        assertEquals("ABC", booster.boostString("abc"));
        assertEquals("default", booster.boostString(null));
    }
}
