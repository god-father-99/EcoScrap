package com.ecoscrap.dto;

import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class VendorDto {
    private Long id;

    private UserDto user;

    private Double rating;

    private PointDto currentLocation;
}
