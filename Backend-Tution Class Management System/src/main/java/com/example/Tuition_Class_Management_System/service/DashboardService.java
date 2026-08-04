package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.dashboard.AdminStatsResponse;
import com.example.Tuition_Class_Management_System.entity.Attendance;
import com.example.Tuition_Class_Management_System.entity.AttendanceStatus;
import com.example.Tuition_Class_Management_System.entity.Payment;
import com.example.Tuition_Class_Management_System.repo.AttendanceRepo;
import com.example.Tuition_Class_Management_System.repo.ParentProfileRepo;
import com.example.Tuition_Class_Management_System.repo.PaymentRepo;
import com.example.Tuition_Class_Management_System.repo.SchoolClassRepo;
import com.example.Tuition_Class_Management_System.repo.StudentRepo;
import com.example.Tuition_Class_Management_System.repo.TeacherProfileRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private TeacherProfileRepo teacherProfileRepo;

    @Autowired
    private ParentProfileRepo parentProfileRepo;

    @Autowired
    private SchoolClassRepo schoolClassRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private AttendanceRepo attendanceRepo;

    public AdminStatsResponse stats() {
        LocalDate today = LocalDate.now();
        LocalDate firstOfMonth = today.withDayOfMonth(1);
        LocalDate lastOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        BigDecimal monthlyRevenue = paymentRepo.findByPaymentDateBetween(firstOfMonth, lastOfMonth).stream()
                .map(Payment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Attendance> todayRecords = attendanceRepo.findByDate(today);
        long present = todayRecords.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        double todayAttendanceRate = todayRecords.isEmpty() ? 0 : (double) present / todayRecords.size() * 100;

        return new AdminStatsResponse(
                studentRepo.count(),
                teacherProfileRepo.count(),
                parentProfileRepo.count(),
                schoolClassRepo.count(),
                monthlyRevenue,
                todayAttendanceRate
        );
    }
}
