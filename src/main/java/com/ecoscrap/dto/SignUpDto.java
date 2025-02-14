package com.ecoscrap.dto;

import com.ecoscrap.annotations.ValidPhoneNumber;
import com.ecoscrap.entities.enums.Role;
import lombok.Data;

import java.util.Set;
@Data
public class SignUpDto {
    private String username;
    private String password;
    private String name;

    @ValidPhoneNumber(message = "Enter valid phone number")
    private String phoneNo;
    private Set<Role> roles;
}

