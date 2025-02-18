package com.ecoscrap.services;

import com.ecoscrap.dto.ProductDto;
import com.ecoscrap.entities.Kabadiwala;
import com.ecoscrap.entities.Product;
import com.ecoscrap.entities.User;
import com.ecoscrap.exeptions.ResourceNotFoundException;
import com.ecoscrap.repositories.KabadiwalaRepository;
import com.ecoscrap.repositories.ProductRepository;
import com.ecoscrap.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final KabadiwalaRepository kabadiwalaRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public ProductDto addProduct(ProductDto productDto) {
        Product product = modelMapper.map(productDto, Product.class);
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByUsername(username).orElseThrow(()->new ResourceNotFoundException("User Not Found"));
        Kabadiwala kabadiwala=kabadiwalaRepository.findByUser(user).orElseThrow(()->new ResourceNotFoundException("Kabadiwala Not Found"));
        product.setKabadiwala(kabadiwala);
        Product savedProduct=productRepository.save(product);
        return modelMapper.map(savedProduct, ProductDto.class);
    }

    public List<ProductDto> getAllProducts() {
        List<Product> products=productRepository.findAll();
        return products.stream().map(product -> modelMapper.map(product,ProductDto.class)).collect(Collectors.toList());
    }
}

