package com.ecoscrap.controllers;

import com.ecoscrap.dto.OrderDto;
import com.ecoscrap.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<OrderDto> placeOrder(@RequestParam Long productId, @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(orderService.placeOrder(productId, quantity));
    }
}

