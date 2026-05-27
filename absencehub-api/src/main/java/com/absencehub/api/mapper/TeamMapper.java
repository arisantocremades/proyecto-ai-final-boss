package com.absencehub.api.mapper;

import com.absencehub.api.dto.response.TeamResponse;
import com.absencehub.api.entity.Team;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {UserMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TeamMapper {

    @Mapping(target = "manager", source = "manager")
    @Mapping(target = "members", source = "members")
    TeamResponse toResponse(Team team);

    List<TeamResponse> toResponseList(List<Team> teams);
}
