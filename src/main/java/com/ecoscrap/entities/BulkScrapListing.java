package com.ecoscrap.entities;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class BulkScrapListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Title or description of the bulk scrap (e.g., "100 kg mixed scrap from locality XYZ")
    @Column(nullable = false)
    private String title;

    // Detailed description
    @Column(nullable = false, length = 1000)
    private String description;

    // Base price set by the Kabadiwala
    @Column(nullable = false)
    private Double basePrice;

    // Auction end time (if using a bidding window, e.g., one hour)
    @Column(nullable = false)
    private LocalDateTime auctionEndTime;

    // Picture URL of the bulk scrap (if provided)
    private String pictureUrl;

    // The Kabadiwala who created this listing
    @ManyToOne
    @JoinColumn(name = "kabadiwala_id", nullable = false)
    private Kabadiwala kabadiwala;

    // Bids from vendors
    @OneToMany(mappedBy = "bulkScrapListing", cascade = CascadeType.ALL)
    private List<VendorBid> bids;
}

