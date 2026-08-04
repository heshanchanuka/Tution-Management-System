package com.example.Tuition_Class_Management_System.util;

import java.math.BigDecimal;

public final class GradeCalculator {

    private GradeCalculator() {
    }

    public static String compute(BigDecimal marksObtained, BigDecimal maxMarks) {
        if (maxMarks == null || maxMarks.signum() == 0) {
            return "-";
        }
        double percentage = marksObtained.doubleValue() / maxMarks.doubleValue() * 100;
        if (percentage >= 75) return "A";
        if (percentage >= 65) return "B";
        if (percentage >= 50) return "C";
        if (percentage >= 35) return "S";
        return "F";
    }
}
