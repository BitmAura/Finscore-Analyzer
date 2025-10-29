package com.finscore.tests;

import com.finscore.tests.util.Config;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

public class BaseTest {
    protected WebDriver driver;

    @BeforeClass
    public void setUp() {
        String browser = Config.browser();
        boolean headless = Config.headless();

        switch (browser) {
            case "edge":
                WebDriverManager.edgedriver().setup();
                EdgeOptions eOpts = new EdgeOptions();
                if (headless) eOpts.addArguments("--headless=new", "--disable-gpu");
                eOpts.addArguments("--window-size=1440,900");
                driver = new EdgeDriver(eOpts);
                break;
            case "firefox":
                WebDriverManager.firefoxdriver().setup();
                FirefoxOptions fOpts = new FirefoxOptions();
                if (headless) fOpts.addArguments("-headless");
                driver = new FirefoxDriver(fOpts);
                break;
            case "chrome":
            default:
                WebDriverManager.chromedriver().setup();
                ChromeOptions options = new ChromeOptions();
                if (headless) options.addArguments("--headless=new", "--disable-gpu");
                options.addArguments("--window-size=1440,900");
                driver = new ChromeDriver(options);
                break;
        }
    }

    @AfterClass(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
