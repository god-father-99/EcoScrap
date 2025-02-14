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
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScrapPickupRequestService {
    private final ScrapPickupRequestRepository scrapPickupRequestRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;
    private final KabadiwalaRepository kabadiwalaRepository;

    @Value("${TWILIO_ACCOUNT_SID}")
    private String ACCOUNT_SID;

    @Value("${TWILIO_AUTH_TOKEN}")
    private String AUTH_TOKEN;

    public ScrapPickupRequestDto requestScrapPickup(ScrapPickupRequestDto scrapPickupRequestDto) {
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        User user=userRepository.findByUsername(username).orElseThrow(()->new ResourceNotFoundException("user not  found"));
        Customer customer=customerRepository.findByUser_Id(user.getId()).orElseThrow(()->new ResourceNotFoundException("customer not found"));
        ScrapPickupRequest scrapPickupRequest=modelMapper.map(scrapPickupRequestDto, ScrapPickupRequest.class);
        scrapPickupRequest.setSeller(customer);
        scrapPickupRequest.setScrapPickupRequestStatus(ScrapPickupRequestStatus.PENDING);
        scrapPickupRequestRepository.save(scrapPickupRequest);

        //TODO : send notification to all kabadiwalas
        List<Kabadiwala> kabadiwalaList=kabadiwalaRepository.findTenNearestKabadiwala(scrapPickupRequest.getPickupLocation());
        return modelMapper.map(scrapPickupRequest, ScrapPickupRequestDto.class);
    }
}
