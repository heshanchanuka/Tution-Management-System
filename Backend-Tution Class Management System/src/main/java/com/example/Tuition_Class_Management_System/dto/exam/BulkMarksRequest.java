package com.example.Tuition_Class_Management_System.dto.exam;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkMarksRequest {

    @NotEmpty(message = "At least one mark entry is required")
    @Valid
    private List<MarkEntryRequest> entries;
}
