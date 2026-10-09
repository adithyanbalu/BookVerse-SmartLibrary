package com.bookverse.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final JdbcTemplate jdbcTemplate;

    public LoanController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getAllLoans() {
        String sql = """
            SELECT bt.borrow_id, bt.student_id, s.name AS student_name,
                   bt.accession_number, b.book_id, b.title AS book_title,
                   bt.issue_date, bt.due_date, bt.return_date, bt.status,
                   CASE 
                     WHEN bt.status = 'RETURNED' THEN 0
                     WHEN CURRENT_DATE > bt.due_date THEN (CURRENT_DATE - bt.due_date)
                     ELSE 0
                   END AS days_overdue,
                   COALESCE(f.amount, 0) AS fine_amount,
                   COALESCE(f.payment_status, 'NONE') AS fine_status
            FROM borrow_transaction bt
            JOIN student s ON s.student_id = bt.student_id
            JOIN book_copy bc ON bc.accession_number = bt.accession_number
            JOIN book b ON b.book_id = bc.book_id
            LEFT JOIN fine f ON f.borrow_id = bt.borrow_id
            ORDER BY bt.borrow_id DESC
            """;
        return jdbcTemplate.queryForList(sql);
    }

    @PostMapping("/issue")
    @Transactional
    public ResponseEntity<?> issueBook(@RequestBody Map<String, Object> data) {
        try {
            int studentId = requiredInt(data, "student_id");
            
            // Verify student exists
            Integer studentExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM student WHERE student_id = ?",
                Integer.class, studentId
            );
            if (studentExists == null || studentExists == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Student ID " + studentId + " not found."));
            }

            Integer accessionNumber = null;
            if (data.containsKey("accession_number") && data.get("accession_number") != null && !data.get("accession_number").toString().isBlank()) {
                accessionNumber = Integer.parseInt(data.get("accession_number").toString());
                
                // Verify specific copy is AVAILABLE
                List<String> statuses = jdbcTemplate.query(
                    "SELECT status FROM book_copy WHERE accession_number = ?",
                    (rs, rowNum) -> rs.getString("status"),
                    accessionNumber
                );
                if (statuses.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Accession number " + accessionNumber + " does not exist."));
                }
                if (!"AVAILABLE".equalsIgnoreCase(statuses.get(0))) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Book copy " + accessionNumber + " is currently " + statuses.get(0) + "."));
                }
            } else if (data.containsKey("book_id") && data.get("book_id") != null && !data.get("book_id").toString().isBlank()) {
                int bookId = Integer.parseInt(data.get("book_id").toString());
                
                // Find first AVAILABLE copy for book
                List<Integer> availableCopies = jdbcTemplate.query(
                    "SELECT accession_number FROM book_copy WHERE book_id = ? AND status = 'AVAILABLE' ORDER BY accession_number LIMIT 1",
                    (rs, rowNum) -> rs.getInt("accession_number"),
                    bookId
                );
                if (availableCopies.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "No available copies for Book ID " + bookId + "."));
                }
                accessionNumber = availableCopies.get(0);
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Either book_id or accession_number is required."));
            }

            LocalDate issueDate = LocalDate.now();
            LocalDate dueDate = issueDate.plusDays(14);
            if (data.containsKey("due_date") && data.get("due_date") != null && !data.get("due_date").toString().isBlank()) {
                dueDate = LocalDate.parse(data.get("due_date").toString().trim());
            }

            int borrowId = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(borrow_id), 5000) + 1 FROM borrow_transaction",
                Integer.class
            );

            // Insert transaction
            jdbcTemplate.update("""
                INSERT INTO borrow_transaction (borrow_id, student_id, accession_number, issue_date, due_date, status)
                VALUES (?, ?, ?, ?, ?, 'ISSUED')
                """, borrowId, studentId, accessionNumber, java.sql.Date.valueOf(issueDate), java.sql.Date.valueOf(dueDate));

            // Update copy status
            jdbcTemplate.update("""
                UPDATE book_copy SET status = 'BORROWED' WHERE accession_number = ?
                """, accessionNumber);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Book issued successfully.",
                "borrow_id", borrowId,
                "accession_number", accessionNumber,
                "issue_date", issueDate.toString(),
                "due_date", dueDate.toString()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            org.springframework.transaction.interceptor.TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Could not issue book copy. Check database constraints."));
        }
    }

    @PostMapping("/return/{borrowId}")
    @Transactional
    public ResponseEntity<?> returnBook(@PathVariable int borrowId) {
        try {
            List<Map<String, Object>> loans = jdbcTemplate.queryForList("""
                SELECT borrow_id, student_id, accession_number, due_date, status
                FROM borrow_transaction WHERE borrow_id = ?
                """, borrowId);

            if (loans.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Borrow transaction " + borrowId + " not found."));
            }

            Map<String, Object> loan = loans.get(0);
            String status = (String) loan.get("status");
            if ("RETURNED".equalsIgnoreCase(status)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "This book transaction is already returned."));
            }

            int accessionNumber = ((Number) loan.get("accession_number")).intValue();
            java.sql.Date sqlDueDate = (java.sql.Date) loan.get("due_date");
            LocalDate dueDate = sqlDueDate.toLocalDate();
            LocalDate returnDate = LocalDate.now();

            // Calculate overdue fine
            long overdueDays = ChronoUnit.DAYS.between(dueDate, returnDate);
            double fineAmount = 0;
            boolean fineGenerated = false;

            if (overdueDays > 0) {
                fineAmount = overdueDays * 10.0; // ₹10 per overdue day rule
                
                // Check if fine record exists
                Integer fineExists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM fine WHERE borrow_id = ?",
                    Integer.class, borrowId
                );

                if (fineExists != null && fineExists > 0) {
                    jdbcTemplate.update(
                        "UPDATE fine SET amount = ? WHERE borrow_id = ?",
                        fineAmount, borrowId
                    );
                } else {
                    int fineId = jdbcTemplate.queryForObject(
                        "SELECT COALESCE(MAX(fine_id), 7000) + 1 FROM fine",
                        Integer.class
                    );
                    jdbcTemplate.update("""
                        INSERT INTO fine (fine_id, borrow_id, amount, payment_status)
                        VALUES (?, ?, ?, 'PENDING')
                        """, fineId, borrowId, fineAmount);
                }
                fineGenerated = true;
            }

            // Update borrow transaction status
            jdbcTemplate.update("""
                UPDATE borrow_transaction
                SET return_date = ?, status = 'RETURNED'
                WHERE borrow_id = ?
                """, java.sql.Date.valueOf(returnDate), borrowId);

            // Mark copy as AVAILABLE
            jdbcTemplate.update("""
                UPDATE book_copy SET status = 'AVAILABLE' WHERE accession_number = ?
                """, accessionNumber);

            String message = "Book copy returned successfully.";
            if (fineGenerated) {
                message += " An overdue fine of ₹" + String.format("%.2f", fineAmount) + " (" + overdueDays + " days overdue) has been logged.";
            }

            return ResponseEntity.ok(Map.of(
                "message", message,
                "borrow_id", borrowId,
                "accession_number", accessionNumber,
                "return_date", returnDate.toString(),
                "overdue_days", Math.max(0, overdueDays),
                "fine_amount", fineAmount
            ));

        } catch (Exception e) {
            e.printStackTrace();
            org.springframework.transaction.interceptor.TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Could not complete return operation."));
        }
    }

    private int requiredInt(Map<String, Object> data, String key) {
        Object val = data.get(key);
        if (val == null || val.toString().isBlank()) {
            throw new IllegalArgumentException(key + " is required.");
        }
        try {
            return Integer.parseInt(val.toString());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(key + " must be a valid integer.");
        }
    }
}
