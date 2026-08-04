package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepo extends JpaRepository<Payment, Long> {

    List<Payment> findByFeeInvoice_Id(Long invoiceId);

    List<Payment> findByPaymentDateBetween(LocalDate from, LocalDate to);
}
