package com.absencehub.api.mapper;

import com.absencehub.api.dto.response.TeamSummaryResponse;
import com.absencehub.api.dto.response.UserResponse;
import com.absencehub.api.dto.response.UserSummaryResponse;
import com.absencehub.api.entity.User;
import com.absencehub.api.enums.Role;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-27T12:30:23+0200",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        Long id = null;
        String email = null;
        String name = null;
        Role role = null;
        Integer availableDays = null;

        id = user.getId();
        email = user.getEmail();
        name = user.getName();
        role = user.getRole();
        availableDays = user.getAvailableDays();

        TeamSummaryResponse team = toTeamSummary(user.getTeam());

        UserResponse userResponse = new UserResponse( id, email, name, role, availableDays, team );

        return userResponse;
    }

    @Override
    public UserSummaryResponse toSummary(User user) {
        if ( user == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        String email = null;
        Role role = null;

        id = user.getId();
        name = user.getName();
        email = user.getEmail();
        role = user.getRole();

        UserSummaryResponse userSummaryResponse = new UserSummaryResponse( id, name, email, role );

        return userSummaryResponse;
    }

    @Override
    public List<UserResponse> toResponseList(List<User> users) {
        if ( users == null ) {
            return null;
        }

        List<UserResponse> list = new ArrayList<UserResponse>( users.size() );
        for ( User user : users ) {
            list.add( toResponse( user ) );
        }

        return list;
    }
}
