package com.ecoscrap.services;


import com.ecoscrap.dto.BulkScrapListingDto;
import com.ecoscrap.entities.BulkScrapListing;
import com.ecoscrap.entities.Kabadiwala;
import com.ecoscrap.entities.User;
import com.ecoscrap.exeptions.ResourceNotFoundException;
import com.ecoscrap.repositories.BulkScrapListingRepository;
import com.ecoscrap.repositories.KabadiwalaRepository;
import com.ecoscrap.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;
import software.amazon.awssdk.services.sns.model.SnsException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BulkScrapListingService {

    private final BulkScrapListingRepository bulkScrapListingRepository;
    private final KabadiwalaRepository kabadiwalaRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final SnsClient snsClient;

    @Value("${TOPIC_ARN_VENDOR}")
    private String vendorTopicArn;

    // Create a bulk scrap listing. Auction end time is set (e.g., 1 hour from now)
    public BulkScrapListingDto createBulkListing(BulkScrapListingDto listing) {
        BulkScrapListing listing1=modelMapper.map(listing, BulkScrapListing.class);
        listing1.setAuctionEndTime(LocalDateTime.now().plusHours(2));
        String user= SecurityContextHolder.getContext().getAuthentication().getName();
        User user1=userRepository.findByUsername(user).orElseThrow(()->new ResourceNotFoundException("User not found"));
        Kabadiwala kabadiwala = kabadiwalaRepository.findByUser(user1).orElseThrow(()->new ResourceNotFoundException("Kabadiwala not found"));
        listing1.setKabadiwala(kabadiwala);
        BulkScrapListing savedListing=bulkScrapListingRepository.save(listing1);
        try {
            String message = String.format(
                    "New Bulk Scrap Listing!\n\n" +
                            "📌 *Title:* %s\n" +
                            "📄 *Description:* %s\n" +
                            "💰 *Base Price:* ₹%.2f\n" +
                            "⏳ *Auction Ends At:* %s\n\n" +
                            "📞 *Contact Kabadiwala:* %s (%s)\n\n" +
                            "Place your bids now before the auction closes!",
                    savedListing.getTitle(),
                    savedListing.getDescription(),
                    savedListing.getBasePrice(),
                    savedListing.getAuctionEndTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")),
                    savedListing.getKabadiwala().getUser().getName(),
                    savedListing.getKabadiwala().getUser().getPhoneNo()
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
        return modelMapper.map(savedListing, BulkScrapListingDto.class);
    }

    public List<BulkScrapListingDto> getAllBulkListings() {
        List<BulkScrapListing> bulkScrapListings= bulkScrapListingRepository.findAll();
        return bulkScrapListings.stream().map(bulkScrapListing -> modelMapper.map(bulkScrapListing, BulkScrapListingDto.class)).collect(Collectors.toList());
    }

    public BulkScrapListingDto getBulkListingById(Long id) {
        BulkScrapListing bulkScrapListing= bulkScrapListingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bulk Scrap Listing not found"));
        return modelMapper.map(bulkScrapListing, BulkScrapListingDto.class);
    }
}
