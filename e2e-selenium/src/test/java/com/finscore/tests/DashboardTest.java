package com.finscore.tests;

import com.finscore.tests.util.Config;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class DashboardTest extends BaseTest {

    @BeforeClass
    public void requireAuth() {
        if (Config.testEmail() == null || Config.testPassword() == null) {
            throw new SkipException("Skipping dashboard tests without TEST_EMAIL/TEST_PASSWORD");
        }
    }

    @Test
    public void dashboardRendersStats() {
        driver.get(Config.baseUrl() + "/dashboard");
        // Header title
        String body = driver.findElement(By.tagName("body")).getText();
        Assert.assertTrue(body.toLowerCase().contains("finscore"), "Dashboard should render header");
        // New Analysis button exists by text
        driver.findElement(By.xpath("//button[contains(., 'New Analysis')]"));
    }

    @Test
    public void recentAnalysesOrEmptyState() {
        driver.get(Config.baseUrl() + "/dashboard");
        // Either recent items or empty state text present
        boolean hasRecent = driver.findElements(By.xpath("//div[contains(., 'Recent Analyses')]")).size() > 0;
        Assert.assertTrue(hasRecent, "Recent Analyses section should exist");
    }
}
