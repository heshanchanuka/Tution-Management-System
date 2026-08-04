package com.example.Tuition_Class_Management_System.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminStatsResponse {
    private long totalStudents;
    private long totalTeachers;
    private long totalParents;
    private long totalClasses;
    private BigDecimal monthlyRevenue;
    private double todayAttendanceRate;
}
