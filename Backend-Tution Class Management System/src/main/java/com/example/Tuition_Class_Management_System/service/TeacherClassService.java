package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.dashboard.TeacherStatsResponse;
import com.example.Tuition_Class_Management_System.dto.schoolclass.ClassResponse;
import com.example.Tuition_Class_Management_System.dto.student.StudentResponse;
import com.example.Tuition_Class_Management_System.entity.SchoolClass;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.example.Tuition_Class_Management_System.entity.TeacherProfile;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.SchoolClassRepo;
import com.example.Tuition_Class_Management_System.repo.TeacherProfileRepo;
import com.example.Tuition_Class_Management_System.security.CurrentUserProvider;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Read-only "my classes" access for the logged-in teacher. Every lookup is
 * scoped to classes owned by the current teacher - never trusts a class id
 * on its own.
 */
@Service
public class TeacherClassService {

    @Autowired
    private SchoolClassRepo schoolClassRepo;

    @Autowired
    private TeacherProfileRepo teacherProfileRepo;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private ModelMapper modelMapper;

    public List<ClassResponse> myClasses() {
        TeacherProfile me = currentTeacher();
        return schoolClassRepo.findAll().stream()
                .filter(c -> c.getTeacher().getId().equals(me.getId()))
                .map(this::toResponse)
                .toList();
    }

    public ClassResponse getMyClass(Long classId) {
        return toResponse(ownedClassOrThrow(classId));
    }

    private ClassResponse toResponse(SchoolClass schoolClass) {
        ClassResponse response = modelMapper.map(schoolClass, ClassResponse.class);
        response.setEnrolledCount(schoolClass.getStudents().size());
        return response;
    }

    public List<StudentResponse> roster(Long classId) {
        SchoolClass schoolClass = ownedClassOrThrow(classId);
        return schoolClass.getStudents().stream()
                .map(s -> modelMapper.map(s, StudentResponse.class))
                .toList();
    }

    public TeacherStatsResponse stats() {
        TeacherProfile me = currentTeacher();
        List<SchoolClass> myClasses = schoolClassRepo.findAll().stream()
                .filter(c -> c.getTeacher().getId().equals(me.getId()))
                .toList();

        Set<Long> uniqueStudentIds = new HashSet<>();
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        long classesToday = 0;

        for (SchoolClass c : myClasses) {
            for (Student s : c.getStudents()) {
                uniqueStudentIds.add(s.getId());
            }
            if (c.getDayOfWeek() == today) {
                classesToday++;
            }
        }

        return new TeacherStatsResponse(myClasses.size(), uniqueStudentIds.size(), classesToday);
    }

    SchoolClass ownedClassOrThrow(Long classId) {
        SchoolClass schoolClass = schoolClassRepo.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));

        TeacherProfile me = currentTeacher();
        if (!schoolClass.getTeacher().getId().equals(me.getId())) {
            throw new AccessDeniedException("You are not assigned to this class");
        }
        return schoolClass;
    }

    TeacherProfile currentTeacher() {
        String username = currentUserProvider.getUsername();
        return teacherProfileRepo.findByAppUser_Username(username)
                .orElseThrow(() -> new IllegalStateException("Logged-in user has no teacher profile"));
    }
}
