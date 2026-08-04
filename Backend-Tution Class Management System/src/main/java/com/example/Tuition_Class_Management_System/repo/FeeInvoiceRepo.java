package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.FeeInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeeInvoiceRepo extends JpaRepository<FeeInvoice, Long> {

    Page<FeeInvoice> findByStudent_Id(Long studentId, Pageable pageable);

    List<FeeInvoice> findBySchoolClass_Id(Long classId);

    Optional<FeeInvoice> findByStudent_IdAndSchoolClass_IdAndPeriod(Long studentId, Long classId, String period);

    // Whether an invoice is overdue depends on today's date, not just what was
    // last written - computed live here rather than trusted from the stored
    // status column, which only reflects the status as of the last payment.
    @Query("SELECT f FROM FeeInvoice f WHERE f.dueDate < :today AND f.amountPaid < f.amountDue")
    Page<FeeInvoice> findOverdue(@Param("today") LocalDate today, Pageable pageable);
}
