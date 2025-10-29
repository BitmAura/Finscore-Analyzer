package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Modern Java 21 Spring Boot 3.4 application
 * Demonstrates modern Java features and best practices
 */
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
        
        // Modern Java 21 APIs
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        System.out.println("=".repeat(50));
        System.out.println("Application started at: " + now.format(formatter));
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("Spring Boot: 3.4.0");
        System.out.println("=".repeat(50));
        
        // Java 21 features demo
        demonstrateJava21Features();
    }
    
    private static void demonstrateJava21Features() {
        // String templates (preview in Java 21)
        String version = "21";
        System.out.println("Running on Java " + version);
        
        // Pattern matching for switch (standard in Java 21)
        Object obj = "Hello Java 21";
        String result = switch (obj) {
            case String s -> "String: " + s;
            case Integer i -> "Integer: " + i;
            default -> "Unknown";
        };
        System.out.println(result);
    }
}
