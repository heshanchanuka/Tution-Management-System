package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.exam.StudentResultResponse;
import com.example.Tuition_Class_Management_System.entity.Student;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ReportCardPdfService {

    public byte[] generate(Student student, List<StudentResultResponse> results) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
            Font valueFont = new Font(Font.HELVETICA, 11, Font.NORMAL);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Font cellFont = new Font(Font.HELVETICA, 10, Font.NORMAL);

            Paragraph title = new Paragraph("Student Report Card", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            addRow(document, "Student:", student.getFullName(), labelFont, valueFont);
            addRow(document, "Grade Level:", student.getGradeLevel(), labelFont, valueFont);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{20, 22, 14, 12, 12, 12});

            for (String header : new String[]{"Subject", "Exam", "Date", "Marks", "Max", "Grade"}) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(new Color(52, 73, 94));
                cell.setPadding(6);
                table.addCell(cell);
            }

            if (results.isEmpty()) {
                PdfPCell empty = new PdfPCell(new Phrase("No exam results recorded yet.", cellFont));
                empty.setColspan(6);
                empty.setPadding(8);
                table.addCell(empty);
            } else {
                for (StudentResultResponse r : results) {
                    table.addCell(new Phrase(r.getSubject(), cellFont));
                    table.addCell(new Phrase(r.getExamName(), cellFont));
                    table.addCell(new Phrase(r.getExamDate().toString(), cellFont));
                    table.addCell(new Phrase(r.getMarksObtained().toString(), cellFont));
                    table.addCell(new Phrase(r.getMaxMarks().toString(), cellFont));
                    table.addCell(new Phrase(r.getGrade(), cellFont));
                }
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new IllegalStateException("Failed to generate report card PDF", e);
        }

        return out.toByteArray();
    }

    private void addRow(Document document, String label, String value, Font labelFont, Font valueFont) throws DocumentException {
        Paragraph paragraph = new Paragraph();
        paragraph.add(new Chunk(label + " ", labelFont));
        paragraph.add(new Chunk(value, valueFont));
        document.add(paragraph);
    }
}
