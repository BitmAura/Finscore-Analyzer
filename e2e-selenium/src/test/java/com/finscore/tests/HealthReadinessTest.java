package com.finscore.tests;

import com.finscore.tests.util.Config;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.HttpClientResponseHandler;
import org.testng.Assert;
import org.testng.annotations.Test;

public class HealthReadinessTest {

    @Test
    public void healthShouldReturn200() throws Exception {
        String url = Config.baseUrl() + "/api/health";
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet req = new HttpGet(url);
            HttpClientResponseHandler<Integer> handler = response -> response.getCode();
            int code = client.execute(req, handler);
            Assert.assertEquals(code, 200, "/api/health should return 200");
        }
    }

    @Test
    public void readinessShouldReturn200() throws Exception {
        String url = Config.baseUrl() + "/api/readiness";
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet req = new HttpGet(url);
            HttpClientResponseHandler<Integer> handler = response -> response.getCode();
            int code = client.execute(req, handler);
            Assert.assertEquals(code, 200, "/api/readiness should return 200");
        }
    }
}
