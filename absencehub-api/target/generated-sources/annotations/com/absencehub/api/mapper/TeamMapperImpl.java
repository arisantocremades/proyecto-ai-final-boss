package com.absencehub.api.mapper;

import com.absencehub.api.dto.response.TeamResponse;
import com.absencehub.api.dto.response.UserSummaryResponse;
import com.absencehub.api.entity.Team;
import com.absencehub.api.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-27T12:30:23+0200",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class TeamMapperImpl implements TeamMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public TeamResponse toResponse(Team team) {
        if ( team == null ) {
            return null;
        }

        UserSummaryResponse manager = null;
        List<UserSummaryResponse> members = null;
        Long id = null;
        String name = null;
        String description = null;

        manager = userMapper.toSummary( team.getManager() );
        members = userListToUserSummaryResponseList( team.getMembers() );
        id = team.getId();
        name = team.getName();
        description = team.getDescription();

        TeamResponse teamResponse = new TeamResponse( id, name, description, manager, members );

        return teamResponse;
    }

    @Override
    public List<TeamResponse> toResponseList(List<Team> teams) {
        if ( teams == null ) {
            return null;
        }

        List<TeamResponse> list = new ArrayList<TeamResponse>( teams.size() );
        for ( Team team : teams ) {
            list.add( toResponse( team ) );
        }

        return list;
    }

    protected List<UserSummaryResponse> userListToUserSummaryResponseList(List<User> list) {
        if ( list == null ) {
            return null;
        }

        List<UserSummaryResponse> list1 = new ArrayList<UserSummaryResponse>( list.size() );
        for ( User user : list ) {
            list1.add( userMapper.toSummary( user ) );
        }

        return list1;
    }
}
