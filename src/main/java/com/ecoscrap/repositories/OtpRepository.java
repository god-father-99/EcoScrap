package com.ecoscrap.repositories;

import com.ecoscrap.entities.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> getOtpByOrderId(Long orderId);
}
