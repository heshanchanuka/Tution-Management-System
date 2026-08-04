package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.announcement.AnnouncementResponse;
import com.example.Tuition_Class_Management_System.dto.attendance.AttendanceResponse;
import com.example.Tuition_Class_Management_System.dto.dashboard.ParentStatsResponse;
import com.example.Tuition_Class_Management_System.dto.exam.StudentResultResponse;
import com.example.Tuition_Class_Management_System.dto.fee.FeeInvoiceResponse;
import com.example.Tuition_Class_Management_System.dto.fee.PaymentResponse;
import com.example.Tuition_Class_Management_System.dto.student.StudentResponse;
import com.example.Tuition_Class_Management_System.entity.Announcement;
import com.example.Tuition_Class_Management_System.entity.Attendance;
import com.example.Tuition_Class_Management_System.entity.AttendanceStatus;
import com.example.Tuition_Class_Management_System.entity.ExamResult;
import com.example.Tuition_Class_Management_System.entity.FeeInvoice;
import com.example.Tuition_Class_Management_System.entity.ParentProfile;
import com.example.Tuition_Class_Management_System.entity.Payment;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.AnnouncementRepo;
import com.example.Tuition_Class_Management_System.repo.AttendanceRepo;
import com.example.Tuition_Class_Management_System.repo.ExamResultRepo;
import com.example.Tuition_Class_Management_System.repo.FeeInvoiceRepo;
import com.example.Tuition_Class_Management_System.repo.ParentProfileRepo;
import com.example.Tuition_Class_Management_System.repo.PaymentRepo;
import com.example.Tuition_Class_Management_System.repo.SchoolClassRepo;
import com.example.Tuition_Class_Management_System.repo.StudentRepo;
import com.example.Tuition_Class_Management_System.security.CurrentUserProvider;
import com.example.Tuition_Class_Management_System.util.GradeCalculator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Every read here is scoped to the logged-in parent's own children - never
 * trusts a studentId/invoiceId/paymentId on its own, always walks back to
 * confirm it belongs to the current parent first. This is the parent
 * equivalent of TeacherClassService's ownedClassOrThrow().
 */
@Service
public class ParentPortalService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private ParentProfileRepo parentProfileRepo;

    @Autowired
    private AttendanceRepo attendanceRepo;

    @Autowired
    private FeeInvoiceRepo feeInvoiceRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private ExamResultRepo examResultRepo;

    @Autowired
    private SchoolClassRepo schoolClassRepo;

    @Autowired
    private AnnouncementRepo announcementRepo;

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private ModelMapper modelMapper;

    public List<StudentResponse> myChildren() {
        ParentProfile me = currentParent();
        return studentRepo.findByParent_Id(me.getId()).stream()
                .map(s -> modelMapper.map(s, StudentResponse.class))
                .toList();
    }

    public StudentResponse getChild(Long studentId) {
        return modelMapper.map(ownedStudentOrThrow(studentId), StudentResponse.class);
    }

    public List<AttendanceResponse> attendanceHistory(Long studentId, LocalDate from, LocalDate to) {
        ownedStudentOrThrow(studentId);
        return attendanceRepo.findByStudent_IdAndDateBetween(studentId, from, to).stream()
                .map(a -> modelMapper.map(a, AttendanceResponse.class))
                .toList();
    }

    public List<FeeInvoiceResponse> fees(Long studentId) {
        ownedStudentOrThrow(studentId);
        return feeInvoiceRepo.findByStudent_Id(studentId, Pageable.unpaged()).stream()
                .map(invoice -> {
                    FeeInvoiceResponse response = modelMapper.map(invoice, FeeInvoiceResponse.class);
                    response.setStatus(FeeService.liveStatus(invoice));
                    return response;
                })
                .toList();
    }

    public List<PaymentResponse> paymentsForInvoice(Long studentId, Long invoiceId) {
        ownedStudentOrThrow(studentId);
        FeeInvoice invoice = feeInvoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));
        if (!invoice.getStudent().getId().equals(studentId)) {
            throw new AccessDeniedException("This invoice does not belong to this student");
        }
        return paymentRepo.findByFeeInvoice_Id(invoiceId).stream()
                .map(p -> modelMapper.map(p, PaymentResponse.class))
                .toList();
    }

    public List<StudentResultResponse> results(Long studentId) {
        ownedStudentOrThrow(studentId);
        return examResultRepo.findByStudent_Id(studentId).stream()
                .map(this::toStudentResultResponse)
                .toList();
    }

    public Student ownedStudentOrThrow(Long studentId) {
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        ParentProfile me = currentParent();
        if (!student.getParent().getId().equals(me.getId())) {
            throw new AccessDeniedException("This student is not linked to your account");
        }
        return student;
    }

    public Payment ownedPaymentOrThrow(Long paymentId) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
        ownedStudentOrThrow(payment.getFeeInvoice().getStudent().getId());
        return payment;
    }

    public ParentStatsResponse stats() {
        ParentProfile me = currentParent();
        List<Student> children = studentRepo.findByParent_Id(me.getId());

        BigDecimal totalOutstanding = BigDecimal.ZERO;
        long totalRecords = 0;
        long totalPresent = 0;

        for (Student child : children) {
            for (FeeInvoice invoice : feeInvoiceRepo.findByStudent_Id(child.getId(), Pageable.unpaged())) {
                BigDecimal remaining = invoice.getAmountDue().subtract(invoice.getAmountPaid());
                if (remaining.signum() > 0) {
                    totalOutstanding = totalOutstanding.add(remaining);
                }
            }

            List<Attendance> records = attendanceRepo.findByStudent_Id(child.getId());
            totalRecords += records.size();
            totalPresent += records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        }

        double overallAttendanceRate = totalRecords == 0 ? 0 : (double) totalPresent / totalRecords * 100;
        return new ParentStatsResponse(children.size(), totalOutstanding, overallAttendanceRate);
    }

    public List<AnnouncementResponse> relevantAnnouncements() {
        ParentProfile me = currentParent();
        List<Student> children = studentRepo.findByParent_Id(me.getId());

        Set<Long> classIds = new HashSet<>();
        for (Student child : children) {
            schoolClassRepo.findByStudents_Id(child.getId()).forEach(c -> classIds.add(c.getId()));
        }

        List<Announcement> announcements = classIds.isEmpty()
                ? announcementRepo.findByTargetClassIsNullOrderByPostedAtDesc()
                : announcementRepo.findRelevantAnnouncements(new java.util.ArrayList<>(classIds));

        return announcements.stream().map(announcementService::toResponse).toList();
    }

    private StudentResultResponse toStudentResultResponse(ExamResult result) {
        StudentResultResponse response = new StudentResultResponse();
        response.setExamId(result.getExam().getId());
        response.setExamName(result.getExam().getName());
        response.setSubject(result.getExam().getSchoolClass().getSubject());
        response.setExamDate(result.getExam().getExamDate());
        response.setMarksObtained(result.getMarksObtained());
        response.setMaxMarks(result.getExam().getMaxMarks());
        response.setGrade(GradeCalculator.compute(result.getMarksObtained(), result.getExam().getMaxMarks()));
        response.setRemarks(result.getRemarks());
        return response;
    }

    private ParentProfile currentParent() {
        String username = currentUserProvider.getUsername();
        return parentProfileRepo.findByAppUser_Username(username)
                .orElseThrow(() -> new IllegalStateException("Logged-in user has no parent profile"));
    }
}
