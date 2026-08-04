package com.example.Tuition_Class_Management_System.dto.attendance;

import com.example.Tuition_Class_Management_System.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAttendanceStatusRequest {

    @NotNull(message = "Status is required")
    private AttendanceStatus status;
}
