package com.ecoscrap.annotations;

import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.lookups.v2.PhoneNumber;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component; // Important: Add @Component

@Slf4j
@Component // Make it a Spring-managed bean
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    @Value("${TWILIO_ACCOUNT_SID}")
    private String twilioAccountSid;

    @Value("${TWILIO_AUTH_TOKEN}")
    private String twilioAuthToken;

    private boolean twilioInitialized = false; // Flag to track initialization

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        log.debug("Entering isValid() with value: {}", value); // Log the input value

        if (value == null || value.isEmpty()) {
            log.debug("Value is null or empty. Returning true.");
            return true; // Or false, depending on your requirements
        }

        String formattedValue = value.replaceAll("[\\s()-]", "");
        log.debug("Formatted value: {}", formattedValue);

        try {
            log.debug("Fetching phone number details for: {}", formattedValue);
            PhoneNumber phoneNumber = PhoneNumber.fetcher(formattedValue).fetch();
            log.debug("Twilio fetcher returned: {}", phoneNumber); // Log the fetched object
            return true; // If fetcher does not throw exception then the phone number is valid
        } catch (ApiException e) {
            log.error("Twilio API Error: Status Code: {}, Message: {}", e.getStatusCode(), e.getMessage(), e); // Log the full exception details
            if (e.getStatusCode() == 404) {
                log.debug("Phone number not found (404). Returning false.");
                return false;
            }
            log.debug("Other Twilio API Error. Returning false.");
            return false;
        } catch (IllegalArgumentException e) {
            log.error("IllegalArgumentException: {}", e.getMessage(), e);
            return false;
        } catch (Exception e) { // Catch any other unexpected exceptions
            log.error("Unexpected Exception: {}", e.getMessage(), e);
            return false;
        }
    }
}