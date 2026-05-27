package com.absencehub.api.controller;

import com.absencehub.api.dto.request.CreateUserRequest;
import com.absencehub.api.dto.request.RoleUpdateRequest;
import com.absencehub.api.dto.request.UpdateUserRequest;
import com.absencehub.api.dto.response.UserResponse;
import com.absencehub.api.dto.response.UserSummaryResponse;
import com.absencehub.api.security.UserDetailsImpl;
import com.absencehub.api.service.UserService;
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
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestión de usuarios")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Perfil del usuario autenticado")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.findMe(userDetails.getId()));
    }

    @PutMapping("/me")
    @Operation(summary = "Actualizar perfil propio")
    public ResponseEntity<UserResponse> updateMe(
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.updateMe(userDetails.getId(), request));
    }

    @GetMapping("/search")
    @Operation(summary = "Búsqueda de usuarios por email o nombre — TeamService.searchMembers")
    public ResponseEntity<List<UserSummaryResponse>> search(@RequestParam String email) {
        return ResponseEntity.ok(userService.search(email));
    }

    @GetMapping
    @Operation(summary = "Listar todos los usuarios — solo Admin")
    public ResponseEntity<List<UserResponse>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping
    @Operation(summary = "Crear usuario — solo Admin")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario — solo Admin")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Cambiar rol de usuario — solo Admin")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(userService.updateRole(id, request));
    }
}
