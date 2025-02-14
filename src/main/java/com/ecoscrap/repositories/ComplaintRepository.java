package com.ecoscrap.repositories;

import com.ecoscrap.entities.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ComplaintRepository extends JpaRepository<Complaint,Long> {

}
