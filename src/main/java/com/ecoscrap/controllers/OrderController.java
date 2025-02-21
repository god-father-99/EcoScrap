package com.ecoscrap.controllers;

import com.ecoscrap.advices.ApiResponse;
import com.ecoscrap.dto.OrderDto;
import com.ecoscrap.services.OrderService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<OrderDto> placeOrder(@RequestParam Long productId, @RequestParam(defaultValue = "1") int quantity) throws RazorpayException {
        return ResponseEntity.ok(orderService.placeOrder(productId, quantity));
    }

    @PostMapping("/paymentCallback")
    public ResponseEntity<ApiResponse<String>> paymentCallback(
            @RequestParam("razorpay_payment_id") String paymentId,
            @RequestParam("razorpay_order_id") String orderId,
            @RequestParam("razorpay_signature") String signature
    ) {
        Map<String, String> response = new HashMap<>();
        response.put("razorpay_payment_id", paymentId);
        response.put("razorpay_order_id", orderId);
        response.put("razorpay_signature", signature);

        orderService.updateStatus(response);
        return ResponseEntity.ok(new ApiResponse<>("success"));
    }

    @GetMapping()
    public ResponseEntity<List<OrderDto>> getOrders(){
        return ResponseEntity.ok(orderService.getAllOrdersOfCustomer());
    }

    @PostMapping("/place1")
    public ResponseEntity<OrderDto> placeOrder1(@RequestParam Long productId, @RequestParam(defaultValue = "1") int quantity){
        return ResponseEntity.ok(orderService.placeOrder1(productId, quantity));
    }
}

