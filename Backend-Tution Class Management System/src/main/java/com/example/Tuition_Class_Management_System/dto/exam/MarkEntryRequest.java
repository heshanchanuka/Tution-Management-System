package com.example.Tuition_Class_Management_System.dto.exam;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MarkEntryRequest {

    @NotNull(message = "Student id is required")
    private Long studentId;

    @NotNull(message = "Marks obtained is required")
    @PositiveOrZero(message = "Marks obtained cannot be negative")
    private BigDecimal marksObtained;

    private String remarks;
}
