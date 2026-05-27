package com.absencehub.api.service.impl;

import com.absencehub.api.dto.request.CreateAbsenceRequest;
import com.absencehub.api.dto.request.RejectAbsenceRequest;
import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.entity.AbsenceRequest;
import com.absencehub.api.entity.Team;
import com.absencehub.api.entity.User;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;
import com.absencehub.api.enums.Role;
import com.absencehub.api.exception.BusinessException;
import com.absencehub.api.mapper.AbsenceMapper;
import com.absencehub.api.repository.AbsenceRequestRepository;
import com.absencehub.api.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AbsenceServiceImplTest {

    @Mock AbsenceRequestRepository absenceRepository;
    @Mock UserRepository userRepository;
    @Mock AbsenceMapper mapper;

    @InjectMocks AbsenceServiceImpl service;

    @Test
    void create_shouldReturnPendingResponse_whenRequestIsValid() {
        var user = buildEmployee();
        var request = new CreateAbsenceRequest(
                AbsenceType.VACATION,
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 5),
                "Vacaciones de verano"
        );
        var entity = buildAbsenceEntity(user);
        var response = buildResponse();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(absenceRepository.findOverlapping(any(), any(), any())).thenReturn(List.of());
        when(absenceRepository.findVacationsByUserAndYear(any(), anyInt())).thenReturn(List.of());
        when(mapper.toEntity(request)).thenReturn(entity);
        when(absenceRepository.save(any())).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        var result = service.create(1L, request);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(AbsenceStatus.PENDING);
        verify(absenceRepository).save(any());
    }

    @Test
    void create_shouldThrowBusinessException_whenExceedsVacationDaysLimit() {
        var user = buildEmployee();
        var request = new CreateAbsenceRequest(
                AbsenceType.VACATION,
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 30),   // ~20 días laborables
                null
        );

        // Simular que el usuario ya usó 15 días
        var existingAbsence = buildAbsenceEntity(user);
        existingAbsence.setTotalDays(15);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(absenceRepository.findOverlapping(any(), any(), any())).thenReturn(List.of());
        when(absenceRepository.findVacationsByUserAndYear(any(), anyInt()))
                .thenReturn(List.of(existingAbsence));

        assertThatThrownBy(() -> service.create(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("días disponibles");
    }

    @Test
    void create_shouldThrowBusinessException_whenDatesOverlap() {
        var user = buildEmployee();
        var request = new CreateAbsenceRequest(
                AbsenceType.SICK,
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 5),
                "Gripe"
        );
        var existing = buildAbsenceEntity(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(absenceRepository.findOverlapping(any(), any(), any())).thenReturn(List.of(existing));

        assertThatThrownBy(() -> service.create(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("solapamiento").satisfies(ex -> {
                    // código correcto
                    assertThat(((BusinessException) ex).getCode()).isEqualTo("ABSENCE_OVERLAP");
                });
    }

    @Test
    void create_shouldThrowBusinessException_whenStartDateAfterEndDate() {
        var user = buildEmployee();
        var request = new CreateAbsenceRequest(
                AbsenceType.PERSONAL,
                LocalDate.of(2026, 6, 10),
                LocalDate.of(2026, 6, 5),   // fecha fin anterior a inicio
                null
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.create(1L, request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("INVALID_DATE_RANGE"));
    }

    @Test
    void reject_shouldThrowBusinessException_whenManagerIsNotFromSameTeam() {
        var team1 = buildTeam(10L);
        var team2 = buildTeam(20L);
        var employee = buildEmployeeInTeam(team1);
        var otherManager = buildManagerInTeam(team2);
        var absence = buildAbsenceEntity(employee);

        when(absenceRepository.findById(1L)).thenReturn(Optional.of(absence));
        when(userRepository.findById(99L)).thenReturn(Optional.of(otherManager));

        assertThatThrownBy(() -> service.reject(1L, 99L, new RejectAbsenceRequest("Motivo")))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("FORBIDDEN"));
    }

    @Test
    void calculateWorkingDays_shouldExcludeWeekends() {
        // lunes 2 junio → viernes 6 junio = 5 días laborables
        int days = service.calculateWorkingDays(
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 5)
        );
        assertThat(days).isEqualTo(5);
    }

    @Test
    void calculateWorkingDays_shouldExcludeSaturdayAndSunday() {
        // viernes 5 → lunes 8 = 2 días laborables (viernes + lunes)
        int days = service.calculateWorkingDays(
                LocalDate.of(2026, 6, 5),
                LocalDate.of(2026, 6, 8)
        );
        assertThat(days).isEqualTo(2);
    }

    // --- Helpers ---

    private User buildEmployee() {
        return User.builder()
                .id(1L).email("empleado@absencehub.com")
                .name("Carlos Martínez").role(Role.EMPLOYEE)
                .availableDays(22).active(true).build();
    }

    private User buildEmployeeInTeam(Team team) {
        var u = buildEmployee();
        u.setTeam(team);
        return u;
    }

    private User buildManagerInTeam(Team team) {
        return User.builder()
                .id(99L).email("manager2@absencehub.com")
                .name("Manager 2").role(Role.MANAGER)
                .team(team).availableDays(22).active(true).build();
    }

    private Team buildTeam(Long id) {
        return Team.builder().id(id).name("Equipo " + id).build();
    }

    private AbsenceRequest buildAbsenceEntity(User user) {
        return AbsenceRequest.builder()
                .id(1L).user(user)
                .type(AbsenceType.VACATION)
                .startDate(LocalDate.of(2026, 6, 1))
                .endDate(LocalDate.of(2026, 6, 5))
                .totalDays(5)
                .status(AbsenceStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private AbsenceResponse buildResponse() {
        return new AbsenceResponse(
                1L, null, AbsenceType.VACATION,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 5),
                5, AbsenceStatus.PENDING, "Vacaciones", null, null, null,
                LocalDateTime.now()
        );
    }
}
