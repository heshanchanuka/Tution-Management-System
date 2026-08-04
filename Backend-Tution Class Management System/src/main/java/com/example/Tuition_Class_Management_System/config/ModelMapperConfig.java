package com.example.Tuition_Class_Management_System.config;

import com.example.Tuition_Class_Management_System.dto.attendance.AttendanceResponse;
import com.example.Tuition_Class_Management_System.dto.exam.ExamResponse;
import com.example.Tuition_Class_Management_System.dto.exam.ExamResultResponse;
import com.example.Tuition_Class_Management_System.dto.fee.FeeInvoiceResponse;
import com.example.Tuition_Class_Management_System.dto.fee.PaymentResponse;
import com.example.Tuition_Class_Management_System.dto.parent.ParentResponse;
import com.example.Tuition_Class_Management_System.dto.schoolclass.ClassResponse;
import com.example.Tuition_Class_Management_System.dto.student.StudentResponse;
import com.example.Tuition_Class_Management_System.dto.teacher.TeacherResponse;
import com.example.Tuition_Class_Management_System.entity.Attendance;
import com.example.Tuition_Class_Management_System.entity.Exam;
import com.example.Tuition_Class_Management_System.entity.ExamResult;
import com.example.Tuition_Class_Management_System.entity.FeeInvoice;
import com.example.Tuition_Class_Management_System.entity.ParentProfile;
import com.example.Tuition_Class_Management_System.entity.Payment;
import com.example.Tuition_Class_Management_System.entity.SchoolClass;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.example.Tuition_Class_Management_System.entity.TeacherProfile;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * One place for every entity -> DTO mapping. Field names that line up
 * (id, subject, capacity, ...) are copied automatically; anything flattened
 * from a nested entity (a teacher's username, a class's enrolled count) is
 * spelled out explicitly here instead of relying on ModelMapper to guess it,
 * so a null-out-of-nowhere bug shows up here first, not at the controller.
 */
@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        modelMapper.createTypeMap(TeacherProfile.class, TeacherResponse.class).addMappings(m -> {
            m.map(src -> src.getAppUser().getUsername(), TeacherResponse::setUsername);
            m.map(src -> src.getAppUser().getFullName(), TeacherResponse::setFullName);
            m.map(src -> src.getAppUser().getPhone(), TeacherResponse::setPhone);
        });

        modelMapper.createTypeMap(ParentProfile.class, ParentResponse.class).addMappings(m -> {
            m.map(src -> src.getAppUser().getUsername(), ParentResponse::setUsername);
            m.map(src -> src.getAppUser().getFullName(), ParentResponse::setFullName);
            m.map(src -> src.getAppUser().getPhone(), ParentResponse::setPhone);
        });

        modelMapper.createTypeMap(Student.class, StudentResponse.class).addMappings(m -> {
            m.map(src -> src.getParent().getId(), StudentResponse::setParentId);
            m.map(src -> src.getParent().getAppUser().getFullName(), StudentResponse::setParentName);
        });

        modelMapper.createTypeMap(SchoolClass.class, ClassResponse.class).addMappings(m -> {
            m.map(src -> src.getTeacher().getId(), ClassResponse::setTeacherId);
            m.map(src -> src.getTeacher().getAppUser().getFullName(), ClassResponse::setTeacherName);
            // .size() isn't a getter ModelMapper's tracing proxy can follow - set separately in the service.
            m.skip(ClassResponse::setEnrolledCount);
        });

        modelMapper.createTypeMap(Attendance.class, AttendanceResponse.class).addMappings(m -> {
            m.map(src -> src.getStudent().getId(), AttendanceResponse::setStudentId);
            m.map(src -> src.getStudent().getFullName(), AttendanceResponse::setStudentName);
            m.map(src -> src.getSchoolClass().getId(), AttendanceResponse::setClassId);
            m.map(src -> src.getSchoolClass().getSubject(), AttendanceResponse::setSubject);
        });

        modelMapper.createTypeMap(Exam.class, ExamResponse.class).addMappings(m -> {
            m.map(src -> src.getSchoolClass().getId(), ExamResponse::setClassId);
            m.map(src -> src.getSchoolClass().getSubject(), ExamResponse::setSubject);
        });

        modelMapper.createTypeMap(ExamResult.class, ExamResultResponse.class).addMappings(m -> {
            m.map(src -> src.getExam().getId(), ExamResultResponse::setExamId);
            m.map(src -> src.getStudent().getId(), ExamResultResponse::setStudentId);
            m.map(src -> src.getStudent().getFullName(), ExamResultResponse::setStudentName);
            m.map(src -> src.getExam().getMaxMarks(), ExamResultResponse::setMaxMarks);
            m.skip(ExamResultResponse::setGrade);
        });

        modelMapper.createTypeMap(FeeInvoice.class, FeeInvoiceResponse.class).addMappings(m -> {
            m.map(src -> src.getStudent().getId(), FeeInvoiceResponse::setStudentId);
            m.map(src -> src.getStudent().getFullName(), FeeInvoiceResponse::setStudentName);
            m.map(src -> src.getSchoolClass().getId(), FeeInvoiceResponse::setClassId);
            m.map(src -> src.getSchoolClass().getSubject(), FeeInvoiceResponse::setSubject);
        });

        modelMapper.createTypeMap(Payment.class, PaymentResponse.class).addMappings(m -> {
            m.map(src -> src.getFeeInvoice().getId(), PaymentResponse::setInvoiceId);
            m.map(src -> src.getReceivedBy().getUsername(), PaymentResponse::setReceivedByUsername);
        });

        return modelMapper;
    }
}
