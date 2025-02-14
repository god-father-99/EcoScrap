package com.ecoscrap.entities;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    private User volunteerUser;
    private String description;
    private String address;
    private String imageUrl ;
    @CreationTimestamp
    private LocalDate createdAt;
}
