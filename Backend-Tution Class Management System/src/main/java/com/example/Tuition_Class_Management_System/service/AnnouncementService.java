package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.announcement.AnnouncementCreateRequest;
import com.example.Tuition_Class_Management_System.dto.announcement.AnnouncementResponse;
import com.example.Tuition_Class_Management_System.entity.AppUser;
import com.example.Tuition_Class_Management_System.entity.Announcement;
import com.example.Tuition_Class_Management_System.entity.SchoolClass;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.AnnouncementRepo;
import com.example.Tuition_Class_Management_System.repo.AppUserRepo;
import com.example.Tuition_Class_Management_System.repo.SchoolClassRepo;
import com.example.Tuition_Class_Management_System.security.CurrentUserProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepo announcementRepo;

    @Autowired
    private SchoolClassRepo schoolClassRepo;

    @Autowired
    private AppUserRepo appUserRepo;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Transactional
    public AnnouncementResponse create(AnnouncementCreateRequest request) {
        AppUser postedBy = appUserRepo.findByUsername(currentUserProvider.getUsername())
                .orElseThrow(() -> new IllegalStateException("Logged-in user not found"));

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setMessage(request.getMessage());
        announcement.setPostedBy(postedBy);
        announcement.setExpiresAt(request.getExpiresAt());

        if (request.getTargetClassId() != null) {
            SchoolClass schoolClass = schoolClassRepo.findById(request.getTargetClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getTargetClassId()));
            announcement.setTargetClass(schoolClass);
        }

        announcementRepo.save(announcement);
        return toResponse(announcement);
    }

    public PageResponse<AnnouncementResponse> listAll(Pageable pageable) {
        return PageResponse.from(announcementRepo.findAllByOrderByPostedAtDesc(pageable), this::toResponse);
    }

    @Transactional
    public void delete(Long id) {
        if (!announcementRepo.existsById(id)) {
            throw new ResourceNotFoundException("Announcement not found with id: " + id);
        }
        announcementRepo.deleteById(id);
    }

    // Built manually rather than through ModelMapper: targetClass is
    // nullable, and a mapped getter chain would NPE on broadcast announcements.
    AnnouncementResponse toResponse(Announcement announcement) {
        AnnouncementResponse response = new AnnouncementResponse();
        response.setId(announcement.getId());
        response.setTitle(announcement.getTitle());
        response.setMessage(announcement.getMessage());
        response.setPostedByName(announcement.getPostedBy().getFullName());
        response.setPostedAt(announcement.getPostedAt());
        response.setExpiresAt(announcement.getExpiresAt());
        if (announcement.getTargetClass() != null) {
            response.setTargetClassId(announcement.getTargetClass().getId());
            response.setTargetClassSubject(announcement.getTargetClass().getSubject());
        }
        return response;
    }
}
