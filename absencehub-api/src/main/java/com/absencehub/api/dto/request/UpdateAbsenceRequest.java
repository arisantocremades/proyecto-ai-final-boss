package com.absencehub.api.dto.request;

import com.absencehub.api.enums.AbsenceType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateAbsenceRequest(
        @NotNull(message = "El tipo de ausencia es obligatorio")
        AbsenceType type,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate startDate,

        @NotNull(message = "La fecha de fin es obligatoria")
        LocalDate endDate,

        @Size(max = 500)
        String reason
) {}
