package com.ecoscrap.services;

import com.ecoscrap.entities.BulkScrapListing;
import com.ecoscrap.entities.VendorBid;
import com.ecoscrap.repositories.BulkScrapListingRepository;
import com.ecoscrap.repositories.VendorBidRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;
import software.amazon.awssdk.services.sns.model.SnsException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuctionClosureService {

    @Value("${TOPIC_ARN_VENDOR}")
    private String vendorTopicArn;

    private final BulkScrapListingRepository bulkScrapListingRepository;
    private final VendorBidRepository vendorBidRepository;
    private final SnsClient snsClient;
    private final OlaReverseGeocodingService olaReverseGeocodingService;

    // This scheduled task runs every minute to check for expired auctions.
    @Scheduled(fixedRate = 60000)
    public void closeExpiredAuctions() {
        log.info("Cleaning up expired Auctions");
        List<BulkScrapListing> listings = bulkScrapListingRepository.findAll();
        for (BulkScrapListing listing : listings) {
            if (LocalDateTime.now().isAfter(listing.getAuctionEndTime())) {
                List<VendorBid> bids = vendorBidRepository.findByBulkScrapListingId(listing.getId());
                log.info(bids.getFirst().getVendor().getUser().getName());
                if (!bids.isEmpty()) {
                    VendorBid highestBid = bids.stream()
                            .max(Comparator.comparing(VendorBid::getBidAmount))
                            .orElse(null);
                    if (highestBid != null) {
                        if(!highestBid.getIsAccepted()) {
                            highestBid.setIsAccepted(true);
                            VendorBid savedVendorBid = vendorBidRepository.save(highestBid);
                            // Optionally, notify the vendor and update the listing status.
                            try {
                                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

                                // Format the requestedTime
                                String formattedTime = savedVendorBid.getBulkScrapListing().getAuctionEndTime().format(formatter);
                                String message = String.format(
                                        "📢 Congratulations! Your Bid Has Been Accepted!\n\n🎉 Vendor Name: %s\n📦 Scrap Details: %s\n📍 Pickup Location: %s\n📅 Scheduled Time: %s\n📞 Contact Seller: %s\nBidding amount : %f\n\n⚡ Please proceed with the pickup and complete the transaction.",
                                        savedVendorBid.getVendor().getUser().getName(),
                                        savedVendorBid.getBulkScrapListing().getDescription(),
                                        olaReverseGeocodingService.reverseGeocoding(savedVendorBid.getBulkScrapListing().getKabadiwala().getCurrentLocation()),
                                        formattedTime,
                                        savedVendorBid.getBulkScrapListing().getKabadiwala().getUser().getPhoneNo(),
                                        savedVendorBid.getBidAmount()
                                );

                                PublishRequest publishRequest = PublishRequest.builder()
                                        .message(message)
                                        .topicArn(vendorTopicArn)
                                        .build();

                                PublishResponse result = snsClient.publish(publishRequest);
                                System.out
                                        .println(result.messageId() + " Message sent. Status is " + result.sdkHttpResponse().statusCode());

                            } catch (SnsException e) {
                                System.err.println(e.awsErrorDetails().errorMessage());
                                System.exit(1);
                            }
                        }
                    }
                }
            }
        }
    }
}

