package com.group2.payment_service.service;

import com.group2.payment_service.dto.PaymentRequest;
import com.group2.payment_service.dto.PaymentResponse;
import com.group2.payment_service.dto.PaymentVerifyRequest;
import com.group2.payment_service.entity.Transaction;
import com.group2.payment_service.repository.TransactionRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.group2.payment_service.config.RabbitConfig;
import com.group2.payment_service.dto.event.PaymentStatusEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.json.JSONObject;

import java.util.Optional;

import com.group2.payment_service.repository.UserRepository;
import com.group2.payment_service.repository.PolicyRepository;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public PaymentResponse createOrder(PaymentRequest request) {
        // Validate User Exists (100% Reliable Local DB Query)
        if (!userRepository.existsById(request.getUserId())) {
            throw new IllegalArgumentException("Invalid User ID: User does not exist.");
        }

        // Validate Policy Exists (100% Reliable Local DB Query)
        if (!policyRepository.existsById(request.getPolicyId())) {
            throw new IllegalArgumentException("Invalid Policy ID: Policy does not exist.");
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            // Razorpay amount is in paise so multiply by 100
            orderRequest.put("amount", request.getAmount() * 100);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());

            Order order = razorpayClient.orders.create(orderRequest);

            Transaction transaction = new Transaction();
            transaction.setRazorpayOrderId(order.get("id"));
            transaction.setUserId(request.getUserId());
            transaction.setPolicyId(request.getPolicyId());
            transaction.setUserPolicyId(request.getUserPolicyId());
            transaction.setAmount(request.getAmount());
            transaction.setStatus("PENDING");

            transactionRepository.save(transaction);

            return new PaymentResponse(order.get("id"), "CREATED", request.getAmount(), "Order created successfully");

        } catch (RazorpayException e) {
            e.printStackTrace();
            throw new RuntimeException("Exception while creating Razorpay order: " + e.getMessage());
        }
    }

    public String verifyPayment(PaymentVerifyRequest verifyRequest) {
        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", verifyRequest.getRazorpayOrderId());
            options.put("razorpay_payment_id", verifyRequest.getRazorpayPaymentId());
            options.put("razorpay_signature", verifyRequest.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            Optional<Transaction> transactionOpt = transactionRepository.findByRazorpayOrderId(verifyRequest.getRazorpayOrderId());
            
            if (isValid) {
                if (transactionOpt.isPresent()) {
                    Transaction transaction = transactionOpt.get();
                    transaction.setRazorpayPaymentId(verifyRequest.getRazorpayPaymentId());
                    transaction.setRazorpaySignature(verifyRequest.getRazorpaySignature());
                    transaction.setStatus("SUCCESS");
                    transactionRepository.save(transaction);
                    
                    // Emit Success Event
                    emitPaymentStatus(transaction.getUserPolicyId(), verifyRequest.getRazorpayPaymentId(), "SUCCESS");
                }
                return "Payment Verification Successful";
            } else {
                if (transactionOpt.isPresent()) {
                    Transaction transaction = transactionOpt.get();
                    transaction.setStatus("FAILED");
                    transactionRepository.save(transaction);
                    
                    // Emit Failed Event
                    emitPaymentStatus(transaction.getUserPolicyId(), null, "FAILED");
                }
                return "Payment Verification Failed";
            }
        } catch (RazorpayException e) {
            e.printStackTrace();
            throw new RuntimeException("Exception while verifying Razorpay payment: " + e.getMessage());
        }
    }

    private void emitPaymentStatus(Long userPolicyId, String paymentId, String status) {
        if (userPolicyId != null) {
            PaymentStatusEvent event = new PaymentStatusEvent(userPolicyId, paymentId, status);
            rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.PAYMENT_STATUS_ROUTING_KEY, event);
        }
    }
}
