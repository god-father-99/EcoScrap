package com.ecoscrap.repositories;

import com.ecoscrap.entities.ScrapPickupRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ScrapPickupRequestRepository extends JpaRepository<ScrapPickupRequest, Long> {
}
