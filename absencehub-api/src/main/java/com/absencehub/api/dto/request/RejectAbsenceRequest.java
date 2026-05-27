package com.absencehub.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// NOTA DE INTEGRACIÓN: el frontend manager.ts llama reject(id) sin comentario.
// Añadir campo de comentario al componente manager cuando se conecte al backend real.
public record RejectAbsenceRequest(
        @NotBlank(message = "El comentario del manager es obligatorio al rechazar")
        @Size(max = 500)
        String managerComment
) {}
