package com.group2.payment_service.service.impl;

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
import com.group2.payment_service.service.PaymentService;
import com.group2.payment_service.service.EmailService;

@Service
public class PaymentServiceImpl implements PaymentService {

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

    @Autowired
    private EmailService emailService;

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

                    // Send Confirmation Email
                    try {
                        userRepository.findById(transaction.getUserId()).ifPresentOrElse(user -> {
                            policyRepository.findById(transaction.getPolicyId()).ifPresentOrElse(policy -> {
                                String expiryDate = java.time.LocalDate.now().plusYears(1).toString();
                                String subject = "Policy Purchase Confirmation - SmartSure";
                                
                                String htmlBody = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                                        "<style>" +
                                        "body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }" +
                                        ".container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }" +
                                        ".header { background: linear-gradient(135deg, #1e3a8a 0%, #1a365d 100%); color: #ffffff; padding: 40px 20px; text-align: center; }" +
                                        ".header h1 { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }" +
                                        ".content { padding: 30px; color: #333333; line-height: 1.6; }" +
                                        ".congrats { font-size: 24px; font-weight: 700; color: #1e3a8a; margin-bottom: 16px; }" +
                                        ".details-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 6px solid #1e3a8a; padding: 25px; margin: 24px 0; border-radius: 8px; }" +
                                        ".detail-row { margin-bottom: 14px; display: block; }" +
                                        ".detail-label { font-weight: 700; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }" +
                                        ".detail-value { color: #1e293b; font-size: 17px; font-weight: 600; display: block; word-break: break-word; }" +
                                        ".footer { padding: 30px; text-align: center; color: #94a3b8; font-size: 14px; background-color: #f1f5f9; }" +
                                        "@media only screen and (max-width: 480px) {" +
                                        "  .content { padding: 20px; }" +
                                        "  .congrats { font-size: 20px; }" +
                                        "  .header { padding: 30px 15px; }" +
                                        "}" +
                                        "</style></head><body>" +
                                        "<div class=\"container\">" +
                                        "<div class=\"header\"><h1>🛡️ SmartSure</h1></div>" +
                                        "<div class=\"content\">" +
                                        "<div class=\"congrats\">Congratulations " + user.getName() + "!</div>" +
                                        "<p>Your insurance purchase is successful! Your protection coverage is now active. Below are your policy details:</p>" +
                                        "<div class=\"details-card\">" +
                                        "<div class=\"detail-row\"><span class=\"detail-label\">Policy Name</span><span class=\"detail-value\">" + policy.getPolicyName() + "</span></div>" +
                                        "<div class=\"detail-row\"><span class=\"detail-label\">Transaction Amount</span><span class=\"detail-value\">₹" + String.format("%.2f", transaction.getAmount()) + "</span></div>" +
                                        "<div class=\"detail-row\"><span class=\"detail-label\">Coverage Limit</span><span class=\"detail-value\">₹" + String.format("%.2f", policy.getCoverageAmount()) + "</span></div>" +
                                        "<div class=\"detail-row\"><span class=\"detail-label\">Expiry Date</span><span class=\"detail-value\">" + expiryDate + "</span></div>" +
                                        "</div>" +
                                        "<p style=\"margin-top: 24px;\">We've attached your digital policy document to this email (coming soon) or you can download it from your portal.</p>" +
                                        "</div>" +
                                        "<div class=\"footer\">&copy; 2026 SmartSure Insurance Management. Trusted by millions worldwide.</div>" +
                                        "</div></body></html>";

                                emailService.sendHtmlEmail(user.getEmail(), subject, htmlBody);
                                System.out.println("Email queued for policy purchase: " + user.getEmail());
                            }, () -> {
                                System.err.println("EMAIL ERROR: Policy not found for ID: " + transaction.getPolicyId());
                            });
                        }, () -> {
                            System.err.println("EMAIL ERROR: User not found for ID: " + transaction.getUserId());
                        });

                    } catch (Exception e) {
                        System.err.println("Failed to send purchase email: " + e.getMessage());
                    }

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
