package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.teacher.TeacherCreateRequest;
import com.example.Tuition_Class_Management_System.dto.teacher.TeacherResponse;
import com.example.Tuition_Class_Management_System.dto.teacher.TeacherUpdateRequest;
import com.example.Tuition_Class_Management_System.entity.AppUser;
import com.example.Tuition_Class_Management_System.entity.Role;
import com.example.Tuition_Class_Management_System.entity.TeacherProfile;
import com.example.Tuition_Class_Management_System.exception.BusinessRuleViolationException;
import com.example.Tuition_Class_Management_System.exception.DuplicateResourceException;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.AppUserRepo;
import com.example.Tuition_Class_Management_System.repo.RoleRepo;
import com.example.Tuition_Class_Management_System.repo.SchoolClassRepo;
import com.example.Tuition_Class_Management_System.repo.TeacherProfileRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class TeacherService {

    @Autowired
    private TeacherProfileRepo teacherProfileRepo;

    @Autowired
    private AppUserRepo appUserRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private SchoolClassRepo schoolClassRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public TeacherResponse createTeacher(TeacherCreateRequest request) {
        if (appUserRepo.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("A user with username '" + request.getUsername() + "' already exists");
        }

        Role teacherRole = roleRepo.findById("TEACHER")
                .orElseThrow(() -> new IllegalStateException("TEACHER role is not seeded"));

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setEnabled(true);
        user.setRoles(Set.of(teacherRole));
        appUserRepo.save(user);

        TeacherProfile profile = new TeacherProfile();
        profile.setAppUser(user);
        profile.setQualifications(request.getQualifications());
        profile.setSubjectSpecialty(request.getSubjectSpecialty());
        teacherProfileRepo.save(profile);

        return toResponse(profile);
    }

    public PageResponse<TeacherResponse> listTeachers(String search, Pageable pageable) {
        var page = (search == null || search.isBlank())
                ? teacherProfileRepo.findAll(pageable)
                : teacherProfileRepo.findByAppUser_FullNameContainingIgnoreCase(search, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    public TeacherResponse getTeacher(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    @Transactional
    public TeacherResponse updateTeacher(Long id, TeacherUpdateRequest request) {
        TeacherProfile profile = findByIdOrThrow(id);
        profile.setQualifications(request.getQualifications());
        profile.setSubjectSpecialty(request.getSubjectSpecialty());

        AppUser user = profile.getAppUser();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        return toResponse(profile);
    }

    @Transactional
    public void deleteTeacher(Long id) {
        TeacherProfile profile = findByIdOrThrow(id);

        if (schoolClassRepo.existsByTeacher_Id(id)) {
            throw new BusinessRuleViolationException(
                    "Cannot delete a teacher who is still assigned to one or more classes");
        }

        AppUser user = profile.getAppUser();
        teacherProfileRepo.delete(profile);
        appUserRepo.delete(user);
    }

    private TeacherResponse toResponse(TeacherProfile profile) {
        return modelMapper.map(profile, TeacherResponse.class);
    }

    private TeacherProfile findByIdOrThrow(Long id) {
        return teacherProfileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
    }
}
