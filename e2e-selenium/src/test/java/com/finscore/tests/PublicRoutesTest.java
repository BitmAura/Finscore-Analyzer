package com.finscore.tests;

import com.finscore.tests.util.Config;
import com.finscore.tests.util.Waits;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PublicRoutesTest extends BaseTest {

    @Test
    public void homePageLoads() {
        driver.get(Config.baseUrl() + "/");
        // Check the presence of app title text and body content
        String body = driver.findElement(By.tagName("body")).getText();
        Assert.assertTrue(body.toLowerCase().contains("finscore"), "Homepage should mention FinScore");
    }

    @Test
    public void loginPageLoads() {
        driver.get(Config.baseUrl() + "/login");
        Waits.forUrlContains(driver, "/login");
        String body = driver.findElement(By.tagName("body")).getText();
        Assert.assertTrue(body.length() > 0, "Login page should render some content");
    }
}
