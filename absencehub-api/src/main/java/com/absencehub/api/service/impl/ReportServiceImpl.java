package com.absencehub.api.service.impl;

import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.dto.response.ReportSummaryResponse;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;
import com.absencehub.api.mapper.AbsenceMapper;
import com.absencehub.api.repository.AbsenceRequestRepository;
import com.absencehub.api.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final AbsenceRequestRepository absenceRepository;
    private final AbsenceMapper absenceMapper;

    @Override
    public List<AbsenceResponse> getAbsences(AbsenceStatus status, AbsenceType type,
                                               LocalDate startDate, LocalDate endDate) {
        return absenceMapper.toResponseList(
                absenceRepository.findWithFilters(status, type, startDate, endDate)
        );
    }

    @Override
    public ReportSummaryResponse getSummary() {
        var all = absenceRepository.findAll();
        long total    = all.size();
        long pending  = all.stream().filter(a -> a.getStatus() == AbsenceStatus.PENDING).count();
        long approved = all.stream().filter(a -> a.getStatus() == AbsenceStatus.APPROVED).count();
        long rejected = all.stream().filter(a -> a.getStatus() == AbsenceStatus.REJECTED).count();
        long days     = all.stream()
                .filter(a -> a.getStatus() == AbsenceStatus.APPROVED)
                .mapToLong(a -> a.getTotalDays() != null ? a.getTotalDays() : 0)
                .sum();

        return new ReportSummaryResponse(total, pending, approved, rejected, days);
    }
}
