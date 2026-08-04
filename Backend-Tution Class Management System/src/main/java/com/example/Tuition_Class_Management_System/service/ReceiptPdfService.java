package com.example.Tuition_Class_Management_System.service;

import com.lowagie.text.Document;
import com.lowagie.text.Chunk;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.example.Tuition_Class_Management_System.entity.FeeInvoice;
import com.example.Tuition_Class_Management_System.entity.Payment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
public class ReceiptPdfService {

    public byte[] generateReceipt(Payment payment) {
        FeeInvoice invoice = payment.getFeeInvoice();
        Document document = new Document(PageSize.A5);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
            Font valueFont = new Font(Font.HELVETICA, 11, Font.NORMAL);

            Paragraph title = new Paragraph("Payment Receipt", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            addRow(document, "Receipt No:", payment.getReceiptNumber(), labelFont, valueFont);
            addRow(document, "Date:", payment.getPaymentDate().toString(), labelFont, valueFont);
            document.add(Chunk.NEWLINE);

            addRow(document, "Student:", invoice.getStudent().getFullName(), labelFont, valueFont);
            addRow(document, "Class:", invoice.getSchoolClass().getSubject() + " (" + invoice.getSchoolClass().getGradeLevel() + ")", labelFont, valueFont);
            addRow(document, "Billing Period:", invoice.getPeriod(), labelFont, valueFont);
            document.add(Chunk.NEWLINE);

            addRow(document, "Amount Paid:", formatMoney(payment.getAmountPaid()), labelFont, valueFont);
            addRow(document, "Payment Method:", payment.getMethod().toString(), labelFont, valueFont);
            addRow(document, "Received By:", payment.getReceivedBy().getFullName(), labelFont, valueFont);
            document.add(Chunk.NEWLINE);

            BigDecimal remaining = invoice.getAmountDue().subtract(invoice.getAmountPaid());
            addRow(document, "Remaining Balance:", formatMoney(remaining), labelFont, valueFont);

            document.close();
        } catch (DocumentException e) {
            throw new IllegalStateException("Failed to generate receipt PDF", e);
        }

        return out.toByteArray();
    }

    private void addRow(Document document, String label, String value, Font labelFont, Font valueFont) throws DocumentException {
        Paragraph paragraph = new Paragraph();
        paragraph.add(new Chunk(label + " ", labelFont));
        paragraph.add(new Chunk(value, valueFont));
        document.add(paragraph);
    }

    private String formatMoney(BigDecimal amount) {
        return "Rs. " + amount.setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
