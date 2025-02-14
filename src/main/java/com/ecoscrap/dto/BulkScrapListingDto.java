package com.ecoscrap.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
public class BulkScrapListingDto{
    private Long id;

    private String title;

    private String description;

    private Double basePrice;

    private LocalDateTime auctionEndTime;

    private String pictureUrl;

    private KabadiwalaDto kabadiwala;
}
