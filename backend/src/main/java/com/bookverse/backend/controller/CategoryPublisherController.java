package com.bookverse.backend.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class CategoryPublisherController {

    private final JdbcTemplate jdbcTemplate;

    public CategoryPublisherController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> getCategories() {
        return jdbcTemplate.queryForList("SELECT category_id, category_name FROM category ORDER BY category_id");
    }

    @GetMapping("/publishers")
    public List<Map<String, Object>> getPublishers() {
        return jdbcTemplate.queryForList("SELECT publisher_id, publisher_name FROM publisher ORDER BY publisher_id");
    }
}
