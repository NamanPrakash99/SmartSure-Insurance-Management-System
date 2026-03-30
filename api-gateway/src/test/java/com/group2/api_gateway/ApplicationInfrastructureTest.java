package com.group2.api_gateway;

import com.group2.api_gateway.util.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ApplicationInfrastructureTest {

    @Test
    void testApplicationMain() {
        ApiGatewayApplication app = new ApiGatewayApplication();
        assertNotNull(app);
    }

    @Test
    void testJwtUtil() {
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

        assertNotNull(util.extractClaims(token));
        assertEquals("test@test.com", util.extractEmail(token));
        assertEquals("123", util.extractUserId(token));
        assertEquals("CUSTOMER", util.extractRole(token));
        util.validateToken(token);
    }
}
