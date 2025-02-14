package com.ecoscrap.controllers;


import com.ecoscrap.dto.ComplaintDto;
import com.ecoscrap.services.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/complaint")
@RequiredArgsConstructor
@RestController
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping("/register")
    public ResponseEntity<ComplaintDto> registerComplaint(@RequestBody ComplaintDto complaintDto) {
        return ResponseEntity.ok(complaintService.registerComplaint(complaintDto));
    }
}
