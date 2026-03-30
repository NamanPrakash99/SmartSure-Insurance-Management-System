package com.group2.api_gateway.filter;

import org.junit.jupiter.api.Test;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RouteValidatorTest {

    private final RouteValidator validator = new RouteValidator();

    @Test
    void testIsOpenEndpoint_True() {
        ServerHttpRequest request = mock(ServerHttpRequest.class);
        when(request.getURI()).thenReturn(URI.create("http://localhost:8080/api/auth/register"));
        
        assertTrue(validator.isOpenEndpoint(request));
    }

    @Test
    void testIsOpenEndpoint_False() {
        ServerHttpRequest request = mock(ServerHttpRequest.class);
        when(request.getURI()).thenReturn(URI.create("http://localhost:8080/api/policy/all"));
        
        assertFalse(validator.isOpenEndpoint(request));
    }
}
