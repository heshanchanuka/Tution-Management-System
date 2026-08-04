package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.report.AttendanceSummaryResponse;
import com.example.Tuition_Class_Management_System.dto.report.ExamPerformancePoint;
import com.example.Tuition_Class_Management_System.dto.report.RevenueReportPoint;
import com.example.Tuition_Class_Management_System.entity.AttendanceStatus;
import com.example.Tuition_Class_Management_System.entity.ExamResult;
import com.example.Tuition_Class_Management_System.entity.Payment;
import com.example.Tuition_Class_Management_System.repo.AttendanceRepo;
import com.example.Tuition_Class_Management_System.repo.ExamResultRepo;
import com.example.Tuition_Class_Management_System.repo.PaymentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class ReportService {

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private AttendanceRepo attendanceRepo;

    @Autowired
    private ExamResultRepo examResultRepo;

    public List<RevenueReportPoint> revenue(int months) {
        LocalDate start = LocalDate.now().minusMonths(months - 1L).withDayOfMonth(1);

        Map<YearMonth, BigDecimal> totals = new TreeMap<>();
        for (int i = 0; i < months; i++) {
            totals.put(YearMonth.from(start.plusMonths(i)), BigDecimal.ZERO);
        }

        for (Payment payment : paymentRepo.findAll()) {
            YearMonth ym = YearMonth.from(payment.getPaymentDate());
            totals.computeIfPresent(ym, (k, v) -> v.add(payment.getAmountPaid()));
        }

        List<RevenueReportPoint> points = new ArrayList<>();
        totals.forEach((month, total) -> points.add(new RevenueReportPoint(month.toString(), total)));
        return points;
    }

    public AttendanceSummaryResponse attendanceSummary() {
        return new AttendanceSummaryResponse(
                attendanceRepo.countByStatus(AttendanceStatus.PRESENT),
                attendanceRepo.countByStatus(AttendanceStatus.ABSENT),
                attendanceRepo.countByStatus(AttendanceStatus.LATE)
        );
    }

    public List<ExamPerformancePoint> examPerformance() {
        Map<Long, String> subjectByClass = new HashMap<>();
        Map<Long, List<Double>> percentagesByClass = new HashMap<>();

        for (ExamResult result : examResultRepo.findAll()) {
            Long classId = result.getExam().getSchoolClass().getId();
            subjectByClass.putIfAbsent(classId, result.getExam().getSchoolClass().getSubject());

            double percentage = result.getMarksObtained().doubleValue()
                    / result.getExam().getMaxMarks().doubleValue() * 100;
            percentagesByClass.computeIfAbsent(classId, k -> new ArrayList<>()).add(percentage);
        }

        List<ExamPerformancePoint> points = new ArrayList<>();
        percentagesByClass.forEach((classId, percentages) -> {
            double average = percentages.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            points.add(new ExamPerformancePoint(classId, subjectByClass.get(classId), average));
        });
        return points;
    }
}
