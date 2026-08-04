package com.example.Tuition_Class_Management_System.dto.schoolclass;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class ClassRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Grade level is required")
    private String gradeLevel;

    @NotNull(message = "Teacher is required")
    private Long teacherId;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Fee amount is required")
    @Positive(message = "Fee amount must be positive")
    private BigDecimal feeAmount;

    @Positive(message = "Capacity must be positive")
    private int capacity;
}
