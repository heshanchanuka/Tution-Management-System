package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.fee.PaymentCreateRequest;
import com.example.Tuition_Class_Management_System.dto.fee.PaymentResponse;
import com.example.Tuition_Class_Management_System.entity.AppUser;
import com.example.Tuition_Class_Management_System.entity.FeeInvoice;
import com.example.Tuition_Class_Management_System.entity.Payment;
import com.example.Tuition_Class_Management_System.exception.BusinessRuleViolationException;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.AppUserRepo;
import com.example.Tuition_Class_Management_System.repo.FeeInvoiceRepo;
import com.example.Tuition_Class_Management_System.repo.PaymentRepo;
import com.example.Tuition_Class_Management_System.security.CurrentUserProvider;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private FeeInvoiceRepo feeInvoiceRepo;

    @Autowired
    private AppUserRepo appUserRepo;

    @Autowired
    private FeeService feeService;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public PaymentResponse recordPayment(PaymentCreateRequest request) {
        FeeInvoice invoice = feeService.findByIdOrThrow(request.getInvoiceId());

        BigDecimal remaining = invoice.getAmountDue().subtract(invoice.getAmountPaid());
        if (request.getAmountPaid().compareTo(remaining) > 0) {
            throw new BusinessRuleViolationException(
                    "Payment of " + request.getAmountPaid() + " exceeds the remaining balance of " + remaining);
        }

        AppUser receivedBy = appUserRepo.findByUsername(currentUserProvider.getUsername())
                .orElseThrow(() -> new IllegalStateException("Logged-in user not found"));

        Payment payment = new Payment();
        payment.setFeeInvoice(invoice);
        payment.setAmountPaid(request.getAmountPaid());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setMethod(request.getMethod());
        payment.setReceivedBy(receivedBy);
        payment.setReceiptNumber("RCPT-" + System.currentTimeMillis());
        paymentRepo.save(payment);

        invoice.setAmountPaid(invoice.getAmountPaid().add(request.getAmountPaid()));
        invoice.setStatus(FeeService.liveStatus(invoice));
        feeInvoiceRepo.save(invoice);

        return toResponse(payment);
    }

    public List<PaymentResponse> paymentsForInvoice(Long invoiceId) {
        feeService.findByIdOrThrow(invoiceId);
        return paymentRepo.findByFeeInvoice_Id(invoiceId).stream().map(this::toResponse).toList();
    }

    public Payment findByIdOrThrow(Long paymentId) {
        return paymentRepo.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
    }

    private PaymentResponse toResponse(Payment payment) {
        return modelMapper.map(payment, PaymentResponse.class);
    }
}
