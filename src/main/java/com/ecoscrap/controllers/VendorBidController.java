package com.ecoscrap.controllers;

import com.ecoscrap.dto.BulkScrapListingDto;
import com.ecoscrap.dto.VendorBidDto;
import com.ecoscrap.entities.VendorBid;
import com.ecoscrap.services.VendorBidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vendor-bids")
public class VendorBidController {

    private final VendorBidService vendorBidService;

    // Vendor places a bid on a bulk listing
    @PostMapping("/place/{bulkListingId}")
    public ResponseEntity<VendorBidDto> placeBid(@PathVariable Long bulkListingId, @RequestBody VendorBidDto bid) {
        return ResponseEntity.ok(vendorBidService.placeBid(bulkListingId, bid));
    }

    // Retrieve all bids for a bulk listing
    @GetMapping("/bulk-listing/{bulkListingId}")
    public ResponseEntity<List<VendorBidDto>> getBids(@PathVariable Long bulkListingId) {
        return ResponseEntity.ok(vendorBidService.getBidsForBulkListing(bulkListingId));
    }

    @GetMapping()
    public ResponseEntity<List<BulkScrapListingDto>> getAllBulkScrapRequest() {
        return ResponseEntity.ok(vendorBidService.getAllBulkScrapListing());
    }
}
