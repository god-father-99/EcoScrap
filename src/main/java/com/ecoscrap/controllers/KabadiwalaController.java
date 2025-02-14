package com.ecoscrap.controllers;


import com.ecoscrap.dto.ScrapPickupRequestDto;
import com.ecoscrap.dto.ScrapListingDto;
import com.ecoscrap.repositories.ScrapPickupRequestRepository;
import com.ecoscrap.services.KabadiwalaService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/scrap")
public class KabadiwalaController {

    private final KabadiwalaService kabadiwalaService;
    private final ScrapPickupRequestRepository scrapPickupRequestRepository;
    private final ModelMapper modelMapper;

    @GetMapping
    public ResponseEntity<List<ScrapPickupRequestDto>> getScrap() {
        return ResponseEntity.ok(scrapPickupRequestRepository.findAll().stream().map(scrap->modelMapper.map(scrap, ScrapPickupRequestDto.class)).collect(Collectors.toList()));
    }

    @PostMapping("/acceptPickup/{scrapPickupRequestId}")
    public ResponseEntity<ScrapListingDto>acceptPickup(@PathVariable Long scrapPickupRequestId) {
        return ResponseEntity.ok(kabadiwalaService.acceptPickup(scrapPickupRequestId));
    }
}
