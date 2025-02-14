package com.ecoscrap.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor")
public class VendorController {
    @PostMapping("/ve1")
    public ResponseEntity<String> vendor() {
        return ResponseEntity.ok("vendor");
    }
}
