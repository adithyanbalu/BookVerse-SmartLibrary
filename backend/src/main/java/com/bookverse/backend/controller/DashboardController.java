package com.bookverse.backend.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final JdbcTemplate jdbcTemplate;

    public DashboardController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        int totalBooks = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM book", Integer.class);
        int totalCopies = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM book_copy", Integer.class);
        int availableCopies = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM book_copy WHERE status = 'AVAILABLE'", Integer.class);
        int borrowedCopies = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM book_copy WHERE status = 'BORROWED'", Integer.class);
        int registeredStudents = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student", Integer.class);
        int activeLoans = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM borrow_transaction WHERE status IN ('ISSUED', 'OVERDUE')", Integer.class);
        int pendingReservations = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM reservation WHERE status = 'PENDING'", Integer.class);
        Double outstandingFines = jdbcTemplate.queryForObject("SELECT COALESCE(SUM(amount), 0) FROM fine WHERE payment_status = 'PENDING'", Double.class);

        return Map.of(
            "total_books", totalBooks,
            "total_copies", totalCopies,
            "available_copies", availableCopies,
            "borrowed_copies", borrowedCopies,
            "registered_students", registeredStudents,
            "active_loans", activeLoans,
            "pending_reservations", pendingReservations,
            "outstanding_fines", Math.round(outstandingFines * 100.0) / 100.0
        );
    }
}
