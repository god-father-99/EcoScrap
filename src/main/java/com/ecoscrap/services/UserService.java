package com.ecoscrap.services;


import com.ecoscrap.dto.SignUpDto;
import com.ecoscrap.dto.UserDto;
import com.ecoscrap.entities.Customer;
import com.ecoscrap.entities.Kabadiwala;
import com.ecoscrap.entities.User;
import com.ecoscrap.entities.enums.Role;
import com.ecoscrap.exeptions.ResourceNotFoundException;
import com.ecoscrap.repositories.CustomerRepository;
import com.ecoscrap.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.SnsException;
import software.amazon.awssdk.services.sns.model.SubscribeRequest;
import software.amazon.awssdk.services.sns.model.SubscribeResponse;

import java.util.Optional;
import java.util.Random;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepository;
    private final SnsClient snsClient;

    @Value("${TOPIC_ARN_CUSTOMER}")
    private String topicArn;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username).orElseThrow(() -> new BadCredentialsException("User with username "+ username +" not found"));
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User with id "+ userId +
                " not found"));
    }

    public User getUsrByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }


    public UserDto signUp(SignUpDto signUpDto) {
        Optional<User> user = userRepository.findByUsername(signUpDto.getUsername());
        if(user.isPresent()) {
            throw new BadCredentialsException("User with username already exits "+ signUpDto.getUsername());
        }

        User toBeCreatedUser = modelMapper.map(signUpDto, User.class);
        try{
            SubscribeRequest subscribeRequest=SubscribeRequest.builder().
                    protocol("email").
                    endpoint(signUpDto.getUsername()).
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
        toBeCreatedUser.setPassword(passwordEncoder.encode(toBeCreatedUser.getPassword()));
        toBeCreatedUser.setRoles(Set.of(Role.CUSTOMER));


        User savedUser = userRepository.save(toBeCreatedUser);
        Customer customer=new Customer();
        customer.setUser(savedUser);
        customer.setRating( Math.round((4.0 + new Random().nextDouble()) * 10.0) / 10.0);
        customerRepository.save(customer);
        return modelMapper.map(savedUser, UserDto.class);
    }

    public User save(User newUser) {
        return userRepository.save(newUser);
    }
}

