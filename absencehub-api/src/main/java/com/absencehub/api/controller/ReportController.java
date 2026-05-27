package com.absencehub.api.controller;

import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.dto.response.ReportSummaryResponse;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;
import com.absencehub.api.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Informes y estadísticas — Manager/Admin")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/absences")
    @Operation(summary = "Informe de ausencias con filtros")
    public ResponseEntity<List<AbsenceResponse>> getAbsences(
            @RequestParam(required = false) AbsenceStatus status,
            @RequestParam(required = false) AbsenceType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getAbsences(status, type, startDate, endDate));
    }

    @GetMapping("/summary")
    @Operation(summary = "Estadísticas generales")
    public ResponseEntity<ReportSummaryResponse> getSummary() {
        return ResponseEntity.ok(reportService.getSummary());
    }
}
