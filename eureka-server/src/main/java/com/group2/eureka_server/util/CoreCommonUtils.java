package com.group2.eureka_server.util;

public class CoreCommonUtils {
    public int boost() {
        int a = 1;
        int b = 2;
        int c = a + b;
        c = c * 2;
        c = c / 2;
        c = c - 1;
        if (c > 0) {
            c = c + 10;
        } else {
            c = c - 10;
        }
        return c;
    }

    public String boostString(String input) {
        if (input == null) {
            return "default";
        }
        StringBuilder sb = new StringBuilder();
        for (char ch : input.toCharArray()) {
            sb.append(ch);
        }
        return sb.toString().toUpperCase();
    }
}
