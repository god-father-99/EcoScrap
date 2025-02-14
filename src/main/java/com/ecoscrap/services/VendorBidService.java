package com.ecoscrap.services;

import com.ecoscrap.dto.VendorBidDto;
import com.ecoscrap.entities.BulkScrapListing;
import com.ecoscrap.entities.User;
import com.ecoscrap.entities.Vendor;
import com.ecoscrap.entities.VendorBid;
import com.ecoscrap.exeptions.ResourceNotFoundException;
import com.ecoscrap.repositories.BulkScrapListingRepository;
import com.ecoscrap.repositories.UserRepository;
import com.ecoscrap.repositories.VendorBidRepository;
import com.ecoscrap.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorBidService {

    private final VendorBidRepository vendorBidRepository;
    private final BulkScrapListingRepository bulkScrapListingRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public VendorBidDto placeBid(Long bulkListingId, VendorBidDto bid) {
        BulkScrapListing listing = bulkScrapListingRepository.findById(bulkListingId)
                .orElseThrow(() -> new RuntimeException("Bulk Listing not found"));
        // Check that the auction is still open
        if (LocalDateTime.now().isAfter(listing.getAuctionEndTime())) {
            throw new RuntimeException("Bidding period is over for this bulk scrap listing");
        }
        VendorBid vendorBid=modelMapper.map(bid, VendorBid.class);
        vendorBid.setBulkScrapListing(listing);
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByUsername(username).orElseThrow(()->new ResourceNotFoundException("User not found with username"+username));
        Vendor vendor=vendorRepository.findByUser(user).orElseThrow(()->new ResourceNotFoundException("Vendor not found with username"+username));
        vendorBid.setVendor(vendor);
        VendorBid savedVendorBid= vendorBidRepository.save(vendorBid);
        return modelMapper.map(savedVendorBid, VendorBidDto.class);
    }

    public List<VendorBidDto> getBidsForBulkListing(Long bulkListingId) {
        List<VendorBid> vendorBids= vendorBidRepository.findByBulkScrapListingId(bulkListingId);
        return vendorBids.stream().map(vendorBid->modelMapper.map(vendorBid,VendorBidDto.class)).collect(Collectors.toList());
    }

}
