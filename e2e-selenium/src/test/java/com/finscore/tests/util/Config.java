package com.finscore.tests.util;

public class Config {
    public static String baseUrl() {
        String env = System.getProperty("BASE_URL", System.getenv("BASE_URL"));
        return env != null && !env.isBlank() ? env : "http://localhost:3000";
    }

    public static boolean headless() {
        String v = System.getProperty("HEADLESS", System.getenv("HEADLESS"));
        return v == null || v.equalsIgnoreCase("true") || v.equals("1");
    }

    public static String browser() {
        String b = System.getProperty("BROWSER", System.getenv("BROWSER"));
        return b != null && !b.isBlank() ? b.toLowerCase() : "chrome";
    }

    public static String testEmail() {
        String v = System.getProperty("TEST_EMAIL", System.getenv("TEST_EMAIL"));
        return v;
    }

    public static String testPassword() {
        String v = System.getProperty("TEST_PASSWORD", System.getenv("TEST_PASSWORD"));
        return v;
    }
}
