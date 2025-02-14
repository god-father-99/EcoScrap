package com.ecoscrap.dto;


import com.ecoscrap.entities.enums.ScrapPickupRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.time.LocalDateTime;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ScrapPickupRequestDto {
    private Long pickupId;

    private String Address;

    private String description;

    private LocalDateTime requestedTime;

    private PointDto pickupLocation;

    private String mobileNo;

    private String pictureUrl;

    private CustomerDto seller;

    private ScrapPickupRequestStatus scrapPickupRequestStatus;
}
