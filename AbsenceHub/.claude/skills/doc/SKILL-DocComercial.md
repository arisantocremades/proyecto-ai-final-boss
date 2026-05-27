# Skill: Documentación Comercial en Markdown

## Propósito
Generar un documento comercial persuasivo y accesible en formato Markdown
a partir de la síntesis extraída del proyecto.

---

## Fichero de salida

```
/docs/DOCUMENTACION-COMERCIAL.md
```

Si la carpeta `docs` no existe, créala antes de escribir.

---

## Principios de escritura comercial

Antes de escribir, interioriza estas reglas:

- **Habla de beneficios, no de implementación.** No "usamos JWT", sino "acceso seguro sin fricción".
- **El usuario es el protagonista.** "Tú puedes...", "Tu equipo puede...", no "el sistema permite...".
- **Sé concreto.** Evita frases vacías como "solución integral" o "plataforma robusta".
- **Vende solo lo que existe.** Si está incompleto o roto, no aparece en este documento.
- **Tono:** directo, seguro, orientado a resultados. Ni corporativo-vacío ni demasiado informal.

---

## Plantilla

````markdown
# {NOMBRE DEL PROYECTO}

> {Tagline de una línea: qué hace y para quién, en términos de beneficio}

---

## El problema que resolvemos

{1-2 párrafos describiendo el dolor o necesidad real que existe en el mercado
o en el día a día del usuario objetivo. Sin mencionar tecnología.
Ej: "Gestionar X manualmente es lento, propenso a errores y escala mal..."}

---

## La solución

{1-2 párrafos describiendo qué ofrece el producto y cómo cambia la situación
del usuario. Debe conectar directamente con el problema descrito arriba.
Sigue sin entrar en detalle técnico.}

---

## A quién va dirigido

{Describe el perfil del usuario o cliente ideal. Puede ser más de uno.}

- **{Perfil 1}:** {Por qué les aporta valor}
- **{Perfil 2}:** {Por qué les aporta valor}
- **{Perfil 3}:** {Por qué les aporta valor}

---

## Qué puedes hacer con {NOMBRE}

{Lista de funcionalidades clave explicadas como beneficios.
Cada punto empieza con un verbo en segunda persona o con el beneficio directo.}

### {Categoría o módulo 1}
- **{Funcionalidad}** — {Qué te permite hacer o qué problema te resuelve}
- **{Funcionalidad}** — {Qué te permite hacer o qué problema te resuelve}

### {Categoría o módulo 2}
- **{Funcionalidad}** — {Qué te permite hacer o qué problema te resuelve}
- **{Funcionalidad}** — {Qué te permite hacer o qué problema te resuelve}

{Añade tantas categorías como módulos principales tenga el producto.}

---

## Cómo funciona

{Flujo de uso principal narrado de forma sencilla, paso a paso.
Sin jerga técnica. El lector debe entender qué hace en cada momento.}

1. **{Paso 1}** — {Descripción accesible de lo que ocurre}
2. **{Paso 2}** — {Descripción accesible de lo que ocurre}
3. **{Paso 3}** — {Descripción accesible de lo que ocurre}
4. **{Resultado}** — {Qué obtiene el usuario al final}

---

## Se integra con lo que ya usas

{Lista de integraciones externas detectadas, explicadas en términos de valor,
no de implementación.}

{Si no hay integraciones relevantes, elimina esta sección.}

| Integración | Para qué sirve |
|---|---|
| {Servicio} | {Beneficio para el usuario} |

---

## Seguro y confiable

{Explica las garantías de seguridad y fiabilidad en lenguaje accesible.
Ej: autenticación, backups, control de acceso, etc.}

- {Garantía 1 en lenguaje no técnico}
- {Garantía 2 en lenguaje no técnico}
- {Garantía 3 en lenguaje no técnico}

{Si no hay información suficiente sobre seguridad, elimina o reduce esta sección.}

---

## Estado del producto

{Sé transparente sobre en qué punto está el producto.}

**Disponible ahora:**
- {Funcionalidad operativa 1}
- {Funcionalidad operativa 2}
- {Funcionalidad operativa 3}

**Próximamente:**
- {Funcionalidad en desarrollo o planificada si se detecta en el código}

---

## Por qué {NOMBRE}

{3-4 diferenciadores reales frente a alternativas genéricas.
Evita tópicos. Basa cada punto en algo que hayas visto en el proyecto.}

- **{Diferenciador 1}:** {Explicación concreta}
- **{Diferenciador 2}:** {Explicación concreta}
- **{Diferenciador 3}:** {Explicación concreta}

---

## Empieza hoy

{Cómo dar el primer paso. Adapta según lo que exista en el proyecto:
demo, instalación, contacto, documentación, etc.}

{Ejemplo:}
```
{comando de instalación si es open source / CLI}
```

{O enlace a demo, formulario de contacto, documentación, etc.}

---

*¿Preguntas? {canal de contacto si existe en el proyecto — email, GitHub issues, web}*
````

---

## Reglas de escritura

- **Nunca incluyas funcionalidades incompletas, rotas o sin implementar.**
- Si una sección no tiene contenido real del proyecto, elimínala del documento final.
- No uses términos como: "robusto", "escalable", "de última generación", "innovador", "disruptivo"
  a menos que puedas respaldarlos con algo concreto.
- Las listas de funcionalidades deben basarse en código real, no en suposiciones.
- El tono debe ser consistente de principio a fin: seguro, directo, orientado al usuario.
- Máximo 2 niveles de encabezado (`##` y `###`). Si necesitas más, reorganiza la sección.
