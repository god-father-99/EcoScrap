package com.ecoscrap.services;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import com.ecoscrap.dto.OrderDto;
import com.ecoscrap.dto.ProductDto;
import com.ecoscrap.entities.*;
import com.ecoscrap.entities.enums.OrderStatus;
import com.ecoscrap.entities.enums.ProductStatus;
import com.ecoscrap.exeptions.ResourceNotFoundException;
import com.ecoscrap.repositories.*;
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
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;
import software.amazon.awssdk.services.sns.model.SnsException;


@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final KabadiwalaRepository kabadiwalaRepository;
    private final SnsClient snsClient;
    private final OtpRepository otpRepository;

    @Value("${razorpay.key.id}")
    private String razorpayId;
    @Value("${razorpay.key.secret}")
    private String razorpaySecret;
    @Value("${TOPIC_ARN_CUSTOMER}")
    private String topicArnCustomer;

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
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            // Format the requestedTime
            String formattedTime = LocalDateTime.now().plusHours(5).format(formatter);
            String emailTemplate = """
                Dear %s, 👋

                Thank you for placing your order with us! 🎉 Your order has been successfully confirmed. Here are the details:

                🛒 Order Details:  
                - Order ID: %s  
                - Item Ordered: %s  
                - Total Amount: ₹%s  
                - Payment Status: %s  
                - Payment ID: %s
                -OTP for delivery : %s

                📍 Delivery Details:  
                - Delivery Location: %s  
                - Estimated Delivery Time: %s  

                🚛 Kabadiwala Details:  
                - Name: %s  
                - Contact Number:** %s   

                You can track your order status through our platform. If you have any questions, feel free to reach out. 📞  

                Thank you for choosing us! We appreciate your support. 😊  

                Best regards,  
                %s Team  
                """;
            String otp=generateRandomOTP();
            Otp otp1=new Otp();
            otp1.setOtpCode(otp);
            otp1.setOrder(orders);
            otpRepository.save(otp1);
            String emailContent = String.format(emailTemplate,
                    orders.getCustomer().getUser().getName(), orders.getId(), orders.getProduct().getName(), orders.getTotalPrice(), orders.getStatus(),razorpayId,otp,
                    "jagamara , bhubaneswar",formattedTime , orders.getProduct().getKabadiwala().getUser().getName(),
                    orders.getProduct().getKabadiwala().getUser().getPhoneNo(), "EcoScrap");


            PublishRequest publishRequest = PublishRequest.builder()
                    .message(emailContent)
                    .topicArn(topicArnCustomer)
                    .build();

            PublishResponse result = snsClient.publish(publishRequest);
            System.out
                    .println(result.messageId() + " Message sent. Status is " + result.sdkHttpResponse().statusCode());

        } catch (SnsException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
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
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            // Format the requestedTime
            String formattedTime = LocalDateTime.now().plusHours(5).format(formatter);
            String emailTemplate = """
                 Dear %s, 👋

                Thank you for placing your order with us! 🎉 Your order has been successfully confirmed. Here are the details:

                🛒 Order Details:  
                - Order ID: %s  
                - Item Ordered: %s  
                - Total Amount: ₹%s  
                - Payment Status: %s  
                -OTP for delivery : %s

                📍 Delivery Details:  
                - Delivery Location: %s  
                - Estimated Delivery Time: %s  

                🚛 Kabadiwala Details:  
                - Name: %s  
                - Contact Number:** %s   

                You can track your order status through our platform. If you have any questions, feel free to reach out. 📞  

                Thank you for choosing us! We appreciate your support. 😊  

                Best regards,  
                %s Team  
                """;
            String otp=generateRandomOTP();
            Otp otp1=new Otp();
            otp1.setOtpCode(otp);
            otp1.setOrder(savedOrder);
            otpRepository.save(otp1);
                    String emailContent = String.format(emailTemplate,
                    savedOrder.getCustomer().getUser().getName(), savedOrder.getId(), savedOrder.getProduct().getName(), savedOrder.getTotalPrice(), savedOrder.getStatus(),otp,
                    "jagamara , bhubaneswar",formattedTime , savedOrder.getProduct().getKabadiwala().getUser().getName(),
                    savedOrder.getProduct().getKabadiwala().getUser().getPhoneNo(), "EcoScrap");

            PublishRequest publishRequest = PublishRequest.builder()
                    .message(emailContent)
                    .topicArn(topicArnCustomer)
                    .build();

            PublishResponse result = snsClient.publish(publishRequest);
            System.out
                    .println(result.messageId() + " Message sent. Status is " + result.sdkHttpResponse().statusCode());

        } catch (SnsException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
        return modelMapper.map(savedOrder, OrderDto.class);
    }

    public List<OrderDto> getAllOrdersOfKabadiwala() {
        String username=SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByUsername(username).orElseThrow(()->new ResourceNotFoundException("User Not Found"));
        Kabadiwala kabadiwala=kabadiwalaRepository.findByUser(user).orElseThrow(()->new ResourceNotFoundException("Kabadiwala Not Found"));
        List<Order> orders=orderRepository.findAll();
        List<Order> orders1=orders.stream().filter(order -> Objects.equals(order.getProduct().getKabadiwala().getId(), kabadiwala.getId())).toList();
        return orders1.stream().map(order -> modelMapper.map(order,OrderDto.class)).collect(Collectors.toList());
    }

    private String generateRandomOTP(){
        Random random=new Random();
        int otp=random.nextInt(10000);//0 - 9999
        return String.format("%04d",otp);
    }

    public OrderDto deliverOrder(Long orderId, Otp otp) {
        Order order=orderRepository.findById(orderId).orElseThrow(()->new ResourceNotFoundException("Order not found"));
        Otp otp1=otpRepository.getOtpByOrderId(orderId).orElseThrow(()->new ResourceNotFoundException("otp not found"));
        String otp2=otp.getOtpCode();
        String otpCode=otp1.getOtpCode();
        if(otp2.equals(otpCode)){
            order.setStatus(OrderStatus.DELIVERED);
        }
        Order savedOrder=orderRepository.save(order);
        return modelMapper.map(savedOrder, OrderDto.class);
    }
}

