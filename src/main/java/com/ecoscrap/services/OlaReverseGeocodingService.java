package com.ecoscrap.services;

import lombok.Data;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;


import java.util.List;


@Service
public class OlaReverseGeocodingService {
    private static final String OLA_BASE_URL = "https://api.olamaps.io";
    @Value("${API_KEY}")
    private String API_KEY;

    public String reverseGeocoding(Point p1) {
        try {
            OLAResponseDto olaResponseDto = RestClient.builder()
                    .baseUrl(OLA_BASE_URL)
                    .build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/places/v1/reverse-geocode")
                            .queryParam("latlng", p1.getY() + "," + p1.getX())
                            .queryParam("api_key", API_KEY)
                            .build())
                    .retrieve()
                    .body(OLAResponseDto.class);

            assert olaResponseDto != null;
            return olaResponseDto.getResults().getFirst().getFormatted_address();
        } catch (Exception e) {
            throw new RuntimeException("Error in finding address, " + e.getMessage());
        }
    }
}

@Data
class OLAResponseDto{
    private List<OLAResults> results;
}

@Data
class OLAResults{
    private String formatted_address;
}