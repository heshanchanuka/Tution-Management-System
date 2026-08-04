package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepo extends JpaRepository<Announcement, Long> {

    Page<Announcement> findAllByOrderByPostedAtDesc(Pageable pageable);

    List<Announcement> findByTargetClassIsNullOrderByPostedAtDesc();

    @Query("SELECT DISTINCT a FROM Announcement a WHERE a.targetClass IS NULL OR a.targetClass.id IN :classIds ORDER BY a.postedAt DESC")
    List<Announcement> findRelevantAnnouncements(@Param("classIds") List<Long> classIds);
}
