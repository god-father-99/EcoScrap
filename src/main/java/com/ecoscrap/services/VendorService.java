package com.ecoscrap.services;


import com.ecoscrap.dto.SignUpKwDto;
import com.ecoscrap.dto.UserDto;
import com.ecoscrap.entities.User;
import com.ecoscrap.entities.Vendor;
import com.ecoscrap.entities.enums.Role;
import com.ecoscrap.repositories.UserRepository;
import com.ecoscrap.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class VendorService {
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDto signUp(SignUpKwDto signUpKwDto) {
        Optional<User> user = userRepository.findByUsername(signUpKwDto.getUsername());
        if(user.isPresent()) {
            throw new BadCredentialsException("User with username already exits "+ signUpKwDto.getUsername()+" with role other than vendor");
        }
        User newUser = modelMapper.map(signUpKwDto, User.class);
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
