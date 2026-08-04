package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.report.AttendanceSummaryResponse;
import com.example.Tuition_Class_Management_System.dto.report.ExamPerformancePoint;
import com.example.Tuition_Class_Management_System.dto.report.RevenueReportPoint;
import com.example.Tuition_Class_Management_System.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueReportPoint>> revenue(@RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(reportService.revenue(months));
    }

    @GetMapping("/attendance-summary")
    public ResponseEntity<AttendanceSummaryResponse> attendanceSummary() {
        return ResponseEntity.ok(reportService.attendanceSummary());
    }

    @GetMapping("/exam-performance")
    public ResponseEntity<List<ExamPerformancePoint>> examPerformance() {
        return ResponseEntity.ok(reportService.examPerformance());
    }
}
