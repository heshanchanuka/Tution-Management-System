package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.Attendance;
import com.example.Tuition_Class_Management_System.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepo extends JpaRepository<Attendance, Long> {

    List<Attendance> findBySchoolClass_IdAndDate(Long classId, LocalDate date);

    List<Attendance> findBySchoolClass_IdAndDateBetween(Long classId, LocalDate from, LocalDate to);

    Optional<Attendance> findByStudent_IdAndSchoolClass_IdAndDate(Long studentId, Long classId, LocalDate date);

    List<Attendance> findByStudent_Id(Long studentId);

    List<Attendance> findByStudent_IdAndDateBetween(Long studentId, LocalDate from, LocalDate to);

    List<Attendance> findByDate(LocalDate date);

    long countByStatus(AttendanceStatus status);
}
