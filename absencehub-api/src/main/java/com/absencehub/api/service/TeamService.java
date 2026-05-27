package com.absencehub.api.service;

import com.absencehub.api.dto.request.AddMemberRequest;
import com.absencehub.api.dto.request.CreateTeamRequest;
import com.absencehub.api.dto.request.UpdateTeamRequest;
import com.absencehub.api.dto.response.TeamResponse;

import java.util.List;

public interface TeamService {

    List<TeamResponse> findAll(Long requestingUserId);

    TeamResponse findById(Long teamId);

    TeamResponse create(CreateTeamRequest request);

    TeamResponse update(Long teamId, UpdateTeamRequest request);

    TeamResponse addMember(Long teamId, AddMemberRequest request);

    void removeMember(Long teamId, Long userId);
}
