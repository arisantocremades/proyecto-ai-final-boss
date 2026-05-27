# AbsenceHub — CLAUDE-BACKEND.md

## Qué es este archivo

Contexto especializado del agente backend para AbsenceHub. Se carga junto a `CLAUDE-FRONTEND.md`
cuando la tarea involucra backend o integración. El frontend es la fuente de verdad: nunca proponer
estructuras que rompan contratos ya existentes en Angular.

---

## Stack backend

| Capa | Tecnología |
|------|-----------|
| Lenguaje | Java 21 (LTS) |
| Framework | Spring Boot 3.x |
| Build | Maven |
| Persistencia | Spring Data JPA + Hibernate |
| Base de datos | PostgreSQL (prod) / H2 (tests) |
| Seguridad | Spring Security + JWT (Bearer token) |
| Validación | Jakarta Bean Validation (`@Valid`) |
| Mapeo | MapStruct |
| Testing | JUnit 5 + Mockito + Spring Boot Test |
| Documentación | SpringDoc OpenAPI 3 (Swagger UI) |

---

## Estructura de paquetes

```
com.absencehub.api
├── config/               # SecurityConfig, JwtConfig, CorsConfig, OpenApiConfig
├── controller/           # REST controllers (@RestController)
├── dto/
│   ├── request/          # DTOs de entrada (CreateXxxRequest, UpdateXxxRequest)
│   └── response/         # DTOs de salida (XxxResponse, XxxSummaryResponse)
├── entity/               # Entidades JPA (@Entity)
├── enums/                # Enums del dominio (Role, AbsenceType, AbsenceStatus)
├── exception/            # Excepciones custom + GlobalExceptionHandler
├── mapper/               # Interfaces MapStruct (XxxMapper)
├── repository/           # Interfaces JPA (XxxRepository)
├── security/             # JwtUtil, JwtFilter, UserDetailsServiceImpl
└── service/
    ├── impl/             # Implementaciones (@Service)
    └── XxxService.java   # Interfaces de servicio
```

---

## Entidades derivadas del frontend

### User

Inferido de: `AuthService`, usuarios mock, roles del sistema.

```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;   // BCrypt

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;         // EMPLOYEE | MANAGER | ADMIN

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "available_days")
    private Integer availableDays = 22;   // 22 días/año (regla de negocio frontend)

    @Column(name = "is_active")
    private Boolean active = true;
}
```

### AbsenceRequest

Inferido de: `AbsenceService`, tipos y estados del frontend.

```java
@Entity
@Table(name = "absence_requests")
public class AbsenceRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AbsenceType type;       // VACATION | SICK | PERSONAL | OTHER

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AbsenceStatus status = AbsenceStatus.PENDING;

    @Column(length = 500)
    private String reason;

    @Column(name = "manager_comment", length = 500)
    private String managerComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

### Team

Inferido de: `TeamService`, flujo de creación de equipos.

```java
@Entity
@Table(name = "teams")
public class Team {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY)
    private List<User> members = new ArrayList<>();
}
```

---

## Enums — sincronizados con frontend

Todos los enums usan `@JsonValue` para serializar en **lowercase** y `@JsonCreator` con `equalsIgnoreCase` para deserializar. Esto garantiza compatibilidad con el frontend Angular que usa `'pending'`, `'vacation'`, `'employee'`, etc.

```java
// AbsenceStatus — serializa como 'pending' | 'approved' | 'rejected'
public enum AbsenceStatus {
    PENDING("pending"), APPROVED("approved"), REJECTED("rejected");
    private final String value;
    AbsenceStatus(String value) { this.value = value; }
    @JsonValue public String getValue() { return value; }
    @JsonCreator public static AbsenceStatus fromValue(String v) { ... }
}

// AbsenceType — serializa como 'vacation' | 'sick' | 'personal' | 'other'
// ⚠️ 'sick' NO 'sick_leave' — fuente de verdad: AbsenceType.Sick = 'sick' en Angular
public enum AbsenceType {
    VACATION("vacation"), SICK("sick"), PERSONAL("personal"), OTHER("other");
    @JsonValue public String getValue() { return value; }
    @JsonCreator public static AbsenceType fromValue(String v) { ... }
}

