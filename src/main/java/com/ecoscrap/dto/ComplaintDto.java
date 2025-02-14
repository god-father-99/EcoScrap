package com.ecoscrap.dto;

import com.ecoscrap.entities.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDto {
    private Long id;
    private String title;
    private UserDto volunteerUser;
    private String description;
    private String address;
    private String imageUrl;
    private LocalDate createdAt;
}
