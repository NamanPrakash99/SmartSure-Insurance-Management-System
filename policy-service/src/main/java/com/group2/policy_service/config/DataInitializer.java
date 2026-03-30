package com.group2.policy_service.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.group2.policy_service.entity.PolicyCategory;
import com.group2.policy_service.entity.PolicyType;
import com.group2.policy_service.repository.PolicyTypeRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(PolicyTypeRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                System.out.println("No policy types found, seeding database...");
                
                PolicyType health = new PolicyType();
                health.setCategory(PolicyCategory.HEALTH);
                health.setDescription("Covers medical expenses and health-related costs.");
                repository.save(health);
                
                PolicyType vehicle = new PolicyType();
                vehicle.setCategory(PolicyCategory.VEHICLE);
                vehicle.setDescription("Protects your motor vehicles against accidents and theft.");
                repository.save(vehicle);
                
                PolicyType life = new PolicyType();
                life.setCategory(PolicyCategory.LIFE);
                life.setDescription("Financial security for your family in case of unforeseen events.");
                repository.save(life);
                
                System.out.println("Database seeded with default policy categories.");
            }
        };
    }
}
