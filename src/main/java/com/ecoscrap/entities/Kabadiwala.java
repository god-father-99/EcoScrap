package com.ecoscrap.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.locationtech.jts.geom.Point;

import java.util.ArrayList;
import java.util.List;


@Entity
@Getter
@Setter
@Table(name = "kabadiwala")
public class Kabadiwala {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name="user_id")
    private User user;

    private Double rating;

    @Column(columnDefinition = "Geometry(Point,4326)")
    private Point currentLocation;

    @OneToMany(mappedBy = "assignedKabadiwala", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ScrapListing> assignedScrapListings = new ArrayList<>();
}
