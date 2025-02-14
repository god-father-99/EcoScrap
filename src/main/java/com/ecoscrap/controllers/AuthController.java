package com.ecoscrap.controllers;


import com.ecoscrap.annotations.ValidPhoneNumber;
import com.ecoscrap.dto.*;
import com.ecoscrap.services.AuthService;
import com.ecoscrap.services.KabadiwalaService;
import com.ecoscrap.services.UserService;
import com.ecoscrap.services.VendorService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin("http://10.160.33.181:3001/signin")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
    private final KabadiwalaService kabadiwalaService;
    private final VendorService vendorService;

    @Value("${deploy.env}")
    private String deployEnv;

    @PostMapping("/signup")
    public ResponseEntity<UserDto> signUp(/*@ValidPhoneNumber*/ @RequestBody SignUpDto signUpDto) {
        UserDto userDto = userService.signUp(signUpDto);
        log.info("Sign up result: {}", userDto);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/signupScrapCollector")
    public ResponseEntity<UserDto> signUp(/*@ValidPhoneNumber*/ @RequestBody SignUpKwDto signUpKwDto) {
        UserDto userDto = kabadiwalaService.signUp(signUpKwDto);
        log.info("Sign up result: {}", userDto);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/signupVendor")
    public ResponseEntity<UserDto> signUpVendor(/*@ValidPhoneNumber*/ @RequestBody SignUpKwDto signUpKwDto) {
        //TODO :  change with vendorService
        UserDto userDto = vendorService.signUp(signUpKwDto);
        log.info("Sign up result: {}", userDto);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginDto loginDto, HttpServletRequest request,
                                                  HttpServletResponse response) {
        LoginResponseDto loginResponseDto = authService.login(loginDto);

        Cookie cookie = new Cookie("refreshToken", loginResponseDto.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setSecure("production".equals(deployEnv));
        response.addCookie(cookie);

        return ResponseEntity.ok(loginResponseDto);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(HttpServletRequest request) {
        String refreshToken = Arrays.stream(request.getCookies()).
                filter(cookie -> "refreshToken".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new AuthenticationServiceException("Refresh token not found inside the Cookies"));
        LoginResponseDto loginResponseDto = authService.refreshToken(refreshToken);

        return ResponseEntity.ok(loginResponseDto);
    }
}
