package com.group2.claims_service.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.io.PrintWriter;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GatewaySecurityFilterTest {

    @InjectMocks
    private GatewaySecurityFilter filter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Test
    @DisplayName("Should allow request when gateway secret is present and correct")
    void shouldAllowRequestWithCorrectSecret() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/claims/initiate");
        when(request.getHeader("X-Gateway-Secret")).thenReturn("SmartSureSecretKey2026");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("Should block request when gateway secret is missing")
    void shouldBlockRequestWithMissingSecret() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/claims/initiate");
        when(request.getHeader("X-Gateway-Secret")).thenReturn(null);
        when(response.getWriter()).thenReturn(mock(PrintWriter.class));

        filter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    @DisplayName("Should bypass filter for actuator endpoints")
    void shouldBypassForActuator() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/actuator/health");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verify(request, never()).getHeader(anyString());
    }
}
