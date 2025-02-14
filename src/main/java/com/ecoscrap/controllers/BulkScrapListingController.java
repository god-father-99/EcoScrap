package com.ecoscrap.controllers;

import com.ecoscrap.dto.BulkScrapListingDto;
import com.ecoscrap.entities.BulkScrapListing;
import com.ecoscrap.services.BulkScrapListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bulk-listings")
public class BulkScrapListingController {

    private final BulkScrapListingService bulkScrapListingService;

    // Kabadiwala creates a bulk scrap listing
    @PostMapping("/create")
    public ResponseEntity<BulkScrapListingDto> createBulkListing(@RequestBody BulkScrapListingDto listing) {
        return ResponseEntity.ok(bulkScrapListingService.createBulkListing(listing));
    }

    // Get all bulk listings
    @GetMapping
    public ResponseEntity<List<BulkScrapListingDto>> getAllBulkListings() {
        return ResponseEntity.ok(bulkScrapListingService.getAllBulkListings());
    }

    // Get details of a specific bulk listing
    @GetMapping("/{id}")
    public ResponseEntity<BulkScrapListingDto> getBulkListing(@PathVariable Long id) {
        return ResponseEntity.ok(bulkScrapListingService.getBulkListingById(id));
    }
}

