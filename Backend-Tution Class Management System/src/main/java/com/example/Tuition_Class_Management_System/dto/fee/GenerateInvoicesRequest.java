package com.example.Tuition_Class_Management_System.dto.fee;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GenerateInvoicesRequest {

    @NotNull(message = "Class is required")
    private Long classId;

    @NotBlank(message = "Period is required")
    private String period;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
}
