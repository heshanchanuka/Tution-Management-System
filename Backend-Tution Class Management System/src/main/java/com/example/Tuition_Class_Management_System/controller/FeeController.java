package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.fee.FeeInvoiceResponse;
import com.example.Tuition_Class_Management_System.dto.fee.GenerateInvoicesRequest;
import com.example.Tuition_Class_Management_System.dto.fee.PaymentCreateRequest;
import com.example.Tuition_Class_Management_System.dto.fee.PaymentResponse;
import com.example.Tuition_Class_Management_System.entity.Payment;
import com.example.Tuition_Class_Management_System.service.FeeService;
import com.example.Tuition_Class_Management_System.service.PaymentService;
import com.example.Tuition_Class_Management_System.service.ReceiptPdfService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/fees")
@PreAuthorize("hasRole('ADMIN')")
public class FeeController {

    @Autowired
    private FeeService feeService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ReceiptPdfService receiptPdfService;

    @PostMapping("/invoices")
    public ResponseEntity<List<FeeInvoiceResponse>> generateInvoices(@Valid @RequestBody GenerateInvoicesRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.generateInvoices(request));
    }

    @GetMapping("/invoices/student/{studentId}")
    public ResponseEntity<PageResponse<FeeInvoiceResponse>> invoicesForStudent(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id"));
        return ResponseEntity.ok(feeService.invoicesForStudent(studentId, pageable));
    }

    @GetMapping("/invoices/overdue")
    public ResponseEntity<PageResponse<FeeInvoiceResponse>> overdueInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dueDate"));
        return ResponseEntity.ok(feeService.overdueInvoices(pageable));
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<FeeInvoiceResponse> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(feeService.getInvoice(id));
    }

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> recordPayment(@Valid @RequestBody PaymentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.recordPayment(request));
    }

    @GetMapping("/payments/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponse>> paymentsForInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.paymentsForInvoice(invoiceId));
    }

    @GetMapping("/receipts/{paymentId}")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long paymentId) {
        Payment payment = paymentService.findByIdOrThrow(paymentId);
        byte[] pdf = receiptPdfService.generateReceipt(payment);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(payment.getReceiptNumber() + ".pdf")
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(pdf);
    }
}
