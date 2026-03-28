package com.group2.auth_service.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FilterTest {

    @Test
    public void testGateway_ValidSecret() throws Exception {
        GatewaySecurityFilter filter = new GatewaySecurityFilter();
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Gateway-Secret")).thenReturn("SmartSureSecretKey2026");

        filter.doFilterInternal(request, response, chain);
        verify(chain, times(1)).doFilter(request, response);
    }

    @Test
    public void testGateway_InvalidSecret() throws Exception {
        GatewaySecurityFilter filter = new GatewaySecurityFilter();
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Gateway-Secret")).thenReturn("wrong");
        when(response.getWriter()).thenReturn(pw);

        filter.doFilterInternal(request, response, chain);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(chain, never()).doFilter(request, response);
    }

    @Test
    public void testGateway_NoSecret() throws Exception {
        GatewaySecurityFilter filter = new GatewaySecurityFilter();
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Gateway-Secret")).thenReturn(null);
        when(response.getWriter()).thenReturn(pw);

        filter.doFilterInternal(request, response, chain);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Test
    public void testGateway_ActuatorPath() throws Exception {
        GatewaySecurityFilter filter = new GatewaySecurityFilter();
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getRequestURI()).thenReturn("/actuator/health");

        filter.doFilterInternal(request, response, chain);
        verify(chain, times(1)).doFilter(request, response);
    }

    @Test
    public void testGateway_EurekaPath() throws Exception {
        GatewaySecurityFilter filter = new GatewaySecurityFilter();
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getRequestURI()).thenReturn("/eureka/apps");

        filter.doFilterInternal(request, response, chain);
        verify(chain, times(1)).doFilter(request, response);
    }
}
