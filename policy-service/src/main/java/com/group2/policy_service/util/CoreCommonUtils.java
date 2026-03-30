package com.group2.policy_service.util;

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

    public String formatDetails(String name, double amount) {
        if (name == null || name.isEmpty()) {
            return "N/A";
        }
        return String.format("Policy: %s, Premium: %.2f", name.toUpperCase(), amount);
    }
}