// Role — serializa como 'employee' | 'manager' | 'admin'
public enum Role {
    EMPLOYEE("employee"), MANAGER("manager"), ADMIN("admin");
    @JsonValue public String getValue() { return value; }
    @JsonCreator public static Role fromValue(String v) { ... }
}
```

✅ El frontend usa `RequestStatus.Pending = 'pending'`, `UserRole.Manager = 'manager'`, etc. — coincide exactamente.

---

## Contratos de API — endpoints

Base URL: `/api/v1`

### Auth

```
POST   /api/v1/auth/login        → LoginRequest      → AuthResponse (token + user)
POST   /api/v1/auth/logout       → (void)             → 200 OK
GET    /api/v1/auth/me           → (token header)     → UserResponse
```

### Absences

```
GET    /api/v1/absences                  → lista del usuario autenticado
GET    /api/v1/absences/{id}             → detalle
POST   /api/v1/absences                  → CreateAbsenceRequest → AbsenceResponse
PUT    /api/v1/absences/{id}             → UpdateAbsenceRequest → AbsenceResponse
DELETE /api/v1/absences/{id}             → 204 No Content

# Solo Manager/Admin
GET    /api/v1/absences/team             → ausencias del equipo del manager
PATCH  /api/v1/absences/{id}/approve     → ApproveAbsenceRequest → AbsenceResponse
PATCH  /api/v1/absences/{id}/reject      → RejectAbsenceRequest  → AbsenceResponse

# Solo Admin
GET    /api/v1/absences/all              → todas las ausencias (informes)
```

### Users

```
GET    /api/v1/users/me                  → UserResponse
PUT    /api/v1/users/me                  → UpdateProfileRequest → UserResponse
GET    /api/v1/users/search?email=       → UserSummaryResponse[] (TeamService.findByEmail)

# Solo Admin
GET    /api/v1/users                     → UserResponse[]
POST   /api/v1/users                     → CreateUserRequest → UserResponse
PUT    /api/v1/users/{id}               → UpdateUserRequest → UserResponse
PATCH  /api/v1/users/{id}/role          → RoleUpdateRequest → UserResponse
```

### Teams

```
GET    /api/v1/teams                     → TeamResponse[] (Admin: todos; Manager: el suyo)
GET    /api/v1/teams/{id}               → TeamResponse
POST   /api/v1/teams                     → CreateTeamRequest → TeamResponse  (Admin)
PUT    /api/v1/teams/{id}               → UpdateTeamRequest → TeamResponse   (Admin)
POST   /api/v1/teams/{id}/members       → AddMemberRequest  → TeamResponse   (Admin)
DELETE /api/v1/teams/{id}/members/{uid} → 204 No Content                     (Admin)
```

### Reports

```
GET    /api/v1/reports/absences          → filtros por fecha/tipo/status → ReportResponse
GET    /api/v1/reports/summary           → estadísticas generales
```

---

## DTOs — contratos con el frontend

### Request DTOs

```java
// POST /auth/login
public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}

// POST /absences
public record CreateAbsenceRequest(
    @NotNull AbsenceType type,
    @NotNull LocalDate startDate,
    @NotNull LocalDate endDate,
    @Size(max = 500) String reason
) {}

// PATCH /absences/{id}/approve
public record ApproveAbsenceRequest(
    @Size(max = 500) String managerComment
) {}

// PATCH /absences/{id}/reject
public record RejectAbsenceRequest(
    @NotBlank @Size(max = 500) String managerComment
) {}
```

### Response DTOs

```java
// Respuesta de login — el frontend guarda esto en localStorage bajo "absencehub_session"
public record AuthResponse(
    String token,
    String tokenType,   // "Bearer"
    UserResponse user
) {}

// UserResponse — shape que espera el frontend en AuthService.currentUser
public record UserResponse(
    Long id,
    String email,
    String name,
    Role role,
    Integer availableDays,
    TeamSummaryResponse team   // nullable
) {}

// AbsenceResponse — shape que espera AbsenceService
public record AbsenceResponse(
    Long id,
    UserSummaryResponse user,
    AbsenceType type,
    LocalDate startDate,
    LocalDate endDate,
    Integer totalDays,
    AbsenceStatus status,
    String reason,
    String managerComment,
    UserSummaryResponse reviewedBy,   // nullable
    LocalDateTime reviewedAt,         // nullable
    LocalDateTime createdAt
) {}

