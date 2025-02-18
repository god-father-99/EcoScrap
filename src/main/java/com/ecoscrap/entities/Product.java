package com.ecoscrap.entities;

import com.ecoscrap.entities.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private double price;
    private int quantity;

    @ManyToOne
    @JoinColumn(name = "kabadiwala_id")
    private Kabadiwala kabadiwala;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.AVAILABLE;
}

