package com.ecoscrap.dto;

import com.ecoscrap.entities.enums.Role;
import lombok.Data;

import java.util.Set;


@Data
public class UserDto {

    private Long id;
    private String username;
    private String name;
    private Set<Role> roles;
    private String phoneNo;
}