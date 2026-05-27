package com.absencehub.api.mapper;

import com.absencehub.api.dto.request.CreateAbsenceRequest;
import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.dto.response.UserSummaryResponse;
import com.absencehub.api.entity.AbsenceRequest;
import com.absencehub.api.enums.AbsenceStatus;
import com.absencehub.api.enums.AbsenceType;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
public class AbsenceMapperImpl implements AbsenceMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public AbsenceRequest toEntity(CreateAbsenceRequest dto) {
        if ( dto == null ) {
            return null;
        }

        AbsenceRequest.AbsenceRequestBuilder absenceRequest = AbsenceRequest.builder();

        absenceRequest.type( dto.type() );
        absenceRequest.startDate( dto.startDate() );
        absenceRequest.endDate( dto.endDate() );
        absenceRequest.reason( dto.reason() );

        return absenceRequest.build();
    }

    @Override
    public AbsenceResponse toResponse(AbsenceRequest entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        UserSummaryResponse user = null;
        AbsenceType type = null;
        LocalDate startDate = null;
        LocalDate endDate = null;
        Integer totalDays = null;
        AbsenceStatus status = null;
        String reason = null;
        String managerComment = null;
        UserSummaryResponse reviewedBy = null;
        LocalDateTime reviewedAt = null;
        LocalDateTime createdAt = null;

        id = entity.getId();
        user = userMapper.toSummary( entity.getUser() );
        type = entity.getType();
        startDate = entity.getStartDate();
        endDate = entity.getEndDate();
        totalDays = entity.getTotalDays();
        status = entity.getStatus();
        reason = entity.getReason();
        managerComment = entity.getManagerComment();
        reviewedBy = userMapper.toSummary( entity.getReviewedBy() );
        reviewedAt = entity.getReviewedAt();
        createdAt = entity.getCreatedAt();

        AbsenceResponse absenceResponse = new AbsenceResponse( id, user, type, startDate, endDate, totalDays, status, reason, managerComment, reviewedBy, reviewedAt, createdAt );

        return absenceResponse;
    }

    @Override
    public List<AbsenceResponse> toResponseList(List<AbsenceRequest> entities) {
        if ( entities == null ) {
            return null;
        }

        List<AbsenceResponse> list = new ArrayList<AbsenceResponse>( entities.size() );
        for ( AbsenceRequest absenceRequest : entities ) {
            list.add( toResponse( absenceRequest ) );
        }

        return list;
    }
}
