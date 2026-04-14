package com.group2.api_gateway.filter;

import com.group2.api_gateway.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    private JwtAuthenticationFilter filter;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RouteValidator routeValidator;

    @Mock
    private GatewayFilterChain chain;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtUtil, routeValidator);
    }

    @Test
    void testFilter_OpenEndpoint() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(routeValidator.isOpenEndpoint(any())).thenReturn(true);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        verify(chain, times(1)).filter(any());
        verify(jwtUtil, never()).validateToken(anyString());
    }

    @Test
    void testFilter_MissingAuthHeader() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/claims").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(routeValidator.isOpenEndpoint(any())).thenReturn(false);

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verify(chain, never()).filter(any());
    }

    @Test
    void testFilter_InvalidToken() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/claims")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(routeValidator.isOpenEndpoint(any())).thenReturn(false);
        doThrow(new RuntimeException("Invalid token")).when(jwtUtil).validateToken("invalid");

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void testFilter_ValidToken() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/claims")
                .header(HttpHeaders.AUTHORIZATION, "Bearer valid-token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(routeValidator.isOpenEndpoint(any())).thenReturn(false);
        when(jwtUtil.extractUserId("valid-token")).thenReturn("1");
        when(jwtUtil.extractRole("valid-token")).thenReturn("ROLE_USER");
        when(jwtUtil.extractEmail("valid-token")).thenReturn("test@test.com");
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        verify(chain, times(1)).filter(any());
    }

    @Test
    void testGetOrder() {
        assertEquals(-1, filter.getOrder());
    }
}
