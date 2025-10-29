package com.finscore.tests;

import com.finscore.tests.util.Config;
import com.finscore.tests.util.Waits;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class CommandPaletteTest extends BaseTest {

    @BeforeClass
    public void requireAuth() {
        if (Config.testEmail() == null || Config.testPassword() == null) {
            throw new SkipException("Skipping command palette tests without TEST_EMAIL/TEST_PASSWORD");
        }
    }

    @Test
    public void openPaletteAndNavigateToMyReports() {
        driver.get(Config.baseUrl() + "/dashboard");
        // Open palette: Ctrl/Cmd + K
        Actions actions = new Actions(driver);
        actions.keyDown(Keys.CONTROL).sendKeys("k").keyUp(Keys.CONTROL).perform();

        // Type query 'my reports'
        WebElement input = driver.findElement(By.cssSelector("input[placeholder='Search commands...']"));
        input.sendKeys("my reports");
        input.sendKeys(Keys.ENTER);

        // Should navigate to /my-reports
        Waits.forUrlContains(driver, "/my-reports");
        Assert.assertTrue(driver.getCurrentUrl().contains("/my-reports"));
    }
}
