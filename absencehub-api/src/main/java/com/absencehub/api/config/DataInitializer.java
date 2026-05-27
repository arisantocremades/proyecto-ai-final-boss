package com.absencehub.api.config;

import com.absencehub.api.entity.AbsenceRequest;
import com.absencehub.api.entity.Team;
import com.absencehub.api.entity.User;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;
import com.absencehub.api.enums.Role;
import com.absencehub.api.repository.AbsenceRequestRepository;
import com.absencehub.api.repository.TeamRepository;
import com.absencehub.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Seed de datos equivalentes a los mocks del frontend — solo activo en perfil 'dev'
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final AbsenceRequestRepository absenceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // Usuarios — mismas credenciales que los mocks del frontend
        User manager = saveUser("manager@absencehub.com", "manager123", "María López", Role.MANAGER);
        User carlos  = saveUser("empleado@absencehub.com", "empleado123", "Carlos Martínez", Role.EMPLOYEE);
        User ana     = saveUser("ana@absencehub.com",   "ana123",    "Ana Rodríguez",   Role.EMPLOYEE);
        User pedro   = saveUser("pedro@absencehub.com", "pedro123",  "Pedro Sánchez",   Role.EMPLOYEE);
        User laura   = saveUser("laura@absencehub.com", "laura123",  "Laura Fernández", Role.EMPLOYEE);
        User admin   = saveUser("admin@absencehub.com", "admin123",  "Admin Sistema",   Role.ADMIN);

        // Equipo de Desarrollo
        Team team = Team.builder()
                .name("Equipo de Desarrollo")
                .description("Equipo principal de desarrollo de software")
                .manager(manager)
                .build();
        team = teamRepository.save(team);

        manager.setTeam(team); userRepository.save(manager);
        carlos.setTeam(team);  userRepository.save(carlos);
        ana.setTeam(team);     userRepository.save(ana);
        pedro.setTeam(team);   userRepository.save(pedro);
        laura.setTeam(team);   userRepository.save(laura);

        // Ausencias de ejemplo
        saveAbsence(carlos, AbsenceType.VACATION, "2026-06-02", "2026-06-08", 5, AbsenceStatus.PENDING, "Vacaciones de verano");
        saveAbsence(carlos, AbsenceType.SICK,     "2026-04-10", "2026-04-11", 2, AbsenceStatus.APPROVED, "Gripe");
        saveAbsence(carlos, AbsenceType.PERSONAL, "2026-03-15", "2026-03-15", 1, AbsenceStatus.REJECTED, "Mudanza");
        saveAbsence(ana,    AbsenceType.VACATION, "2026-05-27", "2026-06-02", 5, AbsenceStatus.APPROVED, "Viaje a Portugal");
        saveAbsence(ana,    AbsenceType.PERSONAL, "2026-07-04", "2026-07-04", 1, AbsenceStatus.PENDING,  "Cita médica especialista");
        saveAbsence(pedro,  AbsenceType.VACATION, "2026-06-09", "2026-06-13", 5, AbsenceStatus.APPROVED, "Vacaciones");
        saveAbsence(pedro,  AbsenceType.VACATION, "2026-07-14", "2026-07-25", 10, AbsenceStatus.PENDING, "Vacaciones de verano");
        saveAbsence(laura,  AbsenceType.SICK,     "2026-05-26", "2026-05-27", 2, AbsenceStatus.APPROVED, "Visita médica");
        saveAbsence(manager,AbsenceType.VACATION, "2026-06-16", "2026-06-20", 5, AbsenceStatus.APPROVED, "Vacaciones");
    }

    private User saveUser(String email, String pass, String name, Role role) {
        return userRepository.save(User.builder()
                .email(email).password(passwordEncoder.encode(pass))
                .name(name).role(role).availableDays(22).active(true).build());
    }

    private void saveAbsence(User user, AbsenceType type, String start, String end,
                              int days, AbsenceStatus status, String reason) {
        absenceRepository.save(AbsenceRequest.builder()
                .user(user).type(type)
                .startDate(LocalDate.parse(start))
                .endDate(LocalDate.parse(end))
                .totalDays(days).status(status).reason(reason)
                .createdAt(LocalDateTime.now())
                .build());
    }
}
