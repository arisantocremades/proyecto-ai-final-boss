package com.absencehub.api.controller;

import com.absencehub.api.dto.request.ApproveAbsenceRequest;
import com.absencehub.api.dto.request.CreateAbsenceRequest;
import com.absencehub.api.dto.request.RejectAbsenceRequest;
import com.absencehub.api.dto.request.UpdateAbsenceRequest;
import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;
import com.absencehub.api.security.UserDetailsImpl;
import com.absencehub.api.service.AbsenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/absences")
@RequiredArgsConstructor
@Tag(name = "Absences", description = "Gestión de solicitudes de ausencia")
public class AbsenceController {

    private final AbsenceService absenceService;

    @GetMapping
    @Operation(summary = "Listar ausencias del usuario autenticado")
    public ResponseEntity<List<AbsenceResponse>> getMyAbsences(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(absenceService.findByUser(userDetails.getId()));
    }

    @GetMapping("/all")
    @Operation(summary = "Todas las ausencias — solo Admin")
    public ResponseEntity<List<AbsenceResponse>> getAll(
            @RequestParam(required = false) AbsenceStatus status,
            @RequestParam(required = false) AbsenceType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(absenceService.findAll(status, type, startDate, endDate));
    }

    @GetMapping("/team")
    @Operation(summary = "Ausencias del equipo — Manager/Admin")
    public ResponseEntity<List<AbsenceResponse>> getTeamAbsences(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(absenceService.findByTeam(userDetails.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una ausencia")
    public ResponseEntity<AbsenceResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(absenceService.findById(id, userDetails.getId()));
    }

    @PostMapping
    @Operation(summary = "Crear solicitud de ausencia")
    public ResponseEntity<AbsenceResponse> create(
            @Valid @RequestBody CreateAbsenceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(absenceService.create(userDetails.getId(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar ausencia pendiente")
    public ResponseEntity<AbsenceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAbsenceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(absenceService.update(id, userDetails.getId(), request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar ausencia pendiente")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        absenceService.delete(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Aprobar ausencia — Manager/Admin")
    public ResponseEntity<AbsenceResponse> approve(
            @PathVariable Long id,
            @Valid @RequestBody ApproveAbsenceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(absenceService.approve(id, userDetails.getId(), request));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Rechazar ausencia — Manager/Admin (requiere comentario)")
    public ResponseEntity<AbsenceResponse> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectAbsenceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(absenceService.reject(id, userDetails.getId(), request));
    }
}
