package com.ecoscrap.entities;

import com.ecoscrap.entities.enums.ScrapStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class ScrapListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    private String pictureUrl;


    @Enumerated(EnumType.STRING)
    private ScrapStatus status;

    private String address;

    @CreationTimestamp
    private LocalDateTime requestedTime;

    private String mobileNo;

    private Point pickupLocation;

    // Many-to-one mapping to the Kabadiwala entity (scrap seller)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Customer seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_kabadiwala_id")
    @JsonIgnore
    private Kabadiwala assignedKabadiwala;

}

