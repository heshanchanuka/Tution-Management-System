package com.example.Tuition_Class_Management_System.dto.attendance;

import com.example.Tuition_Class_Management_System.entity.AttendanceStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class AttendanceResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long classId;
    private String subject;
    private LocalDate date;
    private AttendanceStatus status;
}
