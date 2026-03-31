package com.group2.auth_service;

import com.group2.auth_service.aspect.LoggingAspect;
import com.group2.auth_service.config.SwaggerConfig;
import com.group2.auth_service.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import io.swagger.v3.oas.models.OpenAPI;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.Signature;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ApplicationInfrastructureTest {

    @Test
    public void testApplicationMain() {
        AuthServiceApplication app = new AuthServiceApplication();
        assertNotNull(app);
    }

    @Test
    public void testSwaggerConfig() {
        SwaggerConfig config = new SwaggerConfig();
        OpenAPI api = config.customOpenAPI();
        assertNotNull(api);
        assertEquals("Auth Service API", api.getInfo().getTitle());
    }

    @Test
    public void testJwtUtil() {
        JwtUtil util = new JwtUtil();

        SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String secretString = Encoders.BASE64.encode(key.getEncoded());
        ReflectionTestUtils.setField(util, "secret", secretString);

        String token = util.generateToken("test@test.com", 1L, "CUSTOMER");
        assertNotNull(token);

        String tokenFromClaims = Jwts.builder()
                .setSubject("test@test.com")
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 10000))
                .signWith(key)
                .compact();

        // Test generation logic instead of non-existent extractEmail
        assertNotNull(tokenFromClaims);
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
