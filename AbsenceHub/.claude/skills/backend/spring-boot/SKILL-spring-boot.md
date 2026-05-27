---
name: spring-boot-backend
description: Experto en Spring Boot 3 para APIs REST enterprise. Usar SIEMPRE que
             el usuario pida crear endpoints, DTOs, entidades JPA, servicios, repositorios,
             mappers MapStruct, configuración de seguridad JWT, manejo de errores,
             tests JUnit/Mockito, o cualquier componente del backend de AbsenceHub.
             También aplicar para configuración Maven, application.yml, CORS,
             serialización Jackson, o validación Bean Validation.
---

# Spring Boot 3 — Backend Enterprise

## Estructura base del proyecto

```
absencehub-api/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/absencehub/api/
    │   │   ├── config/
    │   │   ├── controller/
    │   │   ├── dto/
    │   │   │   ├── request/
    │   │   │   └── response/
    │   │   ├── entity/
    │   │   ├── enums/
    │   │   ├── exception/
    │   │   ├── mapper/
    │   │   ├── repository/
    │   │   ├── security/
    │   │   └── service/
    │   │       └── impl/
    │   └── resources/
    │       ├── application.yml
    │       └── application-test.yml
    └── test/
        └── java/com/absencehub/api/
```

---

## pom.xml — dependencias base

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>

    <!-- MapStruct -->
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.6.3</version>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- H2 (tests) -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- SpringDoc OpenAPI -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.8.3</version>
    </dependency>

    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>

<!-- Procesadores de anotaciones (Lombok + MapStruct) -->
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <annotationProcessorPaths>
                    <path>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </path>
                    <path>
                        <groupId>org.mapstruct</groupId>
                        <artifactId>mapstruct-processor</artifactId>
                        <version>1.6.3</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## Controller — patrón estándar

```java
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear solicitud de ausencia")
    public ResponseEntity<AbsenceResponse> create(
            @Valid @RequestBody CreateAbsenceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(absenceService.create(userDetails.getId(), request));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Aprobar solicitud — solo Manager/Admin")
    public ResponseEntity<AbsenceResponse> approve(
            @PathVariable Long id,
            @Valid @RequestBody ApproveAbsenceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(absenceService.approve(id, userDetails.getId(), request));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<AbsenceResponse> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectAbsenceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(absenceService.reject(id, userDetails.getId(), request));
    }
}
```

**Reglas:**
- Sin lógica de negocio — solo delegación al servicio
- `@Valid` en todos los RequestBody
- `@AuthenticationPrincipal` para obtener el usuario del token JWT
- `ResponseEntity` con el status HTTP correcto (201 al crear, 204 al eliminar)

---

## DTOs con Records (Java 21)

```java
// Request
public record CreateAbsenceRequest(
    @NotNull(message = "El tipo de ausencia es obligatorio")
    AbsenceType type,

    @NotNull(message = "La fecha de inicio es obligatoria")
    @FutureOrPresent(message = "La fecha de inicio no puede ser en el pasado")
    LocalDate startDate,

    @NotNull(message = "La fecha de fin es obligatoria")
    LocalDate endDate,

    @Size(max = 500, message = "El motivo no puede superar los 500 caracteres")
    String reason
) {}

// Response — shape que espera Angular
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
    UserSummaryResponse reviewedBy,
    LocalDateTime reviewedAt,
    LocalDateTime createdAt
) {}

// Summary — para listas y referencias cruzadas
public record UserSummaryResponse(
    Long id,
    String name,
    String email,
    Role role
) {}
```

---

## Seguridad JWT — implementación completa

```java
// JwtUtil.java
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    public String generateToken(UserDetailsImpl userDetails) {
        return Jwts.builder()
            .subject(userDetails.getId().toString())
            .claim("email", userDetails.getEmail())
            .claim("role", userDetails.getRole().name())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    public Long extractUserId(String token) {
        return Long.parseLong(extractClaims(token).getSubject());
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}
```

```java
// JwtAuthFilter.java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (jwtUtil.isTokenValid(token)) {
            Long userId = jwtUtil.extractUserId(token);
            UserDetails userDetails = userDetailsService.loadUserById(userId);

            var auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }
}
```

---

## SecurityConfig

```java
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(POST, "/api/v1/auth/login").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .requestMatchers(GET, "/api/v1/absences/all").hasRole("ADMIN")
                .requestMatchers(GET, "/api/v1/absences/team").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers(PATCH, "/api/v1/absences/*/approve").hasAnyRole("MANAGER","ADMIN")
                .requestMatchers(PATCH, "/api/v1/absences/*/reject").hasAnyRole("MANAGER","ADMIN")
                .requestMatchers("/api/v1/users").hasRole("ADMIN")
                .requestMatchers(GET, "/api/v1/users/me").authenticated()
                .requestMatchers(GET, "/api/v1/users/search").authenticated()
                .requestMatchers("/api/v1/reports/**").hasAnyRole("MANAGER", "ADMIN")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:4200", "${app.cors.allowed-origins}"));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

---

## Excepciones custom

```java
// Base
public abstract class AppException extends RuntimeException {
    private final String code;
    public AppException(String code, String message) {
        super(message);
        this.code = code;
    }
    public String getCode() { return code; }
}

