package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.RegisterRequest;
import com.example.Tuition_Class_Management_System.dto.parent.ParentCreateRequest;
import com.example.Tuition_Class_Management_System.dto.parent.ParentResponse;
import com.example.Tuition_Class_Management_System.dto.parent.ParentUpdateRequest;
import com.example.Tuition_Class_Management_System.entity.AppUser;
import com.example.Tuition_Class_Management_System.entity.ParentProfile;
import com.example.Tuition_Class_Management_System.entity.Role;
import com.example.Tuition_Class_Management_System.exception.BusinessRuleViolationException;
import com.example.Tuition_Class_Management_System.exception.DuplicateResourceException;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.AppUserRepo;
import com.example.Tuition_Class_Management_System.repo.ParentProfileRepo;
import com.example.Tuition_Class_Management_System.repo.RoleRepo;
import com.example.Tuition_Class_Management_System.repo.StudentRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class ParentService {

    @Autowired
    private ParentProfileRepo parentProfileRepo;

    @Autowired
    private AppUserRepo appUserRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public ParentResponse createParent(ParentCreateRequest request) {
        // Admin-created accounts are trusted, so they're active straight away.
        ParentProfile profile = createAccount(request.getUsername(), request.getPassword(), request.getFullName(),
                request.getPhone(), request.getAddress(), request.getOccupation(), true);
        return toResponse(profile);
    }

    /**
     * Self-registration from the public sign-up page. The account is created
     * disabled and can't log in until an admin approves it.
     */
    @Transactional
    public ParentProfile registerParent(RegisterRequest request) {
        return createAccount(request.getUsername(), request.getPassword(), request.getFullName(),
                request.getPhone(), request.getAddress(), request.getOccupation(), false);
    }

    public PageResponse<ParentResponse> listPendingParents(Pageable pageable) {
        return PageResponse.from(parentProfileRepo.findByAppUser_EnabledFalse(pageable), this::toResponse);
    }

    @Transactional
    public ParentResponse approveParent(Long id) {
        ParentProfile profile = findByIdOrThrow(id);
        AppUser user = profile.getAppUser();
        if (user.isEnabled()) {
            throw new BusinessRuleViolationException("This parent account is already active");
        }
        user.setEnabled(true);
        return toResponse(profile);
    }

    /** Rejecting a pending registration removes it entirely so the username can be reused. */
    @Transactional
    public void rejectParent(Long id) {
        ParentProfile profile = findByIdOrThrow(id);
        if (profile.getAppUser().isEnabled()) {
            throw new BusinessRuleViolationException(
                    "Only pending registrations can be rejected - this parent account is already active");
        }
        deleteParent(id);
    }

    public PageResponse<ParentResponse> listParents(String search, Pageable pageable) {
        var page = (search == null || search.isBlank())
                ? parentProfileRepo.findAll(pageable)
                : parentProfileRepo.findByAppUser_FullNameContainingIgnoreCase(search, pageable);
        return PageResponse.from(page, this::toResponse);
    }

    public ParentResponse getParent(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    @Transactional
    public ParentResponse updateParent(Long id, ParentUpdateRequest request) {
        ParentProfile profile = findByIdOrThrow(id);
        profile.setAddress(request.getAddress());
        profile.setOccupation(request.getOccupation());

        AppUser user = profile.getAppUser();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        return toResponse(profile);
    }

    @Transactional
    public void deleteParent(Long id) {
        ParentProfile profile = findByIdOrThrow(id);

        if (studentRepo.existsByParent_Id(id)) {
            throw new BusinessRuleViolationException(
                    "Cannot delete a parent who still has students enrolled");
        }

        AppUser user = profile.getAppUser();
        parentProfileRepo.delete(profile);
        appUserRepo.delete(user);
    }

    private ParentProfile createAccount(String username, String rawPassword, String fullName,
                                        String phone, String address, String occupation, boolean enabled) {
        if (appUserRepo.existsByUsername(username)) {
            throw new DuplicateResourceException("A user with username '" + username + "' already exists");
        }

        Role parentRole = roleRepo.findById("PARENT")
                .orElseThrow(() -> new IllegalStateException("PARENT role is not seeded"));

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setFullName(fullName);
        user.setPhone(phone);
        user.setEnabled(enabled);
        user.setRoles(Set.of(parentRole));
        appUserRepo.save(user);

        ParentProfile profile = new ParentProfile();
        profile.setAppUser(user);
        profile.setAddress(address);
        profile.setOccupation(occupation);
        parentProfileRepo.save(profile);
        return profile;
    }

    private ParentResponse toResponse(ParentProfile profile) {
        return modelMapper.map(profile, ParentResponse.class);
    }

    private ParentProfile findByIdOrThrow(Long id) {
        return parentProfileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + id));
    }
}
