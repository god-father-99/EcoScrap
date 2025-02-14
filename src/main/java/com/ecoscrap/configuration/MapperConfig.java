package com.ecoscrap.configuration;

import com.ecoscrap.dto.PointDto;
import com.ecoscrap.dto.ScrapListingDto;
import com.ecoscrap.entities.ScrapListing;
import com.ecoscrap.entities.ScrapPickupRequest;
import com.ecoscrap.utils.GeometryUtil;
import org.locationtech.jts.geom.Point;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {
    @Bean
    public ModelMapper modelMapper(){
        ModelMapper mapper= new ModelMapper();

        mapper.typeMap(PointDto.class, Point.class).setConverter(context->{
            PointDto pointDto= context.getSource();
            return GeometryUtil.createPoint(pointDto);
        });

        mapper.typeMap(Point.class,PointDto.class).setConverter(context->{
            Point point= context.getSource();
            double [] coordinates={
                    point.getX(),
                    point.getY()
            };
            return new PointDto(coordinates);
        });

        mapper.typeMap(ScrapPickupRequest.class, ScrapListing.class)
                .addMappings(mapper1 -> mapper1.skip(ScrapListing::setId));  // Skip setting ID


        return mapper;
    }
}

