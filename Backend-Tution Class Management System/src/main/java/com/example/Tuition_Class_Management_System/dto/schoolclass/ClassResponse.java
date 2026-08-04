package com.example.Tuition_Class_Management_System.dto.schoolclass;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@NoArgsConstructor
public class ClassResponse {

    private Long id;
    private String subject;
    private String gradeLevel;
    private Long teacherId;
    private String teacherName;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal feeAmount;
    private int capacity;
    private int enrolledCount;
}
