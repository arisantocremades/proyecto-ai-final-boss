package com.absencehub.api.controller;

import com.absencehub.api.dto.request.CreateAbsenceRequest;
import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;
import com.absencehub.api.service.AbsenceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AbsenceControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AbsenceService absenceService;

    @Test
    @WithMockUser(username = "empleado@absencehub.com", roles = "EMPLOYEE")
    void createAbsence_shouldReturn201_whenRequestIsValid() throws Exception {
        var request = new CreateAbsenceRequest(
                AbsenceType.VACATION,
                LocalDate.of(2026, 6, 2),
                LocalDate.of(2026, 6, 6),
                "Vacaciones de verano"
        );

        var response = new AbsenceResponse(
                1L, null, AbsenceType.VACATION,
                LocalDate.of(2026, 6, 2), LocalDate.of(2026, 6, 6),
                5, AbsenceStatus.PENDING, "Vacaciones de verano",
                null, null, null, LocalDateTime.now()
        );

        when(absenceService.create(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/absences")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("pending"))
                .andExpect(jsonPath("$.type").value("vacation"))
                .andExpect(jsonPath("$.totalDays").value(5));
    }

    @Test
    @WithMockUser(username = "empleado@absencehub.com", roles = "EMPLOYEE")
    void createAbsence_shouldReturn400_whenTypeIsNull() throws Exception {
        var request = new CreateAbsenceRequest(null, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 5), null);

        mockMvc.perform(post("/api/v1/absences")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @WithMockUser(username = "empleado@absencehub.com", roles = "EMPLOYEE")
    void createAbsence_shouldReturn400_whenStartDateIsNull() throws Exception {
        var request = new CreateAbsenceRequest(AbsenceType.VACATION, null, LocalDate.of(2026, 6, 5), null);

        mockMvc.perform(post("/api/v1/absences")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void createAbsence_shouldReturn401_whenNotAuthenticated() throws Exception {
        var request = new CreateAbsenceRequest(
                AbsenceType.VACATION,
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 5),
                null
        );

        mockMvc.perform(post("/api/v1/absences")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "empleado@absencehub.com", roles = "EMPLOYEE")
    void getTeamAbsences_shouldReturn403_whenCalledByEmployee() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/v1/absences/team"))
                .andExpect(status().isForbidden());
    }
}
