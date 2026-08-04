package com.example.Tuition_Class_Management_System.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeacherStatsResponse {
    private long totalClasses;
    private long totalStudents;
    private long classesToday;
}
