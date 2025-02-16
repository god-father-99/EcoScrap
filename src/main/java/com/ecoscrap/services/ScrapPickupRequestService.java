package com.ecoscrap.services;


import com.ecoscrap.dto.ScrapPickupRequestDto;
import com.ecoscrap.entities.Customer;
import com.ecoscrap.entities.Kabadiwala;
import com.ecoscrap.entities.ScrapPickupRequest;
import com.ecoscrap.entities.User;
import com.ecoscrap.entities.enums.ScrapPickupRequestStatus;
import com.ecoscrap.exeptions.ResourceNotFoundException;
import com.ecoscrap.repositories.CustomerRepository;
import com.ecoscrap.repositories.KabadiwalaRepository;
import com.ecoscrap.repositories.ScrapPickupRequestRepository;
import com.ecoscrap.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;
import software.amazon.awssdk.services.sns.model.SnsException;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScrapPickupRequestService {
    private final ScrapPickupRequestRepository scrapPickupRequestRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;
    private final KabadiwalaRepository kabadiwalaRepository;
    private final SnsClient snsClient;

    @Value("${TOPIC_ARN}")
    private String topicArn;

    public ScrapPickupRequestDto requestScrapPickup(ScrapPickupRequestDto scrapPickupRequestDto) {
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByUsername(username).orElseThrow(()->new ResourceNotFoundException("user not  found"));
        Customer customer=customerRepository.findByUser_Id(user.getId()).orElseThrow(()->new ResourceNotFoundException("customer not found"));
        ScrapPickupRequest scrapPickupRequest=modelMapper.map(scrapPickupRequestDto, ScrapPickupRequest.class);
        scrapPickupRequest.setSeller(customer);
        scrapPickupRequest.setScrapPickupRequestStatus(ScrapPickupRequestStatus.PENDING);
        ScrapPickupRequest savedScrapPickupRequest=scrapPickupRequestRepository.save(scrapPickupRequest);

        //TODO : send notification to all kabadiwalas
        List<Kabadiwala> kabadiwalaList=kabadiwalaRepository.findTenNearestKabadiwala(scrapPickupRequest.getPickupLocation());
        kabadiwalaList.forEach(kabadiwala-> log .info(kabadiwala.getUser().getUsername()));
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            // Format the requestedTime
            String formattedTime = savedScrapPickupRequest.getRequestedTime().format(formatter);
            String message = String.format(
                    "🔔 New Scrap Pickup Request!\n\n📍 Location: %s\n📌 Description: %s\n📅 Requested Time: %s\n📞 Contact: %s\n\n💰 Interested? Then Grab it",
                    scrapPickupRequestDto.getAddress(),
                    scrapPickupRequestDto.getDescription(),
                    formattedTime,
                    scrapPickupRequestDto.getMobileNo()
            );

            PublishRequest publishRequest = PublishRequest.builder()
                    .message(message)
                    .topicArn(topicArn)
                    .build();

            PublishResponse result = snsClient.publish(publishRequest);
            System.out
                    .println(result.messageId() + " Message sent. Status is " + result.sdkHttpResponse().statusCode());

        } catch (SnsException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
        return modelMapper.map(scrapPickupRequest, ScrapPickupRequestDto.class);
    }
}
