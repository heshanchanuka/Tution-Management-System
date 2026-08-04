package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.schoolclass.ClassRequest;
import com.example.Tuition_Class_Management_System.dto.schoolclass.ClassResponse;
import com.example.Tuition_Class_Management_System.dto.student.StudentResponse;
import com.example.Tuition_Class_Management_System.entity.SchoolClass;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.example.Tuition_Class_Management_System.entity.TeacherProfile;
import com.example.Tuition_Class_Management_System.exception.BusinessRuleViolationException;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.SchoolClassRepo;
import com.example.Tuition_Class_Management_System.repo.StudentRepo;
import com.example.Tuition_Class_Management_System.repo.TeacherProfileRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClassService {

    @Autowired
    private SchoolClassRepo schoolClassRepo;

    @Autowired
    private TeacherProfileRepo teacherProfileRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public ClassResponse createClass(ClassRequest request) {
        SchoolClass schoolClass = new SchoolClass();
        applyRequest(schoolClass, request);
        schoolClassRepo.save(schoolClass);
        return toResponse(schoolClass);
    }

    public PageResponse<ClassResponse> listClasses(String search, Pageable pageable) {
        var page = (search == null || search.isBlank())
                ? schoolClassRepo.findAll(pageable)
                : schoolClassRepo.findBySubjectContainingIgnoreCase(search, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    public ClassResponse getClass(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    @Transactional
    public ClassResponse updateClass(Long id, ClassRequest request) {
        SchoolClass schoolClass = findByIdOrThrow(id);

        if (request.getCapacity() < schoolClass.getStudents().size()) {
            throw new BusinessRuleViolationException(
                    "Capacity cannot be lower than the number of students already enrolled (" +
                            schoolClass.getStudents().size() + ")");
        }

        applyRequest(schoolClass, request);
        return toResponse(schoolClass);
    }

    @Transactional
    public void deleteClass(Long id) {
        schoolClassRepo.delete(findByIdOrThrow(id));
    }

    public List<StudentResponse> listEnrolledStudents(Long classId) {
        SchoolClass schoolClass = findByIdOrThrow(classId);
        return schoolClass.getStudents().stream().map(this::toStudentResponse).toList();
    }

    @Transactional
    public void enrollStudent(Long classId, Long studentId) {
        SchoolClass schoolClass = findByIdOrThrow(classId);
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (schoolClass.getStudents().contains(student)) {
            throw new BusinessRuleViolationException("Student is already enrolled in this class");
        }
        if (schoolClass.getStudents().size() >= schoolClass.getCapacity()) {
            throw new BusinessRuleViolationException("This class is already at full capacity");
        }

        schoolClass.getStudents().add(student);
        schoolClassRepo.save(schoolClass);
    }

    @Transactional
    public void unenrollStudent(Long classId, Long studentId) {
        SchoolClass schoolClass = findByIdOrThrow(classId);
        boolean removed = schoolClass.getStudents().removeIf(s -> s.getId().equals(studentId));

        if (!removed) {
            throw new ResourceNotFoundException("Student " + studentId + " is not enrolled in this class");
        }
        schoolClassRepo.save(schoolClass);
    }

    private void applyRequest(SchoolClass schoolClass, ClassRequest request) {
        TeacherProfile teacher = teacherProfileRepo.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + request.getTeacherId()));

        schoolClass.setSubject(request.getSubject());
        schoolClass.setGradeLevel(request.getGradeLevel());
        schoolClass.setTeacher(teacher);
        schoolClass.setDayOfWeek(request.getDayOfWeek());
        schoolClass.setStartTime(request.getStartTime());
        schoolClass.setEndTime(request.getEndTime());
        schoolClass.setFeeAmount(request.getFeeAmount());
        schoolClass.setCapacity(request.getCapacity());
    }

    private ClassResponse toResponse(SchoolClass schoolClass) {
        ClassResponse response = modelMapper.map(schoolClass, ClassResponse.class);
        response.setEnrolledCount(schoolClass.getStudents().size());
        return response;
    }

    private StudentResponse toStudentResponse(Student student) {
        return modelMapper.map(student, StudentResponse.class);
    }

    private SchoolClass findByIdOrThrow(Long id) {
        return schoolClassRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
    }
}
