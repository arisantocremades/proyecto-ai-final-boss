package com.absencehub.api.controller;

import com.absencehub.api.dto.request.AddMemberRequest;
import com.absencehub.api.dto.request.CreateTeamRequest;
import com.absencehub.api.dto.request.UpdateTeamRequest;
import com.absencehub.api.dto.response.TeamResponse;
import com.absencehub.api.security.UserDetailsImpl;
import com.absencehub.api.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
@Tag(name = "Teams", description = "Gestión de equipos")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @Operation(summary = "Listar equipos — Admin: todos; Manager: el suyo")
    public ResponseEntity<List<TeamResponse>> findAll(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(teamService.findAll(userDetails.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de equipo")
    public ResponseEntity<TeamResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Crear equipo — solo Admin")
    public ResponseEntity<TeamResponse> create(@Valid @RequestBody CreateTeamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar equipo — solo Admin")
    public ResponseEntity<TeamResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTeamRequest request) {
        return ResponseEntity.ok(teamService.update(id, request));
    }

    @PostMapping("/{id}/members")
    @Operation(summary = "Añadir miembro al equipo — solo Admin")
    public ResponseEntity<TeamResponse> addMember(
            @PathVariable Long id,
            @Valid @RequestBody AddMemberRequest request) {
        return ResponseEntity.ok(teamService.addMember(id, request));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar miembro del equipo — solo Admin")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId) {
        teamService.removeMember(id, userId);
        return ResponseEntity.noContent().build();
    }
}
