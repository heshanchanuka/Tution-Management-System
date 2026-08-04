package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.attendance.AttendanceResponse;
import com.example.Tuition_Class_Management_System.dto.attendance.MarkAttendanceRequest;
import com.example.Tuition_Class_Management_System.dto.attendance.UpdateAttendanceStatusRequest;
import com.example.Tuition_Class_Management_System.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/attendance")
@PreAuthorize("hasRole('TEACHER')")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/class/{classId}")
    public ResponseEntity<List<AttendanceResponse>> mark(@PathVariable Long classId, @Valid @RequestBody MarkAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.markAttendance(classId, request));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<AttendanceResponse>> getSession(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getSession(classId, date));
    }

    @GetMapping("/class/{classId}/history")
    public ResponseEntity<List<AttendanceResponse>> getHistory(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(attendanceService.getHistory(classId, from, to));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateAttendanceStatusRequest request) {
        return ResponseEntity.ok(attendanceService.updateStatus(id, request));
    }
}
