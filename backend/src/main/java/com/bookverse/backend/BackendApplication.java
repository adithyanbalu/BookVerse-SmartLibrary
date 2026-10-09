
package com.bookverse.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner testDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM book",
                Integer.class
            );

            System.out.println("==============================");
            System.out.println("BOOKVERSE DATABASE CONNECTED!");
            System.out.println("Total books: " + count);
            System.out.println("==============================");
        };
    }
}