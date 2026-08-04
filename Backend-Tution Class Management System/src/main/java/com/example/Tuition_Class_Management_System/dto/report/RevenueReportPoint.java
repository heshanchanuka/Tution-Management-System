package com.example.Tuition_Class_Management_System.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueReportPoint {
    private String month;
    private BigDecimal totalAmount;
}
