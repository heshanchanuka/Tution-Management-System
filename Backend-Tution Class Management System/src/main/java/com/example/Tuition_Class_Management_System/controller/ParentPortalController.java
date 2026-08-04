package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.announcement.AnnouncementResponse;
import com.example.Tuition_Class_Management_System.dto.attendance.AttendanceResponse;
import com.example.Tuition_Class_Management_System.dto.dashboard.ParentStatsResponse;
import com.example.Tuition_Class_Management_System.dto.exam.StudentResultResponse;
import com.example.Tuition_Class_Management_System.dto.fee.FeeInvoiceResponse;
import com.example.Tuition_Class_Management_System.dto.fee.PaymentResponse;
import com.example.Tuition_Class_Management_System.dto.student.StudentResponse;
import com.example.Tuition_Class_Management_System.entity.Payment;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.example.Tuition_Class_Management_System.service.ParentPortalService;
import com.example.Tuition_Class_Management_System.service.ReceiptPdfService;
import com.example.Tuition_Class_Management_System.service.ReportCardPdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/parent")
@PreAuthorize("hasRole('PARENT')")
public class ParentPortalController {

    @Autowired
    private ParentPortalService parentPortalService;

    @Autowired
    private ReceiptPdfService receiptPdfService;

    @Autowired
    private ReportCardPdfService reportCardPdfService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ParentStatsResponse> stats() {
        return ResponseEntity.ok(parentPortalService.stats());
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<AnnouncementResponse>> announcements() {
        return ResponseEntity.ok(parentPortalService.relevantAnnouncements());
    }

    @GetMapping("/children")
    public ResponseEntity<List<StudentResponse>> myChildren() {
        return ResponseEntity.ok(parentPortalService.myChildren());
    }

    @GetMapping("/children/{studentId}")
    public ResponseEntity<StudentResponse> getChild(@PathVariable Long studentId) {
        return ResponseEntity.ok(parentPortalService.getChild(studentId));
    }

    @GetMapping("/children/{studentId}/attendance")
    public ResponseEntity<List<AttendanceResponse>> attendance(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(parentPortalService.attendanceHistory(studentId, from, to));
    }

    @GetMapping("/children/{studentId}/fees")
    public ResponseEntity<List<FeeInvoiceResponse>> fees(@PathVariable Long studentId) {
        return ResponseEntity.ok(parentPortalService.fees(studentId));
    }

    @GetMapping("/children/{studentId}/fees/{invoiceId}/payments")
    public ResponseEntity<List<PaymentResponse>> payments(@PathVariable Long studentId, @PathVariable Long invoiceId) {
        return ResponseEntity.ok(parentPortalService.paymentsForInvoice(studentId, invoiceId));
    }

    @GetMapping("/children/{studentId}/results")
    public ResponseEntity<List<StudentResultResponse>> results(@PathVariable Long studentId) {
        return ResponseEntity.ok(parentPortalService.results(studentId));
    }

    @GetMapping("/children/{studentId}/report-card")
    public ResponseEntity<byte[]> reportCard(@PathVariable Long studentId) {
        Student student = parentPortalService.ownedStudentOrThrow(studentId);
        List<StudentResultResponse> results = parentPortalService.results(studentId);
        byte[] pdf = reportCardPdfService.generate(student, results);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename("report-card-" + student.getFullName().replace(" ", "-") + ".pdf")
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(pdf);
    }

    @GetMapping("/receipts/{paymentId}")
    public ResponseEntity<byte[]> receipt(@PathVariable Long paymentId) {
        Payment payment = parentPortalService.ownedPaymentOrThrow(paymentId);
        byte[] pdf = receiptPdfService.generateReceipt(payment);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(payment.getReceiptNumber() + ".pdf")
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(pdf);
    }
}
