package com.bookverse.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/fines")
public class FineController {

    private final JdbcTemplate jdbcTemplate;

    public FineController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getAllFines() {
        String sql = """
            SELECT f.fine_id, f.borrow_id, f.amount, f.payment_status,
                   s.student_id, s.name AS student_name,
                   b.title AS book_title,
                   (CURRENT_DATE - bt.due_date) AS overdue_days
            FROM fine f
            JOIN borrow_transaction bt ON bt.borrow_id = f.borrow_id
            JOIN student s ON s.student_id = bt.student_id
            JOIN book_copy bc ON bc.accession_number = bt.accession_number
            JOIN book b ON b.book_id = bc.book_id
            ORDER BY f.fine_id DESC
            """;
        return jdbcTemplate.queryForList(sql);
    }

    @PutMapping("/{id}/pay")
    @Transactional
    public ResponseEntity<?> payFine(@PathVariable int id) {
        try {
            Integer exists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM fine WHERE fine_id = ?",
                Integer.class, id
            );
            if (exists == null || exists == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Fine ID " + id + " not found."));
            }

            jdbcTemplate.update(
                "UPDATE fine SET payment_status = 'PAID' WHERE fine_id = ?",
                id
            );

            return ResponseEntity.ok(Map.of(
                "message", "Fine marked as PAID successfully.",
                "fine_id", id,
                "payment_status", "PAID"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Could not process fine payment."));
        }
    }
}
