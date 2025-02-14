package com.ecoscrap.repositories;

import com.ecoscrap.entities.VendorBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface VendorBidRepository extends JpaRepository<VendorBid, Long> {
    List<VendorBid> findByBulkScrapListingId(Long bulkScrapListingId);
}
