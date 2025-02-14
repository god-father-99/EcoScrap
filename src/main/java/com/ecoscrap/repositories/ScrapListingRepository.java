package com.ecoscrap.repositories;

import com.ecoscrap.entities.ScrapListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ScrapListingRepository extends JpaRepository<ScrapListing, Long> {
}
