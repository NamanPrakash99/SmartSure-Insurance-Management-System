package com.group2.admin_service;

import com.group2.admin_service.aspect.LoggingAspect;
import com.group2.admin_service.config.FeignConfig;
import com.group2.admin_service.config.RabbitMQConfig;
import com.group2.admin_service.config.SwaggerConfig;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import io.swagger.v3.oas.models.OpenAPI;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.Signature;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ApplicationInfrastructureTest {

    @Test
    void testApplicationMain() {
        AdminServiceApplication app = new AdminServiceApplication();
        assertNotNull(app);
    }

    @Test
    void testSwaggerConfig() {
        SwaggerConfig config = new SwaggerConfig();
        OpenAPI api = config.customOpenAPI();
        assertNotNull(api);
        assertEquals("Admin Service API", api.getInfo().getTitle());
    }

    @Test
    void testRabbitMQConfig() {
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
    void testFeignConfig() {
        FeignConfig config = new FeignConfig();
        RequestInterceptor interceptor = config.requestInterceptor();
        
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer test");
        request.addHeader("X-Gateway-Secret", "secret");

        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        RequestTemplate template = new RequestTemplate();
        interceptor.apply(template);

        assertEquals("Bearer test", template.headers().get("Authorization").iterator().next());
        assertEquals("secret", template.headers().get("X-Gateway-Secret").iterator().next());
        
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void testLoggingAspect() {
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
        
        assertNotNull(aspect);
        verify(jp, atLeastOnce()).getSignature();
    }
}
