package com.ecoscrap.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.json.JSONObject;


@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Value("${razorpay.key.id}")
    private String razorpayId;
    @Value("${razorpay.key.secret}")
    private String razorpaySecret;

    private RazorpayClient razorpayCLient;

    @PostConstruct
    public void init() throws RazorpayException {
        this.razorpayCLient = new RazorpayClient(razorpayId, razorpaySecret);
    }

    @Transactional
    public OrderDto placeOrder(Long productId, int quantity) throws RazorpayException {
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

        JSONObject options = new JSONObject();
        options.put("amount", order.getTotalPrice() * 100); // amount in paise
        options.put("currency", "INR");
        options.put("receipt", order.getCustomer().getUser().getUsername());
        com.razorpay.Order razorpayOrder = razorpayCLient.orders.create(options);
        if(razorpayOrder != null) {
            order.setRazorpayOrderId(razorpayOrder.get("id"));
        }

        productRepository.save(product);
        Order savedOrder = orderRepository.save(order);
        return modelMapper.map(savedOrder, OrderDto.class);
    }

    public void updateStatus(Map<String, String> map) {
        String razorpayId = map.get("razorpay_order_id");
        Order order = orderRepository.findByRazorpayOrderId(razorpayId);
        order.setStatus(OrderStatus.PAYMENT_DONE);
        Order orders = orderRepository.save(order);
    }

    public List<OrderDto> getAllOrdersOfCustomer() {
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByUsername(username).orElseThrow(()->new ResourceNotFoundException("User Not Found"));
        Customer customer=customerRepository.findByUser_Id(user.getId()).orElseThrow(()->new ResourceNotFoundException("Customer Not Found"));
        List<Order> orders= orderRepository.findByCustomerId(customer.getId());
        return orders.stream().map(order -> modelMapper.map(order,OrderDto.class)).collect(Collectors.toList());
    }

    public OrderDto placeOrder1(Long productId, int quantity) {
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

