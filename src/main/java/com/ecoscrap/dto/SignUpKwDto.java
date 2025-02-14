package com.ecoscrap.dto;

import com.ecoscrap.annotations.ValidPhoneNumber;
import lombok.Data;


@Data
public class SignUpKwDto {
    private String username;
    private String password;
    private String name;

    @ValidPhoneNumber(message = "Enter valid phone number")
    private String phoneNo;
    private PointDto currentLocation;
}
