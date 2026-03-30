package com.group2.auth_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    // Exchanges
    public static final String POLICY_EXCHANGE = "policy.exchange";
    public static final String CLAIM_EXCHANGE = "claim.exchange";

    // Queues
    public static final String AUTH_POLICY_STATUS_QUEUE = "auth.policy.status.queue";
    public static final String AUTH_CLAIM_CREATED_QUEUE = "auth.claim.created.queue";
    public static final String AUTH_CLAIM_REVIEW_QUEUE = "auth.claim.review.queue";

    // Routing Keys
    public static final String PAYMENT_STATUS_ROUTING_KEY = "payment.status.updated";
    public static final String CLAIM_CREATED_ROUTING_KEY = "claim.created";
    public static final String CLAIM_REVIEW_ROUTING_KEY = "claim.review";

    @Bean
    public DirectExchange policyExchange() {
        return new DirectExchange(POLICY_EXCHANGE);
    }

    @Bean
    public TopicExchange claimExchange() {
        return new TopicExchange(CLAIM_EXCHANGE);
    }

    @Bean
    public Queue authPolicyStatusQueue() {
        return new Queue(AUTH_POLICY_STATUS_QUEUE, true);
    }

    @Bean
    public Queue authClaimCreatedQueue() {
        return new Queue(AUTH_CLAIM_CREATED_QUEUE, true);
    }

    @Bean
    public Queue authClaimReviewQueue() {
        return new Queue(AUTH_CLAIM_REVIEW_QUEUE, true);
    }

    @Bean
    public Binding authPolicyStatusBinding() {
        return BindingBuilder.bind(authPolicyStatusQueue()).to(policyExchange()).with(PAYMENT_STATUS_ROUTING_KEY);
    }

    @Bean
    public Binding authClaimCreatedBinding() {
        return BindingBuilder.bind(authClaimCreatedQueue()).to(claimExchange()).with(CLAIM_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding authClaimReviewBinding() {
        return BindingBuilder.bind(authClaimReviewQueue()).to(claimExchange()).with(CLAIM_REVIEW_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
