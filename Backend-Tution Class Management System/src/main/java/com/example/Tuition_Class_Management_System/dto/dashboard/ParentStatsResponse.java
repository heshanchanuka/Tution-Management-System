package com.example.Tuition_Class_Management_System.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParentStatsResponse {
    private long totalChildren;
    private BigDecimal totalOutstandingBalance;
    private double overallAttendanceRate;
}
