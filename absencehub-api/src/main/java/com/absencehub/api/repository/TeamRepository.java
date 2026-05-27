package com.absencehub.api.repository;

import com.absencehub.api.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {

    Optional<Team> findByManagerId(Long managerId);

    boolean existsByName(String name);
}
