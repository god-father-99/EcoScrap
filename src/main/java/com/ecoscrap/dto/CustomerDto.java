package com.ecoscrap.dto;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class CustomerDto {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private UserDto user;

    private Double rating;
}
