package com.absencehub.api.controller;

import com.absencehub.api.dto.request.LoginRequest;
import com.absencehub.api.dto.response.AuthResponse;
import com.absencehub.api.dto.response.UserResponse;
import com.absencehub.api.security.UserDetailsImpl;
import com.absencehub.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Autenticación y sesión")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión — el cliente elimina el token")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener usuario autenticado actual")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(authService.me(userDetails.getId()));
    }
}