// Uso
public class ResourceNotFoundException extends AppException {
    public ResourceNotFoundException(String resource, Object id) {
        super("NOT_FOUND", resource + " not found with id: " + id);
    }
}

public class BusinessException extends AppException {
    public BusinessException(String code, String message) {
        super(code, message);
    }
}

// Códigos de error — sincronizados con el interceptor Angular
// NOT_FOUND, VALIDATION_ERROR, FORBIDDEN, UNAUTHORIZED,
// INSUFFICIENT_DAYS, ABSENCE_OVERLAP, INVALID_DATE_RANGE
```

---

## Tests — patrones JUnit 5

```java
// Test de servicio (unitario) — sin contexto Spring
@ExtendWith(MockitoExtension.class)
class AbsenceServiceImplTest {

    @Mock AbsenceRepository absenceRepository;
    @Mock UserRepository userRepository;
    @Mock AbsenceMapper mapper;
    @InjectMocks AbsenceServiceImpl service;

    @Test
    void create_shouldReturnResponse_whenRequestIsValid() {
        // Arrange
        var user = buildUser();
        var request = new CreateAbsenceRequest(VACATION, of(2025,6,1), of(2025,6,5), "test");
        var entity = buildEntity();
        var response = buildResponse();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(absenceRepository.save(any())).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        // Act
        var result = service.create(1L, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(AbsenceStatus.PENDING);
        verify(absenceRepository).save(any());
    }
}

// Test de controller (integración) — con MockMvc
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AbsenceControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean AbsenceService absenceService;

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void createAbsence_shouldReturn400_whenStartDateIsNull() throws Exception {
        var request = new CreateAbsenceRequest(VACATION, null, of(2025,6,5), null);

        mockMvc.perform(post("/api/v1/absences")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
```

**Convenciones:**
- Nombre método: `methodName_shouldExpectedBehavior_whenCondition`
- `@ActiveProfiles("test")` siempre en tests de integración
- Mockear la capa inmediatamente inferior, no todo el stack
- Un concepto por test (mismo principio que Jest en frontend)

---

## MapStruct — patrones

```java
@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface AbsenceMapper {

    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "user",        ignore = true)
    @Mapping(target = "status",      constant = "PENDING")
    @Mapping(target = "totalDays",   ignore = true)
    @Mapping(target = "createdAt",   ignore = true)
    @Mapping(target = "reviewedBy",  ignore = true)
    @Mapping(target = "reviewedAt",  ignore = true)
    @Mapping(target = "managerComment", ignore = true)
    AbsenceRequest toEntity(CreateAbsenceRequest dto);

    AbsenceResponse toResponse(AbsenceRequest entity);

    UserSummaryResponse toSummary(User user);

    List<AbsenceResponse> toResponseList(List<AbsenceRequest> entities);
}
```

---

## Lo que NO hacer

```java
// ❌ Lógica de negocio en controller
@PostMapping
public ResponseEntity<?> create(@RequestBody CreateAbsenceRequest req) {
    if (req.startDate().isAfter(req.endDate())) { ... }   // NO — va en servicio
}

// ✅ Solo delegación en controller
@PostMapping
public ResponseEntity<AbsenceResponse> create(@Valid @RequestBody CreateAbsenceRequest req,
                                               @AuthenticationPrincipal UserDetailsImpl user) {
    return ResponseEntity.status(201).body(service.create(user.getId(), req));
}

// ❌ @Autowired en campo
@Autowired AbsenceService service;   // NO

// ✅ Constructor injection con Lombok
@RequiredArgsConstructor
public class AbsenceController {
    private final AbsenceService service;
}

// ❌ Devolver null desde repositorio
public User getUser(Long id) {
    return userRepository.findById(id).orElse(null);   // NO
}

// ✅ Lanzar excepción semántica
public User getUser(Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User", id));
}

// ❌ @Transactional en controller
@Transactional  // NO — va en la capa de servicio
@PostMapping
public ResponseEntity<?> create(...) { }

// ❌ Serializar enums como ordinal
// En JSON: { "status": 0 }  ← el frontend no entiende esto
// ✅ Siempre como string: { "status": "PENDING" }
// Configurar en application.yml: jackson.serialization.write-enums-using-to-string: true

// ❌ Fechas como timestamp Unix
// { "startDate": 1748908800000 }  ← Angular espera string ISO
// ✅ { "startDate": "2025-06-03" }
// Configurar: jackson.serialization.write-dates-as-timestamps: false
```
