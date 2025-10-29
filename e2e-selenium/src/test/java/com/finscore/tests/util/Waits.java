package com.finscore.tests.util;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class Waits {
    public static WebDriverWait wait(WebDriver driver) {
        return new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public static void forVisible(WebDriver driver, By locator) {
        wait(driver).until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public static void forUrlContains(WebDriver driver, String part) {
        wait(driver).until(ExpectedConditions.urlContains(part));
    }
}
