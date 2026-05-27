package com.absencehub.api.service.impl;

import com.absencehub.api.dto.request.AddMemberRequest;
import com.absencehub.api.dto.request.CreateTeamRequest;
import com.absencehub.api.dto.request.UpdateTeamRequest;
import com.absencehub.api.dto.response.TeamResponse;
import com.absencehub.api.entity.Team;
import com.absencehub.api.entity.User;
import com.absencehub.api.enums.Role;
import com.absencehub.api.exception.BusinessException;
import com.absencehub.api.exception.ResourceNotFoundException;
import com.absencehub.api.mapper.TeamMapper;
import com.absencehub.api.repository.TeamRepository;
import com.absencehub.api.repository.UserRepository;
import com.absencehub.api.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMapper teamMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponse> findAll(Long requestingUserId) {
        User requester = loadUser(requestingUserId);

        if (requester.getRole() == Role.ADMIN) {
            return teamMapper.toResponseList(teamRepository.findAll());
        }

        // Manager solo ve su propio equipo
        return teamRepository.findByManagerId(requestingUserId)
                .map(t -> List.of(teamMapper.toResponse(t)))
                .orElse(List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public TeamResponse findById(Long teamId) {
        return teamMapper.toResponse(loadTeam(teamId));
    }

    @Override
    public TeamResponse create(CreateTeamRequest request) {
        if (teamRepository.existsByName(request.name())) {
            throw new BusinessException("TEAM_NAME_TAKEN", "Ya existe un equipo con ese nombre");
        }

        User manager = loadUser(request.managerId());
        manager.setRole(Role.MANAGER);
        userRepository.save(manager);

        Team team = Team.builder()
                .name(request.name())
                .description(request.description())
                .manager(manager)
                .build();

        Team saved = teamRepository.save(team);
        manager.setTeam(saved);
        userRepository.save(manager);

        return teamMapper.toResponse(teamRepository.findById(saved.getId()).orElseThrow());
    }

    @Override
    public TeamResponse update(Long teamId, UpdateTeamRequest request) {
        Team team = loadTeam(teamId);
        team.setName(request.name());
        team.setDescription(request.description());
        return teamMapper.toResponse(teamRepository.save(team));
    }

    @Override
    public TeamResponse addMember(Long teamId, AddMemberRequest request) {
        Team team = loadTeam(teamId);
        User user = loadUser(request.userId());

        if (user.getTeam() != null) {
            throw new BusinessException("ALREADY_IN_TEAM", "El usuario ya pertenece a un equipo");
        }

        user.setTeam(team);
        userRepository.save(user);

        return teamMapper.toResponse(teamRepository.findById(teamId).orElseThrow());
    }

    @Override
    public void removeMember(Long teamId, Long userId) {
        Team team = loadTeam(teamId);
        User user = loadUser(userId);

        if (user.getTeam() == null || !user.getTeam().getId().equals(teamId)) {
            throw new BusinessException("NOT_IN_TEAM", "El usuario no pertenece a este equipo");
        }

        // Si el usuario era el manager del equipo, limpiar la referencia
        if (team.getManager() != null && team.getManager().getId().equals(userId)) {
            team.setManager(null);
            teamRepository.save(team);
        }

        user.setTeam(null);
        userRepository.save(user);
    }

    private Team loadTeam(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team", id));
    }

    private User loadUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
