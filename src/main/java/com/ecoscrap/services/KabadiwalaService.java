package com.ecoscrap.services;


import com.ecoscrap.dto.ScrapListingDto;
import com.ecoscrap.dto.SignUpKwDto;
import com.ecoscrap.dto.UserDto;
import com.ecoscrap.entities.Kabadiwala;
import com.ecoscrap.entities.ScrapListing;
import com.ecoscrap.entities.ScrapPickupRequest;
import com.ecoscrap.entities.User;
import com.ecoscrap.entities.enums.Role;
import com.ecoscrap.entities.enums.ScrapPickupRequestStatus;
import com.ecoscrap.entities.enums.ScrapStatus;
import com.ecoscrap.exeptions.ResourceNotFoundException;
import com.ecoscrap.repositories.KabadiwalaRepository;
import com.ecoscrap.repositories.ScrapListingRepository;
import com.ecoscrap.repositories.ScrapPickupRequestRepository;
import com.ecoscrap.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.*;

import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class KabadiwalaService {
    private final KabadiwalaRepository kabadiwalaRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ScrapPickupRequestRepository scrapPickupRequestRepository;
    private final ModelMapper modelMapper;
    private final ScrapListingRepository scrapListingRepository;
    private final SnsClient snsClient;

    @Value("${TOPIC_ARN}")
    private String topicArn;

    @Value("${TOPIC_ARN_CUSTOMER}")
    private String topicArnCustomer;

    public UserDto signUp(SignUpKwDto signUpKwDto) {
        Optional<User> user = userRepository.findByUsername(signUpKwDto.getUsername());
        if(user.isPresent()) {
            throw new BadCredentialsException("User with username already exits "+ signUpKwDto.getUsername()+" with role other than kabadiwala");
        }
        User newUser = modelMapper.map(signUpKwDto, User.class);
        try{
            SubscribeRequest subscribeRequest=SubscribeRequest.builder().
                    protocol("email").
                    endpoint(signUpKwDto.getUsername()).
                    returnSubscriptionArn(true).
                    topicArn(topicArn).
                    build();
            SubscribeResponse result = snsClient.subscribe(subscribeRequest);
            log.info("Subscription ARN: " + result.subscriptionArn() + "\t Status is : "
                    + result.sdkHttpResponse().statusCode());
        }
        catch(SnsException e) {
            log.error(e.awsErrorDetails().errorMessage());
        }
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        newUser.setRoles(Set.of(Role.KABADIWALA));
        User savedUser=userRepository.save(newUser);
        Kabadiwala kabadiwala=modelMapper.map(signUpKwDto, Kabadiwala.class);
        kabadiwala.setUser(newUser);
        kabadiwala.setRating(Math.round((4.0 + new Random().nextDouble()) * 10.0) / 10.0);
        kabadiwalaRepository.save(kabadiwala);
        return modelMapper.map(savedUser, UserDto.class);
    }

    @Transactional
    public ScrapListingDto acceptPickup(Long scrapPickupRequestId) {
        ScrapPickupRequest scrapPickupRequest=scrapPickupRequestRepository.findById(scrapPickupRequestId).orElseThrow(()->new ResourceNotFoundException("Pickup Request Not Found"));
        String user= SecurityContextHolder.getContext().getAuthentication().getName();
        User user1=userRepository.findByUsername(user).orElseThrow(()->new ResourceNotFoundException("User Not Found"));
        Kabadiwala kabadiwala=kabadiwalaRepository.findByUser(user1).orElseThrow(()->new ResourceNotFoundException("Kabadiwala Not Found"));
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

            // Format the requestedTime
            String formattedTime = scrapPickupRequest.getRequestedTime().format(formatter);
            String message = String.format(
                    "Dear %s,\n\n" +
                            "Your scrap pickup request has been accepted!\n\n" +
                            "Scrap Collector is on his way.\n\n" +
                            "Pickup Details:\n" +
                            "Kabadiwala: %s\n" +
                            "Contact: %s\n" +
                            "Scheduled Pickup Time: %s\n\n" +
                            "Thank you for using our service!\n\n" +
                            "Best regards,\n" +
                            "Your Scrap Management Team",
                    user, kabadiwala.getUser().getName(), kabadiwala.getUser().getPhoneNo(), formattedTime
            );

            PublishRequest publishRequest = PublishRequest.builder()
                    .message(message)
                    .topicArn(topicArnCustomer)
                    .build();

            PublishResponse result = snsClient.publish(publishRequest);
            System.out
                    .println(result.messageId() + " Message sent. Status is " + result.sdkHttpResponse().statusCode());

        } catch (SnsException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
        scrapPickupRequest.setScrapPickupRequestStatus(ScrapPickupRequestStatus.CONFIRMED);
        ScrapListing scrapListing=modelMapper.map(scrapPickupRequest, ScrapListing.class);
        scrapListing.setAssignedKabadiwala(kabadiwala);
        scrapListing.setStatus(ScrapStatus.ASSIGNED);
        try {
            ScrapListing savedScrapListing = scrapListingRepository.saveAndFlush(scrapListing);
            log.info("Saved ScrapListing: {}", savedScrapListing);
            return modelMapper.map(savedScrapListing, ScrapListingDto.class);
        } catch (Exception e) {
            log.error("Error while saving ScrapListing: ", e);
            throw new RuntimeException("Failed to save ScrapListing", e);
        }
    }
}
