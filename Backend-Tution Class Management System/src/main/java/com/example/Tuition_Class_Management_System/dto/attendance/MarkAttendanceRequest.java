package com.example.Tuition_Class_Management_System.dto.attendance;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class MarkAttendanceRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotEmpty(message = "At least one attendance entry is required")
    @Valid
    private List<AttendanceEntry> entries;
}
