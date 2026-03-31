package com.group2.claims_service;

import com.group2.claims_service.aspect.LoggingAspect;
import com.group2.claims_service.config.RabbitMQConfig;
import com.group2.claims_service.config.SwaggerConfig;
import com.group2.claims_service.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import io.swagger.v3.oas.models.OpenAPI;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.Signature;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ApplicationInfrastructureTest {

    @Test
    public void testApplicationMain() {
        ClaimsServiceApplication app = new ClaimsServiceApplication();
        assertNotNull(app);
    }

    @Test
    public void testRabbitMQConfig() {
        RabbitMQConfig config = new RabbitMQConfig();
        TopicExchange exchange = config.exchange();
        assertEquals(RabbitMQConfig.EXCHANGE, exchange.getName());

        Queue cQueue = config.claimCreatedQueue();
        assertEquals(RabbitMQConfig.CLAIM_CREATED_QUEUE, cQueue.getName());

        Queue rQueue = config.claimReviewQueue();
        assertEquals(RabbitMQConfig.CLAIM_REVIEW_QUEUE, rQueue.getName());

        Binding cBinding = config.claimCreatedBinding(cQueue, exchange);
        assertNotNull(cBinding);

        Binding rBinding = config.claimReviewBinding(rQueue, exchange);
        assertNotNull(rBinding);

        assertNotNull(config.jsonMessageConverter());
    }

    @Test
    public void testSwaggerConfig() {
        SwaggerConfig config = new SwaggerConfig();
        OpenAPI api = config.customOpenAPI();
        assertNotNull(api);
        assertEquals("Claims Service API", api.getInfo().getTitle());
    }

    @Test
    public void testJwtUtil() {
        JwtUtil util = new JwtUtil();

        SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String secretString = Encoders.BASE64.encode(key.getEncoded());
        ReflectionTestUtils.setField(util, "secret", secretString);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", 123L);
        claims.put("role", "CUSTOMER");

        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject("test@test.com")
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 10000))
                .signWith(key)
                .compact();

        assertEquals("test@test.com", util.extractEmail(token));
        assertEquals(123L, util.extractUserId(token));
        assertEquals("CUSTOMER", util.extractRole(token));
    }

    @Test
    public void testLoggingAspect() {
        LoggingAspect aspect = new LoggingAspect();
        JoinPoint jp = mock(JoinPoint.class);
        Signature sig = mock(Signature.class);
        when(jp.getSignature()).thenReturn(sig);
        when(sig.getDeclaringTypeName()).thenReturn("TestClass");
        when(sig.getName()).thenReturn("testMethod");
        when(jp.getArgs()).thenReturn(new Object[]{"arg1"});

        aspect.logBefore(jp);
        aspect.logAfterReturning(jp, "result");

        Throwable e = new RuntimeException("Test Exception");
        aspect.logAfterThrowing(jp, e);
    }
}
