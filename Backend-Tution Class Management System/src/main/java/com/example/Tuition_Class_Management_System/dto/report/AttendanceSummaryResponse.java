package com.example.Tuition_Class_Management_System.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceSummaryResponse {
    private long present;
    private long absent;
    private long late;
}
