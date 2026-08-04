package com.example.Tuition_Class_Management_System.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fee_invoice", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "class_id", "period"})
})
@Data
public class FeeInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    /** e.g. "2026-08" - one invoice per student per class per billing period. */
    @Column(nullable = false)
    private String period;

    @Column(nullable = false)
    private BigDecimal amountDue;

    @Column(nullable = false)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeeInvoiceStatus status = FeeInvoiceStatus.DUE;

    @Column(nullable = false)
    private LocalDate dueDate;
}
