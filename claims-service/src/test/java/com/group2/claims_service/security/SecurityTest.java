package com.group2.claims_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SecurityTest {

    private JwtUtil jwtUtil;
    private String secretRaw = "mysecretkeymysecretkeymysecretkeymysecretkey";
    private String secretBase64;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        secretBase64 = Encoders.BASE64.encode(secretRaw.getBytes());
        ReflectionTestUtils.setField(jwtUtil, "secret", secretBase64);
    }

    @Test
    void testExtractEmail() {
        Key key = Keys.hmacShaKeyFor(secretRaw.getBytes());
        String token = Jwts.builder()
                .setSubject("test@test.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 100000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        assertEquals("test@test.com", jwtUtil.extractEmail(token));
    }

    @Test
    void testExtractUserId() {
        Key key = Keys.hmacShaKeyFor(secretRaw.getBytes());
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", 123L);
        
        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject("test@test.com")
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        assertEquals(123L, jwtUtil.extractUserId(token));
    }

    @Test
    void testExtractRole() {
        Key key = Keys.hmacShaKeyFor(secretRaw.getBytes());
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ROLE_ADMIN");
        
        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject("test@test.com")
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        assertEquals("ROLE_ADMIN", jwtUtil.extractRole(token));
    }
}
