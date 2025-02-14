package com.ecoscrap.dto;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VendorBidDto {
    private Long id;

    private BulkScrapListingDto bulkScrapListing;

    private VendorDto vendor;

    private Double bidAmount;

    private Boolean isAccepted=false;
}
