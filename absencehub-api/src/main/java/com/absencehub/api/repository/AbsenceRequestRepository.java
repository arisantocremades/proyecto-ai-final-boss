package com.absencehub.api.repository;

import com.absencehub.api.entity.AbsenceRequest;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AbsenceRequestRepository extends JpaRepository<AbsenceRequest, Long> {

    List<AbsenceRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Días usados de vacaciones en el año — excluye rechazadas
    @Query("SELECT a FROM AbsenceRequest a WHERE a.user.id = :userId " +
           "AND YEAR(a.startDate) = :year AND a.status != 'REJECTED' " +
           "AND a.type = 'VACATION'")
    List<AbsenceRequest> findVacationsByUserAndYear(@Param("userId") Long userId,
                                                    @Param("year") int year);

    // Detección de solapamiento — comprueba rangos con ausencias activas
    @Query("SELECT a FROM AbsenceRequest a WHERE a.user.id = :userId " +
           "AND a.status IN ('PENDING', 'APPROVED') " +
           "AND a.startDate <= :endDate AND a.endDate >= :startDate")
    List<AbsenceRequest> findOverlapping(@Param("userId") Long userId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    // Ausencias del equipo — vista Manager
    @Query("SELECT a FROM AbsenceRequest a WHERE a.user.team.id = :teamId " +
           "ORDER BY a.createdAt DESC")
    List<AbsenceRequest> findByTeamId(@Param("teamId") Long teamId);

    // Todas las ausencias con filtros opcionales — vista Admin/Reports
    @Query("SELECT a FROM AbsenceRequest a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:type IS NULL OR a.type = :type) AND " +
           "(:startDate IS NULL OR a.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.endDate <= :endDate) " +
           "ORDER BY a.createdAt DESC")
    List<AbsenceRequest> findWithFilters(@Param("status") AbsenceStatus status,
                                          @Param("type") AbsenceType type,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);
}
