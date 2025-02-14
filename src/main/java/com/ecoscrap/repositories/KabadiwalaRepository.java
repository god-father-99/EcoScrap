package com.ecoscrap.repositories;

import com.ecoscrap.entities.Kabadiwala;
import com.ecoscrap.entities.User;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KabadiwalaRepository extends JpaRepository<Kabadiwala, Long> {
    @Query(value = "SELECT d.*, ST_Distance(d.current_location, :pickupLocation) AS distance " +
            "FROM kabadiwala d " +
            "WHERE ST_DWithin(d.current_location, :pickupLocation, 10000) " +
            "ORDER BY distance " +
            "LIMIT 10", nativeQuery = true)
    List<Kabadiwala> findTenNearestKabadiwala(Point pickupLocation);


    Optional<Kabadiwala> findByUser(User user);
}
