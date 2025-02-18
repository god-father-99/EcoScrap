package com.ecoscrap.services;

import com.ecoscrap.dto.OrderDto;
import com.ecoscrap.entities.Customer;
import com.ecoscrap.entities.Order;
import com.ecoscrap.entities.Product;
import com.ecoscrap.entities.User;
import com.ecoscrap.entities.enums.OrderStatus;
import com.ecoscrap.entities.enums.ProductStatus;
import com.ecoscrap.exeptions.ResourceNotFoundException;
import com.ecoscrap.repositories.CustomerRepository;
import com.ecoscrap.repositories.OrderRepository;
import com.ecoscrap.repositories.ProductRepository;
import com.ecoscrap.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public OrderDto placeOrder(Long productId, int quantity) {
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByUsername(username).orElseThrow(()->new ResourceNotFoundException("User Not Found"));
        Customer customer=customerRepository.findByUser_Id(user.getId()).orElseThrow(()->new ResourceNotFoundException("Customer Not Found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not available"));

        if (product.getQuantity() < quantity) throw new RuntimeException("Insufficient stock");

        product.setQuantity(product.getQuantity() - quantity);
        if (product.getQuantity() == 0) product.setStatus(ProductStatus.SOLD_OUT);

        Order order = new Order();
        order.setCustomer(customer);
        order.setProduct(product);
        order.setQuantity(quantity);
        order.setTotalPrice(product.getPrice() * quantity);
        order.setStatus(OrderStatus.PENDING);

        productRepository.save(product);
        Order savedOrder = orderRepository.save(order);
        return modelMapper.map(savedOrder, OrderDto.class);
    }
}

