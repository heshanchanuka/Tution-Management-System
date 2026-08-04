package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.student.StudentRequest;
import com.example.Tuition_Class_Management_System.dto.student.StudentResponse;
import com.example.Tuition_Class_Management_System.entity.ParentProfile;
import com.example.Tuition_Class_Management_System.entity.SchoolClass;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.ParentProfileRepo;
import com.example.Tuition_Class_Management_System.repo.SchoolClassRepo;
import com.example.Tuition_Class_Management_System.repo.StudentRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private ParentProfileRepo parentProfileRepo;

    @Autowired
    private SchoolClassRepo schoolClassRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        ParentProfile parent = findParentOrThrow(request.getParentId());

        Student student = new Student();
        student.setFullName(request.getFullName());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGradeLevel(request.getGradeLevel());
        student.setParent(parent);

        studentRepo.save(student);
        return toResponse(student);
    }

    public PageResponse<StudentResponse> listStudents(String search, Pageable pageable) {
        var page = (search == null || search.isBlank())
                ? studentRepo.findAll(pageable)
                : studentRepo.findByFullNameContainingIgnoreCase(search, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    public StudentResponse getStudent(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = findByIdOrThrow(id);
        ParentProfile parent = findParentOrThrow(request.getParentId());

        student.setFullName(request.getFullName());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGradeLevel(request.getGradeLevel());
        student.setParent(parent);

        return toResponse(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = findByIdOrThrow(id);

        // Student doesn't own the class<->student join table, so it has to be
        // detached from every enrolled class first or the FK delete will fail.
        for (SchoolClass schoolClass : schoolClassRepo.findByStudents_Id(id)) {
            schoolClass.getStudents().remove(student);
            schoolClassRepo.save(schoolClass);
        }

        studentRepo.delete(student);
    }

    private StudentResponse toResponse(Student student) {
        return modelMapper.map(student, StudentResponse.class);
    }

    private Student findByIdOrThrow(Long id) {
        return studentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    private ParentProfile findParentOrThrow(Long parentId) {
        return parentProfileRepo.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + parentId));
    }
}