// TeamResponse
public record TeamResponse(
    Long id,
    String name,
    UserSummaryResponse manager,
    List<UserSummaryResponse> members
) {}
```

---

## Serialización JSON — reglas críticas

```yaml
# application.yml
spring:
  jackson:
    property-naming-strategy: LOWER_CAMEL_CASE   # compatibilidad con Angular (camelCase)
    serialization:
      write-dates-as-timestamps: false             # ISO-8601 strings
    deserialization:
      fail-on-unknown-properties: false            # tolerante a campos extra del frontend
    default-property-inclusion: non_null           # no enviar nulls innecesarios
```

**Fechas:** `LocalDate` → `"2025-03-15"` (ISO-8601). `LocalDateTime` → `"2025-03-15T10:30:00"`.
El frontend usa strings ISO. No usar timestamps Unix.

**Enums:** serializar como STRING (no ordinal). El frontend compara strings directamente.

**IDs:** Long serializado como número (no string). Angular lo recibe como `number`.

---

## Seguridad y JWT

### Flujo de autenticación

```
Angular login form
  → POST /api/v1/auth/login { email, password }
  → Backend valida credenciales
  → Genera JWT (payload: userId, email, role, iat, exp)
  → Responde AuthResponse { token, tokenType: "Bearer", user: UserResponse }
  → Angular guarda en localStorage["absencehub_session"]
  → Angular envía en cada request: Authorization: Bearer <token>
```

### JWT payload

```json
{
  "sub": "1",
  "email": "manager@absencehub.com",
  "role": "manager",
  "iat": 1700000000,
  "exp": 1700086400
}
```

`JwtUtil.generateToken()` usa `role.getValue()` → lowercase. No `role.name()` (que devolvería `"MANAGER"`).

### Permisos por rol

```java
// SecurityConfig — reglas que replican exactamente las guards de Angular
.requestMatchers(POST, "/api/v1/auth/**").permitAll()
.requestMatchers(GET,  "/api/v1/auth/me").authenticated()

// Absences
.requestMatchers(GET, "/api/v1/absences/all").hasRole("ADMIN")
.requestMatchers(GET, "/api/v1/absences/team").hasAnyRole("MANAGER", "ADMIN")
.requestMatchers("/api/v1/absences/**").authenticated()

// Users
.requestMatchers("/api/v1/users").hasRole("ADMIN")
.requestMatchers(GET, "/api/v1/users/me").authenticated()
.requestMatchers(GET, "/api/v1/users/search").authenticated()

// Teams
.requestMatchers(POST, "/api/v1/teams").hasRole("ADMIN")
.requestMatchers(DELETE, "/api/v1/teams/**").hasRole("ADMIN")
.requestMatchers(GET, "/api/v1/teams/**").hasAnyRole("MANAGER", "ADMIN")

// Reports
.requestMatchers("/api/v1/reports/**").hasAnyRole("MANAGER", "ADMIN")
```

### CORS — compatibilidad con Angular dev server

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:4200"));  // Angular dev
    config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return source;
}
```

---

## Capa de servicio — patrones

### Interfaz + implementación

```java
// Interfaz
public interface AbsenceService {
    AbsenceResponse create(Long userId, CreateAbsenceRequest request);
    AbsenceResponse approve(Long absenceId, Long managerId, ApproveAbsenceRequest request);
    // ...
}

// Implementación
@Service
@Transactional
@RequiredArgsConstructor
public class AbsenceServiceImpl implements AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final UserRepository userRepository;
    private final AbsenceMapper mapper;

    @Override
    public AbsenceResponse create(Long userId, CreateAbsenceRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        validateAvailableDays(user, request);   // regla de negocio: 22 días/año

        AbsenceRequest absence = mapper.toEntity(request);
        absence.setUser(user);
        absence.setTotalDays(calculateWorkingDays(request.startDate(), request.endDate()));
        absence.setCreatedAt(LocalDateTime.now());

        return mapper.toResponse(absenceRepository.save(absence));
    }
}
```

