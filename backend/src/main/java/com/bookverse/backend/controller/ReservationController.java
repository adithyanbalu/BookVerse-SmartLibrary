package com.bookverse.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final JdbcTemplate jdbcTemplate;

    public ReservationController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getAllReservations() {
        String sql = """
            SELECT r.reservation_id, r.student_id, s.name AS student_name,
                   r.book_id, b.title AS book_title,
                   r.reservation_date, r.status
            FROM reservation r
            JOIN student s ON s.student_id = r.student_id
            JOIN book b ON b.book_id = r.book_id
            ORDER BY r.reservation_id DESC
            """;
        return jdbcTemplate.queryForList(sql);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createReservation(@RequestBody Map<String, Object> data) {
        try {
            int studentId = requiredInt(data, "student_id");
            int bookId = requiredInt(data, "book_id");

            Integer studentExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM student WHERE student_id = ?",
                Integer.class, studentId
            );
            if (studentExists == null || studentExists == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Student ID " + studentId + " not found."));
            }

            Integer bookExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM book WHERE book_id = ?",
                Integer.class, bookId
            );
            if (bookExists == null || bookExists == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Book ID " + bookId + " not found."));
            }

            // Check duplicate active reservation
            Integer activeReservation = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM reservation WHERE student_id = ? AND book_id = ? AND status IN ('PENDING', 'APPROVED')",
                Integer.class, studentId, bookId
            );
            if (activeReservation != null && activeReservation > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Student already has an active reservation for this book."));
            }

            int reservationId = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(reservation_id), 6000) + 1 FROM reservation",
                Integer.class
            );

            LocalDate today = LocalDate.now();

            jdbcTemplate.update("""
                INSERT INTO reservation (reservation_id, student_id, book_id, reservation_date, status)
                VALUES (?, ?, ?, ?, 'PENDING')
                """, reservationId, studentId, bookId, java.sql.Date.valueOf(today));

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Reservation created successfully.",
                "reservation_id", reservationId,
                "student_id", studentId,
                "book_id", bookId,
                "status", "PENDING"
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            org.springframework.transaction.interceptor.TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Could not create reservation. Check database constraints."));
        }
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> updateReservationStatus(@PathVariable int id, @RequestBody Map<String, Object> data) {
        try {
            String newStatus = requiredText(data, "status").toUpperCase();
            if (!List.of("PENDING", "APPROVED", "REJECTED", "COMPLETED").contains(newStatus)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Status must be PENDING, APPROVED, REJECTED, or COMPLETED."));
            }

            Integer exists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM reservation WHERE reservation_id = ?",
                Integer.class, id
            );
            if (exists == null || exists == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Reservation " + id + " not found."));
            }

            jdbcTemplate.update(
                "UPDATE reservation SET status = ? WHERE reservation_id = ?",
                newStatus, id
            );

            return ResponseEntity.ok(Map.of(
                "message", "Reservation status updated to " + newStatus,
                "reservation_id", id,
                "status", newStatus
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Could not update reservation status."));
        }
    }

    private int requiredInt(Map<String, Object> data, String key) {
        Object val = data.get(key);
        if (val == null || val.toString().isBlank()) {
            throw new IllegalArgumentException(key + " is required.");
        }
        return Integer.parseInt(val.toString());
    }

    private String requiredText(Map<String, Object> data, String key) {
        Object val = data.get(key);
        if (val == null || val.toString().isBlank()) {
            throw new IllegalArgumentException(key + " is required.");
        }
        return val.toString().trim();
    }
}
