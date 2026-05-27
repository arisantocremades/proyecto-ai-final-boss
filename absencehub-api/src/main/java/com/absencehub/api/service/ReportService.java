package com.absencehub.api.service;

import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.dto.response.ReportSummaryResponse;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    List<AbsenceResponse> getAbsences(AbsenceStatus status, AbsenceType type,
                                       LocalDate startDate, LocalDate endDate);

    ReportSummaryResponse getSummary();
}
