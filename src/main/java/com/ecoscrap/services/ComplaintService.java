package com.ecoscrap.services;

import com.ecoscrap.dto.ComplaintDto;
import com.ecoscrap.entities.Complaint;
import com.ecoscrap.entities.User;
import com.ecoscrap.entities.enums.ComplaintStatus;
import com.ecoscrap.exeptions.ResourceNotFoundException;
import com.ecoscrap.repositories.ComplaintRepository;
import com.ecoscrap.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public ComplaintDto registerComplaint(ComplaintDto complaintDto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Complaint complaint = modelMapper.map(complaintDto, Complaint.class);
        complaint.setVolunteerUser(user);
        complaint.setComplaintStatus(ComplaintStatus.PENDING);
        Complaint savedComplaint = complaintRepository.save(complaint);
        return modelMapper.map(savedComplaint, ComplaintDto.class);
    }

    public List<ComplaintDto> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAll();
        return complaints.stream().map(complaint -> modelMapper.map(complaint,ComplaintDto.class)).collect(Collectors.toList());
    }
}