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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public UserDto signUp(SignUpKwDto signUpKwDto) {
        Optional<User> user = userRepository.findByUsername(signUpKwDto.getUsername());
        if(user.isPresent()) {
            throw new BadCredentialsException("User with username already exits "+ signUpKwDto.getUsername()+" with role other than kabadiwala");
        }
        User newUser = modelMapper.map(signUpKwDto, User.class);
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
