package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.exam.BulkMarksRequest;
import com.example.Tuition_Class_Management_System.dto.exam.ExamCreateRequest;
import com.example.Tuition_Class_Management_System.dto.exam.ExamResponse;
import com.example.Tuition_Class_Management_System.dto.exam.ExamResultResponse;
import com.example.Tuition_Class_Management_System.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/exams")
@PreAuthorize("hasRole('TEACHER')")
public class ExamController {

    @Autowired
    private ExamService examService;

    @PostMapping
    public ResponseEntity<ExamResponse> create(@Valid @RequestBody ExamCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createExam(request));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ExamResponse>> examsForClass(@PathVariable Long classId) {
        return ResponseEntity.ok(examService.examsForClass(classId));
    }

    @PostMapping("/{examId}/results")
    public ResponseEntity<List<ExamResultResponse>> saveResults(@PathVariable Long examId, @Valid @RequestBody BulkMarksRequest request) {
        return ResponseEntity.ok(examService.saveResults(examId, request));
    }

    @GetMapping("/{examId}/results")
    public ResponseEntity<List<ExamResultResponse>> getResults(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getResults(examId));
    }
}
