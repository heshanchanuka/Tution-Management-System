package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.fee.FeeInvoiceResponse;
import com.example.Tuition_Class_Management_System.dto.fee.GenerateInvoicesRequest;
import com.example.Tuition_Class_Management_System.entity.FeeInvoice;
import com.example.Tuition_Class_Management_System.entity.FeeInvoiceStatus;
import com.example.Tuition_Class_Management_System.entity.SchoolClass;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.example.Tuition_Class_Management_System.exception.ResourceNotFoundException;
import com.example.Tuition_Class_Management_System.repo.FeeInvoiceRepo;
import com.example.Tuition_Class_Management_System.repo.SchoolClassRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class FeeService {

    @Autowired
    private FeeInvoiceRepo feeInvoiceRepo;

    @Autowired
    private SchoolClassRepo schoolClassRepo;

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Idempotent: a student who already has an invoice for this class+period
     * is skipped rather than double-billed, so this is safe to re-run.
     */
    @Transactional
    public List<FeeInvoiceResponse> generateInvoices(GenerateInvoicesRequest request) {
        SchoolClass schoolClass = schoolClassRepo.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));

        List<FeeInvoice> created = new ArrayList<>();
        for (Student student : schoolClass.getStudents()) {
            boolean alreadyInvoiced = feeInvoiceRepo
                    .findByStudent_IdAndSchoolClass_IdAndPeriod(student.getId(), schoolClass.getId(), request.getPeriod())
                    .isPresent();
            if (alreadyInvoiced) {
                continue;
            }

            FeeInvoice invoice = new FeeInvoice();
            invoice.setStudent(student);
            invoice.setSchoolClass(schoolClass);
            invoice.setPeriod(request.getPeriod());
            invoice.setAmountDue(schoolClass.getFeeAmount());
            invoice.setDueDate(request.getDueDate());
            invoice.setStatus(FeeInvoiceStatus.DUE);
            created.add(feeInvoiceRepo.save(invoice));
        }

        return created.stream().map(this::toResponse).toList();
    }

    public PageResponse<FeeInvoiceResponse> invoicesForStudent(Long studentId, Pageable pageable) {
        return PageResponse.from(feeInvoiceRepo.findByStudent_Id(studentId, pageable), this::toResponse);
    }

    public PageResponse<FeeInvoiceResponse> overdueInvoices(Pageable pageable) {
        return PageResponse.from(feeInvoiceRepo.findOverdue(LocalDate.now(), pageable), this::toResponse);
    }

    public FeeInvoiceResponse getInvoice(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    FeeInvoice findByIdOrThrow(Long id) {
        return feeInvoiceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    private FeeInvoiceResponse toResponse(FeeInvoice invoice) {
        FeeInvoiceResponse response = modelMapper.map(invoice, FeeInvoiceResponse.class);
        response.setStatus(liveStatus(invoice));
        return response;
    }

    static FeeInvoiceStatus liveStatus(FeeInvoice invoice) {
        if (invoice.getAmountPaid().compareTo(invoice.getAmountDue()) >= 0) {
            return FeeInvoiceStatus.PAID;
        }
        if (invoice.getDueDate().isBefore(LocalDate.now())) {
            return FeeInvoiceStatus.OVERDUE;
        }
        if (invoice.getAmountPaid().signum() > 0) {
            return FeeInvoiceStatus.PARTIAL;
        }
        return FeeInvoiceStatus.DUE;
    }
}
