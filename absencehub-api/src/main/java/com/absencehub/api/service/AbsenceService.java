package com.absencehub.api.service;

import com.absencehub.api.dto.request.ApproveAbsenceRequest;
import com.absencehub.api.dto.request.CreateAbsenceRequest;
import com.absencehub.api.dto.request.RejectAbsenceRequest;
import com.absencehub.api.dto.request.UpdateAbsenceRequest;
import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;

import java.time.LocalDate;
import java.util.List;

public interface AbsenceService {

    List<AbsenceResponse> findByUser(Long userId);

    AbsenceResponse findById(Long absenceId, Long requestingUserId);

    AbsenceResponse create(Long userId, CreateAbsenceRequest request);

    AbsenceResponse update(Long absenceId, Long userId, UpdateAbsenceRequest request);

    void delete(Long absenceId, Long userId);

    List<AbsenceResponse> findByTeam(Long managerId);

    List<AbsenceResponse> findAll(AbsenceStatus status, AbsenceType type,
                                  LocalDate startDate, LocalDate endDate);

    AbsenceResponse approve(Long absenceId, Long managerId, ApproveAbsenceRequest request);

    AbsenceResponse reject(Long absenceId, Long managerId, RejectAbsenceRequest request);
}
