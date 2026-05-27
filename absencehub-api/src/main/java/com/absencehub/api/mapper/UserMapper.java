package com.absencehub.api.mapper;

import com.absencehub.api.dto.response.TeamSummaryResponse;
import com.absencehub.api.dto.response.UserResponse;
import com.absencehub.api.dto.response.UserSummaryResponse;
import com.absencehub.api.entity.Team;
import com.absencehub.api.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {

    @Mapping(target = "team", expression = "java(toTeamSummary(user.getTeam()))")
    UserResponse toResponse(User user);

    UserSummaryResponse toSummary(User user);

    List<UserResponse> toResponseList(List<User> users);

    default TeamSummaryResponse toTeamSummary(Team team) {
        if (team == null) return null;
        return new TeamSummaryResponse(team.getId(), team.getName());
    }
}
