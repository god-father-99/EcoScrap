package com.ecoscrap.entities;


import com.ecoscrap.entities.enums.ScrapPickupRequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class ScrapPickupRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pickupId;

    private String address;

    private String description;

    @CreationTimestamp
    private LocalDateTime requestedTime;

    private Point pickupLocation;

    private String mobileNo;

    private String pictureUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    private Customer seller;

    @Enumerated(EnumType.STRING)
    private ScrapPickupRequestStatus scrapPickupRequestStatus;
}
