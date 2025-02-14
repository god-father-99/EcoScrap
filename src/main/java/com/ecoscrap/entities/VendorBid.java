package com.ecoscrap.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class VendorBid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The bulk scrap listing on which the bid is placed
    @ManyToOne
    @JoinColumn(name = "bulk_scrap_listing_id", nullable = false)
    private BulkScrapListing bulkScrapListing;

    // The vendor who placed the bid
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    // Bid amount offered by the vendor
    @Column(nullable = false)
    private Double bidAmount;

    // Flag to mark if the bid was accepted after auction closes
    @Column(nullable = false)
    private Boolean isAccepted = false;
}

