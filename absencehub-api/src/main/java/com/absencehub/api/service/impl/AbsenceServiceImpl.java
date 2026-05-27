package com.absencehub.api.service.impl;

import com.absencehub.api.dto.request.ApproveAbsenceRequest;
import com.absencehub.api.dto.request.CreateAbsenceRequest;
import com.absencehub.api.dto.request.RejectAbsenceRequest;
import com.absencehub.api.dto.request.UpdateAbsenceRequest;
import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.entity.AbsenceRequest;
import com.absencehub.api.entity.User;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;
import com.absencehub.api.exception.BusinessException;
import com.absencehub.api.exception.ResourceNotFoundException;
import com.absencehub.api.mapper.AbsenceMapper;
import com.absencehub.api.repository.AbsenceRequestRepository;
import com.absencehub.api.repository.UserRepository;
import com.absencehub.api.service.AbsenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AbsenceServiceImpl implements AbsenceService {

    private static final int TOTAL_VACATION_DAYS = 22;

    private final AbsenceRequestRepository absenceRepository;
    private final UserRepository userRepository;
    private final AbsenceMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<AbsenceResponse> findByUser(Long userId) {
        return mapper.toResponseList(absenceRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public AbsenceResponse findById(Long absenceId, Long requestingUserId) {
        AbsenceRequest absence = loadAbsence(absenceId);
        User requester = loadUser(requestingUserId);

        boolean isOwner = absence.getUser().getId().equals(requestingUserId);
        boolean isManagerOfTeam = isManagerOfSameTeam(requester, absence.getUser());
        boolean isAdmin = requester.getRole().name().equals("ADMIN");

        if (!isOwner && !isManagerOfTeam && !isAdmin) {
            throw new BusinessException("FORBIDDEN", "No tiene permisos para ver esta ausencia");
        }

        return mapper.toResponse(absence);
    }

    @Override
    public AbsenceResponse create(Long userId, CreateAbsenceRequest request) {
        User user = loadUser(userId);

        validateDateRange(request.startDate(), request.endDate());
        validateNoOverlap(userId, request.startDate(), request.endDate(), null);

        if (request.type() == AbsenceType.VACATION) {
            validateAvailableVacationDays(user, request.startDate(), request.endDate());
        }

        AbsenceRequest absence = mapper.toEntity(request);
        absence.setUser(user);
        absence.setStatus(AbsenceStatus.PENDING);
        absence.setTotalDays(calculateWorkingDays(request.startDate(), request.endDate()));
        absence.setCreatedAt(LocalDateTime.now());

        return mapper.toResponse(absenceRepository.save(absence));
    }

    @Override
    public AbsenceResponse update(Long absenceId, Long userId, UpdateAbsenceRequest request) {
        AbsenceRequest absence = loadAbsence(absenceId);

        if (!absence.getUser().getId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "Solo el propietario puede modificar la ausencia");
        }
        if (absence.getStatus() != AbsenceStatus.PENDING) {
            throw new BusinessException("INVALID_STATE", "Solo se pueden modificar ausencias pendientes");
        }

        validateDateRange(request.startDate(), request.endDate());
        validateNoOverlap(userId, request.startDate(), request.endDate(), absenceId);

        if (request.type() == AbsenceType.VACATION) {
            validateAvailableVacationDays(absence.getUser(), request.startDate(), request.endDate());
        }

        absence.setType(request.type());
        absence.setStartDate(request.startDate());
        absence.setEndDate(request.endDate());
        absence.setTotalDays(calculateWorkingDays(request.startDate(), request.endDate()));
        absence.setReason(request.reason());

        return mapper.toResponse(absenceRepository.save(absence));
    }

    @Override
    public void delete(Long absenceId, Long userId) {
        AbsenceRequest absence = loadAbsence(absenceId);

        if (!absence.getUser().getId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "Solo el propietario puede eliminar la ausencia");
        }
        if (absence.getStatus() != AbsenceStatus.PENDING) {
            throw new BusinessException("INVALID_STATE", "Solo se pueden eliminar ausencias pendientes");
        }

        absenceRepository.delete(absence);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AbsenceResponse> findByTeam(Long managerId) {
        User manager = loadUser(managerId);
        if (manager.getTeam() == null) {
            throw new BusinessException("NO_TEAM", "El manager no tiene equipo asignado");
        }
        return mapper.toResponseList(absenceRepository.findByTeamId(manager.getTeam().getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AbsenceResponse> findAll(AbsenceStatus status, AbsenceType type,
                                          LocalDate startDate, LocalDate endDate) {
        return mapper.toResponseList(absenceRepository.findWithFilters(status, type, startDate, endDate));
    }

    @Override
    public AbsenceResponse approve(Long absenceId, Long managerId, ApproveAbsenceRequest request) {
        AbsenceRequest absence = loadAbsence(absenceId);
        User manager = loadUser(managerId);

        validateCanReview(manager, absence);

        if (absence.getStatus() != AbsenceStatus.PENDING) {
            throw new BusinessException("INVALID_STATE", "Solo se pueden aprobar ausencias pendientes");
        }

        absence.setStatus(AbsenceStatus.APPROVED);
        absence.setManagerComment(request.managerComment());
        absence.setReviewedBy(manager);
        absence.setReviewedAt(LocalDateTime.now());

        return mapper.toResponse(absenceRepository.save(absence));
    }

    @Override
    public AbsenceResponse reject(Long absenceId, Long managerId, RejectAbsenceRequest request) {
        AbsenceRequest absence = loadAbsence(absenceId);
        User manager = loadUser(managerId);

        validateCanReview(manager, absence);

        if (absence.getStatus() != AbsenceStatus.PENDING) {
            throw new BusinessException("INVALID_STATE", "Solo se pueden rechazar ausencias pendientes");
        }

        absence.setStatus(AbsenceStatus.REJECTED);
        absence.setManagerComment(request.managerComment());
        absence.setReviewedBy(manager);
        absence.setReviewedAt(LocalDateTime.now());

        return mapper.toResponse(absenceRepository.save(absence));
    }

    // --- Métodos privados de reglas de negocio ---

    private void validateDateRange(LocalDate start, LocalDate end) {
        if (start.isAfter(end)) {
            throw new BusinessException("INVALID_DATE_RANGE", "La fecha de inicio no puede ser posterior a la fecha de fin");
        }
    }

    private void validateNoOverlap(Long userId, LocalDate start, LocalDate end, Long excludeId) {
        List<AbsenceRequest> overlapping = absenceRepository.findOverlapping(userId, start, end);
        boolean hasConflict = overlapping.stream()
                .anyMatch(a -> !a.getId().equals(excludeId));
        if (hasConflict) {
            throw new BusinessException("ABSENCE_OVERLAP", "Ya existe una ausencia en ese rango de fechas");
        }
    }

    private void validateAvailableVacationDays(User user, LocalDate start, LocalDate end) {
        int requestedDays = calculateWorkingDays(start, end);
        int year = start.getYear();

        int usedDays = absenceRepository
                .findVacationsByUserAndYear(user.getId(), year)
                .stream()
                .mapToInt(AbsenceRequest::getTotalDays)
                .sum();

        int available = TOTAL_VACATION_DAYS - usedDays;
        if (requestedDays > available) {
            throw new BusinessException("INSUFFICIENT_DAYS",
                    "Días disponibles insuficientes. Disponibles: " + available + ", solicitados: " + requestedDays);
        }
    }

    private void validateCanReview(User manager, AbsenceRequest absence) {
        boolean isAdmin = manager.getRole().name().equals("ADMIN");
        if (isAdmin) return;

        // Manager solo puede revisar ausencias de su propio equipo
        if (!isManagerOfSameTeam(manager, absence.getUser())) {
            throw new BusinessException("FORBIDDEN", "Solo el manager del equipo puede aprobar/rechazar esta ausencia");
        }
    }

    private boolean isManagerOfSameTeam(User manager, User employee) {
        if (manager.getTeam() == null || employee.getTeam() == null) return false;
        return manager.getTeam().getId().equals(employee.getTeam().getId());
    }

    // Días laborables (lunes-viernes), excluye fines de semana
    int calculateWorkingDays(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek day = current.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                count++;
            }
            current = current.plusDays(1);
        }
        return count;
    }

    private AbsenceRequest loadAbsence(Long id) {
        return absenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AbsenceRequest", id));
    }

    private User loadUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
