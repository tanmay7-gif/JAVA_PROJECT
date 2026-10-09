package com.fitpulse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan
public class FitPulseApplication {

    public static void main(String[] args) {
        SpringApplication.run(FitPulseApplication.class, args);
    }
}
