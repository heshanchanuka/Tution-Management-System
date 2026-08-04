package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.schoolclass.ClassResponse;
import com.example.Tuition_Class_Management_System.dto.student.StudentResponse;
import com.example.Tuition_Class_Management_System.service.TeacherClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/classes")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherClassController {

    @Autowired
    private TeacherClassService teacherClassService;

    @GetMapping
    public ResponseEntity<List<ClassResponse>> myClasses() {
        return ResponseEntity.ok(teacherClassService.myClasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassResponse> getClass(@PathVariable Long id) {
        return ResponseEntity.ok(teacherClassService.getMyClass(id));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<StudentResponse>> roster(@PathVariable Long id) {
        return ResponseEntity.ok(teacherClassService.roster(id));
    }
}
