package com.absencehub.api.dto.response;

import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;

import java.time.LocalDate;
import java.time.LocalDateTime;

// NOTA DE INTEGRACIÓN: el frontend usa campos planos (userId, userName, days).
// Al conectar Angular al backend, actualizar AbsenceRequest interface para usar esta shape.
public record AbsenceResponse(
        Long id,
        UserSummaryResponse user,
        AbsenceType type,
        LocalDate startDate,
        LocalDate endDate,
        Integer totalDays,
        AbsenceStatus status,
        String reason,
        String managerComment,         // null hasta que sea revisada
        UserSummaryResponse reviewedBy, // null hasta que sea revisada
        LocalDateTime reviewedAt,       // null hasta que sea revisada
        LocalDateTime createdAt
) {}
