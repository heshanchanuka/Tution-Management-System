package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.exam.BulkMarksRequest;
import com.example.Tuition_Class_Management_System.dto.exam.ExamCreateRequest;
import com.example.Tuition_Class_Management_System.dto.exam.ExamResponse;
import com.example.Tuition_Class_Management_System.dto.exam.ExamResultResponse;
import com.example.Tuition_Class_Management_System.entity.Exam;
import com.example.Tuition_Class_Management_System.entity.ExamResult;
import com.example.Tuition_Class_Management_System.entity.SchoolClass;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.ExamRepo;
import com.example.Tuition_Class_Management_System.repo.ExamResultRepo;
import com.example.Tuition_Class_Management_System.util.GradeCalculator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExamService {

    @Autowired
    private ExamRepo examRepo;

    @Autowired
    private ExamResultRepo examResultRepo;

    @Autowired
    private TeacherClassService teacherClassService;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public ExamResponse createExam(ExamCreateRequest request) {
        SchoolClass schoolClass = teacherClassService.ownedClassOrThrow(request.getClassId());

        Exam exam = new Exam();
        exam.setName(request.getName());
        exam.setSchoolClass(schoolClass);
        exam.setExamDate(request.getExamDate());
        exam.setMaxMarks(request.getMaxMarks());
        examRepo.save(exam);

        return toResponse(exam);
    }

    public List<ExamResponse> examsForClass(Long classId) {
        teacherClassService.ownedClassOrThrow(classId);
        return examRepo.findBySchoolClass_Id(classId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<ExamResultResponse> saveResults(Long examId, BulkMarksRequest request) {
        Exam exam = examOwnedByCurrentTeacherOrThrow(examId);
        SchoolClass schoolClass = exam.getSchoolClass();

        return request.getEntries().stream().map(entry -> {
            Student student = studentInClassOrThrow(schoolClass, entry.getStudentId());

            ExamResult result = examResultRepo.findByExam_IdAndStudent_Id(examId, student.getId())
                    .orElseGet(ExamResult::new);
            result.setExam(exam);
            result.setStudent(student);
            result.setMarksObtained(entry.getMarksObtained());
            result.setRemarks(entry.getRemarks());

            examResultRepo.save(result);
            return toResponse(result);
        }).toList();
    }

    public List<ExamResultResponse> getResults(Long examId) {
        examOwnedByCurrentTeacherOrThrow(examId);
        return examResultRepo.findByExam_Id(examId).stream().map(this::toResponse).toList();
    }

    private ExamResponse toResponse(Exam exam) {
        return modelMapper.map(exam, ExamResponse.class);
    }

    private ExamResultResponse toResponse(ExamResult result) {
        ExamResultResponse response = modelMapper.map(result, ExamResultResponse.class);
        response.setGrade(GradeCalculator.compute(result.getMarksObtained(), result.getExam().getMaxMarks()));
        return response;
    }

    private Exam examOwnedByCurrentTeacherOrThrow(Long examId) {
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));
        // Reuses the class-ownership check - an exam is only ever visible through its class.
        teacherClassService.ownedClassOrThrow(exam.getSchoolClass().getId());
        return exam;
    }

    private Student studentInClassOrThrow(SchoolClass schoolClass, Long studentId) {
        return schoolClass.getStudents().stream()
                .filter(s -> s.getId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new AccessDeniedException("Student " + studentId + " is not enrolled in this class"));
    }
}
