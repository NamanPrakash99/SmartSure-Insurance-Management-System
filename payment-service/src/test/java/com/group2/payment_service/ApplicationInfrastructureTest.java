package com.group2.payment_service;

import com.group2.payment_service.config.RabbitConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.MessageConverter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

public class ApplicationInfrastructureTest {

    @Test
    @DisplayName("Should instantiate PaymentServiceApplication")
    public void testApplicationMain() {
        PaymentServiceApplication app = new PaymentServiceApplication();
        assertNotNull(app);
    }

    @Test
    @DisplayName("Should create DirectExchange bean with correct name")
    public void testRabbitConfig_Exchange() {
        RabbitConfig config = new RabbitConfig();
        DirectExchange exchange = config.exchange();
        assertNotNull(exchange);
        assertEquals(RabbitConfig.EXCHANGE, exchange.getName());
    }

    @Test
    @DisplayName("Should create purchaseQueue bean with correct name")
    public void testRabbitConfig_PurchaseQueue() {
        RabbitConfig config = new RabbitConfig();
        Queue queue = config.purchaseQueue();
        assertNotNull(queue);
        assertEquals(RabbitConfig.PURCHASE_QUEUE, queue.getName());
    }

    @Test
    @DisplayName("Should create paymentStatusQueue bean with correct name")
    public void testRabbitConfig_PaymentStatusQueue() {
        RabbitConfig config = new RabbitConfig();
        Queue queue = config.paymentStatusQueue();
        assertNotNull(queue);
        assertEquals(RabbitConfig.PAYMENT_STATUS_QUEUE, queue.getName());
    }

    @Test
    @DisplayName("Should create purchaseBinding with correct routing key")
    public void testRabbitConfig_PurchaseBinding() {
        RabbitConfig config = new RabbitConfig();
        Queue purchaseQueue = config.purchaseQueue();
        DirectExchange exchange = config.exchange();
        Binding binding = config.purchaseBinding(purchaseQueue, exchange);
        assertNotNull(binding);
        assertEquals(RabbitConfig.PURCHASE_ROUTING_KEY, binding.getRoutingKey());
    }

    @Test
    @DisplayName("Should create paymentStatusBinding with correct routing key")
    public void testRabbitConfig_PaymentStatusBinding() {
        RabbitConfig config = new RabbitConfig();
        Queue paymentStatusQueue = config.paymentStatusQueue();
        DirectExchange exchange = config.exchange();
        Binding binding = config.paymentStatusBinding(paymentStatusQueue, exchange);
        assertNotNull(binding);
        assertEquals(RabbitConfig.PAYMENT_STATUS_ROUTING_KEY, binding.getRoutingKey());
    }

    @Test
    @DisplayName("Should create Jackson2JsonMessageConverter bean")
    public void testRabbitConfig_MessageConverter() {
        RabbitConfig config = new RabbitConfig();
        MessageConverter converter = config.converter();
        assertNotNull(converter);
    }

    @Test
    @DisplayName("Should create RabbitTemplate with configured message converter")
    public void testRabbitConfig_Template() {
        RabbitConfig config = new RabbitConfig();
        ConnectionFactory mockFactory = mock(ConnectionFactory.class);
        AmqpTemplate template = config.template(mockFactory);
        assertNotNull(template);
    }

    @Test
    @DisplayName("Should verify RabbitConfig constant values")
    public void testRabbitConfig_Constants() {
        assertEquals("policy.exchange", RabbitConfig.EXCHANGE);
        assertEquals("policy.purchase.queue", RabbitConfig.PURCHASE_QUEUE);
        assertEquals("payment.status.queue", RabbitConfig.PAYMENT_STATUS_QUEUE);
        assertEquals("policy.purchase.started", RabbitConfig.PURCHASE_ROUTING_KEY);
        assertEquals("payment.status.updated", RabbitConfig.PAYMENT_STATUS_ROUTING_KEY);
    }
}
