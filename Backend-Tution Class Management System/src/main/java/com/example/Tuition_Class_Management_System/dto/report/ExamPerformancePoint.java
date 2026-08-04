package com.example.Tuition_Class_Management_System.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamPerformancePoint {
    private Long classId;
    private String subject;
    private double averagePercentage;
}
