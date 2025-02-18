package com.ecoscrap.dto;

import com.ecoscrap.entities.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;

    private String name;

    private String description;

    private double price;

    private int quantity;

    private KabadiwalaDto kabadiwala;

    private String imageUrl;

    private ProductStatus status = ProductStatus.AVAILABLE;
}
