package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.attendance.AttendanceResponse;
import com.example.Tuition_Class_Management_System.dto.attendance.MarkAttendanceRequest;
import com.example.Tuition_Class_Management_System.dto.attendance.UpdateAttendanceStatusRequest;
import com.example.Tuition_Class_Management_System.entity.Attendance;
import com.example.Tuition_Class_Management_System.entity.SchoolClass;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.example.Tuition_Class_Management_System.entity.TeacherProfile;
import com.example.Tuition_Class_Management_System.exception.BusinessRuleViolationException;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.AttendanceRepo;
import com.example.Tuition_Class_Management_System.repo.StudentRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepo attendanceRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private TeacherClassService teacherClassService;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public List<AttendanceResponse> markAttendance(Long classId, MarkAttendanceRequest request) {
        SchoolClass schoolClass = teacherClassService.ownedClassOrThrow(classId);
        TeacherProfile me = teacherClassService.currentTeacher();

        return request.getEntries().stream().map(entry -> {
            Student student = studentInClassOrThrow(schoolClass, entry.getStudentId());

            Attendance attendance = attendanceRepo
                    .findByStudent_IdAndSchoolClass_IdAndDate(student.getId(), classId, request.getDate())
                    .orElseGet(Attendance::new);

            attendance.setStudent(student);
            attendance.setSchoolClass(schoolClass);
            attendance.setDate(request.getDate());
            attendance.setStatus(entry.getStatus());
            attendance.setMarkedBy(me);
            attendance.setMarkedAt(LocalDateTime.now());

            attendanceRepo.save(attendance);
            return toResponse(attendance);
        }).toList();
    }

    public List<AttendanceResponse> getSession(Long classId, LocalDate date) {
        teacherClassService.ownedClassOrThrow(classId);
        return attendanceRepo.findBySchoolClass_IdAndDate(classId, date).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AttendanceResponse> getHistory(Long classId, LocalDate from, LocalDate to) {
        teacherClassService.ownedClassOrThrow(classId);
        return attendanceRepo.findBySchoolClass_IdAndDateBetween(classId, from, to).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AttendanceResponse updateStatus(Long attendanceId, UpdateAttendanceStatusRequest request) {
        Attendance attendance = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + attendanceId));

        teacherClassService.ownedClassOrThrow(attendance.getSchoolClass().getId());

        if (!attendance.getDate().equals(LocalDate.now())) {
            throw new BusinessRuleViolationException(
                    "Attendance can only be corrected on the same day it was marked");
        }

        attendance.setStatus(request.getStatus());
        return toResponse(attendance);
    }

    private AttendanceResponse toResponse(Attendance attendance) {
        return modelMapper.map(attendance, AttendanceResponse.class);
    }

    private Student studentInClassOrThrow(SchoolClass schoolClass, Long studentId) {
        return schoolClass.getStudents().stream()
                .filter(s -> s.getId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> {
                    if (!studentRepo.existsById(studentId)) {
                        return new ResourceNotFoundException("Student not found with id: " + studentId);
                    }
                    return new AccessDeniedException("Student " + studentId + " is not enrolled in this class");
                });
    }
}
