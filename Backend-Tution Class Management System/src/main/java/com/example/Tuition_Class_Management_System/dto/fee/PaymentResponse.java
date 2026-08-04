package com.example.Tuition_Class_Management_System.dto.fee;

import com.example.Tuition_Class_Management_System.entity.PaymentMethod;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class PaymentResponse {

    private Long id;
    private Long invoiceId;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private PaymentMethod method;
    private String receivedByUsername;
    private String receiptNumber;
}
