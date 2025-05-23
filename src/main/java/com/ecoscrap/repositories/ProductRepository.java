package com.ecoscrap.repositories;
import com.ecoscrap.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByKabadiwalaId(Long kabadiwalaId);
}


