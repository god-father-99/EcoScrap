package com.ecoscrap.dto;

import com.ecoscrap.entities.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;

    private CustomerDto customer;

    private ProductDto product;

    private int quantity;

    private double totalPrice;

    private OrderStatus status = OrderStatus.PENDING;

    private String razorpayOrderId;
}
