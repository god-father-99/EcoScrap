package com.ecoscrap.dto;


import com.ecoscrap.entities.enums.Role;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.Set;


@Data
@NoArgsConstructor
public class KabadiwalaDto {
    private Long id;

    private UserDto user;

    private Double rating;

    private PointDto currentLocation;


}