### Reglas de negocio críticas (extraídas del frontend)

- **22 días de vacaciones por año** — `AbsenceService` frontend calcula esto. El backend valida.
- **No solapar ausencias** — validar que no existan ausencias `APPROVED` o `PENDING` en el mismo rango.
- **Solo el propio usuario puede crear sus ausencias** — o Admin.
- **Solo Manager de ese equipo puede aprobar/rechazar** — o Admin.
- **`REJECTED` requiere `managerComment`** — validación obligatoria.
- **Admin sin equipo** → el frontend lo redirige a `/team`. El backend no debe bloquear este estado.

---

## Manejo de errores — GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404 — recurso no encontrado
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    // 400 — validación Bean Validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", errors.toString()));
    }

    // 403 — sin permisos
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(AccessDeniedException ex) {
        return ResponseEntity.status(403)
            .body(new ErrorResponse("FORBIDDEN", "Insufficient permissions"));
    }

    // 401 — no autenticado
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(AuthenticationException ex) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("UNAUTHORIZED", "Invalid or expired token"));
    }

    // 409 — conflicto de negocio
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse(ex.getCode(), ex.getMessage()));
    }
}

// Shape del error — Angular lo intercepta en el HttpInterceptor
public record ErrorResponse(String code, String message) {}
```

**El frontend espera `{ code, message }` en errores.** No cambiar este contrato.

---

## Repositorios — queries clave

```java
public interface AbsenceRequestRepository extends JpaRepository<AbsenceRequest, Long> {

    // Ausencias del usuario en un año — para calcular días usados
    @Query("SELECT a FROM AbsenceRequest a WHERE a.user.id = :userId " +
           "AND YEAR(a.startDate) = :year AND a.status != 'REJECTED'")
    List<AbsenceRequest> findByUserIdAndYear(Long userId, int year);

    // Solapamiento — validación de negocio
    @Query("SELECT a FROM AbsenceRequest a WHERE a.user.id = :userId " +
           "AND a.status IN ('PENDING', 'APPROVED') " +
           "AND a.startDate <= :endDate AND a.endDate >= :startDate")
    List<AbsenceRequest> findOverlapping(Long userId, LocalDate startDate, LocalDate endDate);

    // Ausencias del equipo — para Manager view
    @Query("SELECT a FROM AbsenceRequest a WHERE a.user.team.id = :teamId " +
           "ORDER BY a.createdAt DESC")
    List<AbsenceRequest> findByTeamId(Long teamId);
}

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByEmailContainingIgnoreCase(String email);   // search
    List<User> findByTeamId(Long teamId);
}
```

---

## Testing — convenciones

### Tests de integración (controller)

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AbsenceControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AbsenceService absenceService;

    @Test
    @WithMockUser(username = "empleado@absencehub.com", roles = "EMPLOYEE")
    void createAbsence_shouldReturn201_whenValid() throws Exception {
        var request = new CreateAbsenceRequest(
            AbsenceType.VACATION,
            LocalDate.of(2025, 6, 1),
            LocalDate.of(2025, 6, 5),
            "Vacaciones de verano"
        );

        var response = new AbsenceResponse(/* ... */);
        when(absenceService.create(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/absences")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("pending"))
            .andExpect(jsonPath("$.type").value("vacation"));
    }
}
```

### Tests de servicio (unitarios)

```java
@ExtendWith(MockitoExtension.class)
class AbsenceServiceImplTest {

    @Mock AbsenceRepository absenceRepository;
    @Mock UserRepository userRepository;
    @Mock AbsenceMapper mapper;

    @InjectMocks AbsenceServiceImpl service;

    @Test
    void create_shouldThrowBusinessException_whenExceedsDaysLimit() {
        // Arrange
        var user = buildUser(5);   // solo 5 días disponibles
        var request = new CreateAbsenceRequest(
            AbsenceType.VACATION,
            LocalDate.of(2025, 6, 1),
            LocalDate.of(2025, 6, 20),   // 20 días
            null
        );
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act + Assert
        assertThatThrownBy(() -> service.create(1L, request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("días disponibles");
    }
}
```

### Convenciones de naming en tests

