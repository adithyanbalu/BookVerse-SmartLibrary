package com.bookverse.backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class WorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/students should return list of students")
    void testGetStudents() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].student_id", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/students should register a new student")
    void testAddStudent() throws Exception {
        String json = """
            {
                "student_id": 25099,
                "name": "Test Student",
                "email": "teststudent@example.com",
                "phone": "9998887770",
                "department": "Computer Science"
            }
            """;

        mockMvc.perform(post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", containsString("created successfully")));
    }

    @Test
    @DisplayName("POST /api/loans/issue should issue an available book copy to student")
    void testIssueBookSuccess() throws Exception {
        String json = """
            {
                "student_id": 25014,
                "book_id": 102
            }
            """;

        mockMvc.perform(post("/api/loans/issue")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", containsString("issued successfully")));
    }

    @Test
    @DisplayName("POST /api/loans/return/{borrowId} should mark loan returned and update copy status")
    void testReturnBookSuccess() throws Exception {
        // Return existing loan 5001
        mockMvc.perform(post("/api/loans/return/5001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("returned successfully")));
    }

    @Test
    @DisplayName("GET /api/dashboard/stats should return dynamic counts from PostgreSQL")
    void testGetDashboardStats() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total_books", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.registered_students", greaterThanOrEqualTo(1)));
    }
}
