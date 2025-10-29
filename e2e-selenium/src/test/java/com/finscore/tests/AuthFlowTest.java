package com.finscore.tests;

import com.finscore.tests.util.Config;
import com.finscore.tests.util.Waits;
import org.openqa.selenium.By;
import org.testng.SkipException;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class AuthFlowTest extends BaseTest {

    private String email;
    private String password;

    @BeforeClass
    public void checkCreds() {
        email = Config.testEmail();
        password = Config.testPassword();
        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            throw new SkipException("TEST_EMAIL/TEST_PASSWORD not set; skipping login tests");
        }
    }

    @Test
    public void canLoginWithCredentials() {
        driver.get(Config.baseUrl() + "/login");
        Waits.forUrlContains(driver, "/login");
        // Generic selectors: try email/password inputs and a button containing 'Sign in' or 'Login'
        driver.findElement(By.cssSelector("input[type='email']")).sendKeys(email);
        driver.findElement(By.cssSelector("input[type='password']")).sendKeys(password);
        // Try different button labels
        try {
            driver.findElement(By.xpath("//button[contains(translate(., 'LOGIN', 'login'), 'login') or contains(translate(., 'SIGN IN', 'sign in'), 'sign in')]")).click();
        } catch (Exception e) {
            // fallback: first submit button
            driver.findElement(By.cssSelector("button[type='submit']")).click();
        }
        // Expect redirect to dashboard or similar
        Waits.forUrlContains(driver, "/dashboard");
    }
}