- Método: `methodName_shouldExpectedBehavior_whenCondition`
- Profile de test: `@ActiveProfiles("test")` con H2 en memoria
- Un concepto por test — igual que Jest en frontend

---

## MapStruct — mappers

```java
@Mapper(componentModel = "spring")
public interface AbsenceMapper {

    @Mapping(target = "id",         ignore = true)
    @Mapping(target = "user",       ignore = true)
    @Mapping(target = "status",     constant = "PENDING")
    @Mapping(target = "createdAt",  expression = "java(LocalDateTime.now())")
    @Mapping(target = "totalDays",  ignore = true)   // calculado en servicio
    AbsenceRequest toEntity(CreateAbsenceRequest dto);

    @Mapping(source = "user",       target = "user")
    @Mapping(source = "reviewedBy", target = "reviewedBy")
    AbsenceResponse toResponse(AbsenceRequest entity);

    UserSummaryResponse toSummary(User user);
}
```

---

## application.yml

```yaml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/absencehub}
    username: ${DATABASE_USER:postgres}
    password: ${DATABASE_PASS:postgres}
  jpa:
    hibernate:
      ddl-auto: validate          # prod: nunca auto-crear/drop
    show-sql: false
    properties:
      hibernate:
        format_sql: true
  jackson:
    property-naming-strategy: LOWER_CAMEL_CASE
    serialization:
      write-dates-as-timestamps: false
    deserialization:
      fail-on-unknown-properties: false

app:
  jwt:
    secret: ${JWT_SECRET}
    expiration-ms: 86400000       # 24h
  cors:
    allowed-origins: ${CORS_ORIGINS:http://localhost:4200}

---
# application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:absencehub_test;MODE=PostgreSQL
  jpa:
    hibernate:
      ddl-auto: create-drop
```

---

## Comandos

```bash
# Desde absencehub-api/
./mvnw spring-boot:run                      # dev server en :8080
./mvnw test                                 # todos los tests
./mvnw test -Dtest=AbsenceServiceTest       # test específico
./mvnw clean package -DskipTests            # build JAR
./mvnw clean package                        # build con tests
```

---

## Convenciones del proyecto

- **Paquete base:** `com.absencehub.api`
- **Records para DTOs** — inmutables, menos boilerplate (Java 16+)
- **`@RequiredArgsConstructor`** en servicios y controllers — no setters manuales
- **`@Transactional`** en la capa de servicio, nunca en controllers
- **`@Valid`** en parámetros de controller que reciben DTOs
- **Interfaces de servicio** siempre — facilita mocks en tests
- **Sin `@Autowired` en campos** — usar constructor injection (Lombok o `@RequiredArgsConstructor`)
- **`Optional`** en repositorios — nunca devolver `null` directamente
- **Nombres en inglés** — entidades, DTOs, variables, métodos
- **Comentarios** solo si el "por qué" no es obvio — igual que en frontend
- **Sin lógica en controllers** — solo delegación a servicios
- **Validaciones de negocio en servicios** — nunca en controllers ni entidades
- **HTTP semántico:** `201 Created` al crear, `204 No Content` al eliminar, `200 OK` al actualizar

---

## Incompatibilidades a vigilar activamente

| Riesgo | Causa | Solución |
|--------|-------|---------|
| Enum case mismatch | Usar `role.name()` en lugar de `role.getValue()` devuelve `"MANAGER"` en vez de `"manager"` | Siempre usar `@JsonValue getValue()` — nunca `name()` ni `toString()` por defecto |
| Fechas como timestamp | Jackson config por defecto | `write-dates-as-timestamps: false` en YAML |
| camelCase vs snake_case | Spring por defecto usa snake en BD, camelCase en JSON | Configurar Jackson `LOWER_CAMEL_CASE` |
| `availableDays` no en respuesta | Se omite por ser null/0 | Incluir siempre en `UserResponse` aunque sea 0 |
| CORS en producción | `localhost:4200` hardcodeado | Parametrizar con env var `CORS_ORIGINS` |
| `managerComment` null en reject | Frontend lo muestra en UI | Backend valide `@NotBlank` en `RejectAbsenceRequest` |
| Token expirado → 401 vs 403 | Confusión común en Spring Security | Separar `AuthenticationException` de `AccessDeniedException` |
