package com.ecoscrap.services;

import com.ecoscrap.entities.BulkScrapListing;
import com.ecoscrap.entities.VendorBid;
import com.ecoscrap.repositories.BulkScrapListingRepository;
import com.ecoscrap.repositories.VendorBidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionClosureService {

    private final BulkScrapListingRepository bulkScrapListingRepository;
    private final VendorBidRepository vendorBidRepository;

    // This scheduled task runs every minute to check for expired auctions.
    @Scheduled(fixedRate = 60000)
    public void closeExpiredAuctions() {
        List<BulkScrapListing> listings = bulkScrapListingRepository.findAll();
        for (BulkScrapListing listing : listings) {
            if (LocalDateTime.now().isAfter(listing.getAuctionEndTime())) {
                List<VendorBid> bids = vendorBidRepository.findByBulkScrapListingId(listing.getId());
                if (!bids.isEmpty()) {
                    VendorBid highestBid = bids.stream()
                            .max(Comparator.comparing(VendorBid::getBidAmount))
                            .orElse(null);
                    if (highestBid != null) {
                        highestBid.setIsAccepted(true);
                        vendorBidRepository.save(highestBid);
                        // Optionally, notify the vendor and update the listing status.

                    }
                }
            }
        }
    }
}

