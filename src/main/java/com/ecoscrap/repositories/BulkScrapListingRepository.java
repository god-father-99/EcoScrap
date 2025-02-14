package com.ecoscrap.repositories;



import com.ecoscrap.entities.BulkScrapListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface BulkScrapListingRepository extends JpaRepository<BulkScrapListing, Long> {
    // Additional custom queries can be added here
}

