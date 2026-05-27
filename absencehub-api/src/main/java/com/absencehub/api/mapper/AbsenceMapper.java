package com.absencehub.api.mapper;

import com.absencehub.api.dto.request.CreateAbsenceRequest;
import com.absencehub.api.dto.response.AbsenceResponse;
import com.absencehub.api.entity.AbsenceRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {UserMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface AbsenceMapper {

    @Mapping(target = "id",             ignore = true)
    @Mapping(target = "user",           ignore = true)
    @Mapping(target = "status",         ignore = true)   // fijado a PENDING en el servicio
    @Mapping(target = "totalDays",      ignore = true)   // calculado en el servicio
    @Mapping(target = "createdAt",      ignore = true)   // fijado en el servicio
    @Mapping(target = "reviewedBy",     ignore = true)
    @Mapping(target = "reviewedAt",     ignore = true)
    @Mapping(target = "managerComment", ignore = true)
    AbsenceRequest toEntity(CreateAbsenceRequest dto);

    AbsenceResponse toResponse(AbsenceRequest entity);

    List<AbsenceResponse> toResponseList(List<AbsenceRequest> entities);
}
