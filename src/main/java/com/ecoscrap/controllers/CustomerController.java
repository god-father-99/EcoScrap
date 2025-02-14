package com.ecoscrap.controllers;


import com.ecoscrap.dto.ScrapPickupRequestDto;
import com.ecoscrap.services.ScrapPickupRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final ScrapPickupRequestService scrapPickupRequestService;

    @PostMapping("/request")
    public ResponseEntity<ScrapPickupRequestDto> requestScrapPickup(@RequestBody ScrapPickupRequestDto scrapPickupRequestDto) {
        return ResponseEntity.ok(scrapPickupRequestService.requestScrapPickup(scrapPickupRequestDto));
    }
}
