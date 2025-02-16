package com.ecoscrap.services;


import com.ecoscrap.dto.SignUpKwDto;
import com.ecoscrap.dto.UserDto;
import com.ecoscrap.entities.User;
import com.ecoscrap.entities.Vendor;
import com.ecoscrap.entities.enums.Role;
import com.ecoscrap.repositories.UserRepository;
import com.ecoscrap.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.SnsException;
import software.amazon.awssdk.services.sns.model.SubscribeRequest;
import software.amazon.awssdk.services.sns.model.SubscribeResponse;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class VendorService {
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final SnsClient snsClient;

    @Value("${TOPIC_ARN_VENDOR}")
    private String topicArn;

    public UserDto signUp(SignUpKwDto signUpKwDto) {
        Optional<User> user = userRepository.findByUsername(signUpKwDto.getUsername());
        if(user.isPresent()) {
            throw new BadCredentialsException("User with username already exits "+ signUpKwDto.getUsername()+" with role other than vendor");
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
        newUser.setRoles(Set.of(Role.VENDOR));
        User savedUser=userRepository.save(newUser);
        Vendor vendor=modelMapper.map(signUpKwDto, Vendor.class);
        vendor.setUser(newUser);
        vendor.setRating(Math.round((4.0 + new Random().nextDouble()) * 10.0) / 10.0);
        vendorRepository.save(vendor);
        return modelMapper.map(savedUser, UserDto.class);
    }
}
