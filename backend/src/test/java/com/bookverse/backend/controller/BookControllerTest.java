package com.bookverse.backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("GET /api/books should return list of books from PostgreSQL")
    void testGetAllBooks() throws Exception {
        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].book_id", notNullValue()))
                .andExpect(jsonPath("$[0].title", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/books/{id} should return existing book details")
    void testGetBookById() throws Exception {
        mockMvc.perform(get("/api/books/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.book_id", is(101)))
                .andExpect(jsonPath("$.title", is("Database System Concepts")));
    }

    @Test
    @DisplayName("GET /api/books/{id} with invalid ID should return 404")
    void testGetBookByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/books/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", is("Book not found.")));
    }

    @Test
    @DisplayName("POST /api/books should create a new book with author and copies")
    void testAddBookSuccess() throws Exception {
        String json = """
            {
                "title": "UnitTest Clean Architecture",
                "author_name": "Uncle Bob Test",
                "isbn": "978-9999888877",
                "category_id": 1,
                "publisher_id": 1,
                "copies": 2
            }
            """;

        mockMvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", containsString("added successfully")))
                .andExpect(jsonPath("$.book_id", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/books with duplicate ISBN should return 409 Conflict")
    void testAddBookDuplicateIsbn() throws Exception {
        String json = """
            {
                "title": "Duplicate ISBN Book",
                "author_name": "Test Author",
                "isbn": "9780073523323",
                "category_id": 1,
                "publisher_id": 1,
                "copies": 1
            }
            """;

        mockMvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("ISBN already exists.")));
    }

    @Test
    @DisplayName("DELETE /api/books/{id} on eligible book should delete book and dependent copies/authors")
    void testDeleteEligibleBook() throws Exception {
        // Create an eligible disposable test book
        int testBookId = 9999;
        int testAuthorId = 9999;
        int testAccession = 99999;

        jdbcTemplate.update("INSERT INTO book (book_id, title, isbn, publication_year, category_id, publisher_id) VALUES (?, 'Disposable Book', 'DISP-9999', 2026, 1, 1)", testBookId);
        jdbcTemplate.update("INSERT INTO author (author_id, author_name) VALUES (?, 'Disposable Author')", testAuthorId);
        jdbcTemplate.update("INSERT INTO book_author (book_id, author_id) VALUES (?, ?)", testBookId, testAuthorId);
        jdbcTemplate.update("INSERT INTO book_copy (accession_number, book_id, status) VALUES (?, ?, 'AVAILABLE')", testAccession, testBookId);

        // Perform delete request
        mockMvc.perform(delete("/api/books/" + testBookId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Book deleted successfully.")))
                .andExpect(jsonPath("$.book_id", is(testBookId)));

        // Verify database row removal
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM book WHERE book_id = ?", Integer.class, testBookId);
        assertEquals(0, count);

        Integer countCopy = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM book_copy WHERE book_id = ?", Integer.class, testBookId);
        assertEquals(0, countCopy);
    }

    @Test
    @DisplayName("DELETE /api/books/{id} on non-existent book should return 404 Not Found")
    void testDeleteNonExistentBook() throws Exception {
        mockMvc.perform(delete("/api/books/888888"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", is("Book not found.")));
    }

    @Test
    @DisplayName("DELETE /api/books/{id} on book with borrowing history should return 409 Conflict")
    void testDeleteBookWithBorrowingHistory() throws Exception {
        // Book 101 has borrow transaction 5001
        mockMvc.perform(delete("/api/books/101"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("borrowing history")));
    }

    @Test
    @DisplayName("DELETE /api/books/{id} on book with reservations should return 409 Conflict")
    void testDeleteBookWithReservation() throws Exception {
        // Book 103 has reservation 6002
        mockMvc.perform(delete("/api/books/103"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("reservations reference it")));
    }
}
