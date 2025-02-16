package com.ecoscrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EcoscrapApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcoscrapApplication.class, args);
	}

}
