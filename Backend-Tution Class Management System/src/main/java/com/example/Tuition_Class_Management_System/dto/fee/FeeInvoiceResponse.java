package com.example.Tuition_Class_Management_System.dto.fee;

import com.example.Tuition_Class_Management_System.entity.FeeInvoiceStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class FeeInvoiceResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long classId;
    private String subject;
    private String period;
    private BigDecimal amountDue;
    private BigDecimal amountPaid;
    private FeeInvoiceStatus status;
    private LocalDate dueDate;
}
