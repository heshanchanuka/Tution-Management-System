package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.dashboard.TeacherStatsResponse;
import com.example.Tuition_Class_Management_System.service.TeacherClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher/dashboard")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherDashboardController {

    @Autowired
    private TeacherClassService teacherClassService;

    @GetMapping("/stats")
    public ResponseEntity<TeacherStatsResponse> stats() {
        return ResponseEntity.ok(teacherClassService.stats());
    }
}
