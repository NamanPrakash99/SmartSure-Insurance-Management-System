package com.group2.auth_service.util;

public class CoreCommonUtils {
    public int calculateScore(int base) {
        if (base < 0) return 0;
        int score = base * 2;
        if (score > 100) {
            score = 100;
        } else {
            score = score + 10;
        }
        return score;
    }

    public String formatDetails(String name, String email) {
        if (name == null || name.isEmpty() || email == null || email.isEmpty()) {
            return "N/A";
        }
        return String.format("User: %s (Email: %s)", name.toUpperCase(), email.toLowerCase());
    }
    
    public boolean isValid(String val) {
        return val != null && !val.trim().isEmpty();
    }
}
