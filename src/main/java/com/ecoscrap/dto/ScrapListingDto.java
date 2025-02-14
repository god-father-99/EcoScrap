package com.ecoscrap.dto;

import com.ecoscrap.entities.enums.ScrapStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ScrapListingDto {
    private Long id;

    private String description;

    private String pictureUrl;

    private ScrapStatus status;

    private String address;

    private LocalDateTime requestedTime;

    private String mobileNo;

    private PointDto pickupLocation;

    private CustomerDto seller;

    private KabadiwalaDto assignedKabadiwala;
}
