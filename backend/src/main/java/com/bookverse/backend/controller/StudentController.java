package com.bookverse.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final JdbcTemplate jdbcTemplate;

    public StudentController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getAllStudents() {
        String sql = """
            SELECT s.student_id, s.name, s.email, s.phone, s.department,
                   (SELECT COUNT(*) FROM borrow_transaction bt
                    WHERE bt.student_id = s.student_id
                      AND bt.status IN ('ISSUED', 'OVERDUE')) AS active_loans,
                   COALESCE((SELECT SUM(f.amount)
                             FROM fine f
                             JOIN borrow_transaction bt ON bt.borrow_id = f.borrow_id
                             WHERE bt.student_id = s.student_id
                               AND f.payment_status = 'PENDING'), 0) AS total_fines
            FROM student s
            ORDER BY s.student_id
            """;
        return jdbcTemplate.queryForList(sql);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable int id) {
        String sql = """
            SELECT s.student_id, s.name, s.email, s.phone, s.department,
                   (SELECT COUNT(*) FROM borrow_transaction bt
                    WHERE bt.student_id = s.student_id
                      AND bt.status IN ('ISSUED', 'OVERDUE')) AS active_loans,
                   COALESCE((SELECT SUM(f.amount)
                             FROM fine f
                             JOIN borrow_transaction bt ON bt.borrow_id = f.borrow_id
                             WHERE bt.student_id = s.student_id
                               AND f.payment_status = 'PENDING'), 0) AS total_fines
            FROM student s
            WHERE s.student_id = ?
            """;
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, id);
        if (list.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Student not found."));
        }
        return ResponseEntity.ok(list.get(0));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> addStudent(@RequestBody Map<String, Object> data) {
        try {
            String name = requiredText(data, "name");
            String email = requiredText(data, "email");
            String phone = optionalText(data, "phone");
            String department = optionalText(data, "department");

            int studentId;
            Object idVal = data.get("student_id");
            if (idVal != null && !idVal.toString().isBlank()) {
                studentId = Integer.parseInt(idVal.toString());
            } else {
                studentId = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(MAX(student_id), 25000) + 1 FROM student",
                    Integer.class
                );
            }

            Integer exists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM student WHERE student_id = ?",
                Integer.class, studentId
            );
            if (exists != null && exists > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Student ID already exists."));
            }

            jdbcTemplate.update("""
                INSERT INTO student (student_id, name, email, phone, department)
                VALUES (?, ?, ?, ?, ?)
                """, studentId, name, email, phone, department);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Student created successfully.",
                "student_id", studentId
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Could not create student. Check input fields and constraints."));
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateStudent(@PathVariable int id, @RequestBody Map<String, Object> data) {
        try {
            String name = requiredText(data, "name");
            String email = requiredText(data, "email");
            String phone = optionalText(data, "phone");
            String department = optionalText(data, "department");

            Integer exists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM student WHERE student_id = ?",
                Integer.class, id
            );
            if (exists == null || exists == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Student not found."));
            }

            jdbcTemplate.update("""
                UPDATE student
                SET name = ?, email = ?, phone = ?, department = ?
                WHERE student_id = ?
                """, name, email, phone, department, id);

            return ResponseEntity.ok(Map.of("message", "Student updated successfully.", "student_id", id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Could not update student."));
        }
    }
    
    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerStudent(
            @RequestBody Map<String, Object> data) {
        try {
            String name = requiredText(data, "name");
            String email = requiredText(data, "email");
            String password = requiredText(data, "password");
            String phone = optionalText(data, "phone");
            String department = optionalText(data, "department");

            if (password.length() < 8) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Password must be at least 8 characters.")
                );
            }

            Integer emailExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM student WHERE LOWER(email) = LOWER(?)",
                Integer.class, email
            );

            if (emailExists != null && emailExists > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("error", "This email is already registered.")
                );
            }

            Integer nextId = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(student_id), 25000) + 1 FROM student",
                Integer.class
            );

            int studentId = nextId;

            jdbcTemplate.update("""
                INSERT INTO student
                    (student_id, name, email, phone, department)
                VALUES (?, ?, ?, ?, ?)
                """, studentId, name, email, phone, department);

            String passwordHash =
                new BCryptPasswordEncoder().encode(password);

            jdbcTemplate.update("""
                INSERT INTO student_credentials
                    (student_id, password_hash)
                VALUES (?, ?)
                """, studentId, passwordHash);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "message", "Registration successful. You can now log in.",
                    "student_id", studentId
                )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Registration failed. Please try again.")
            );
        }
    }

    private String requiredText(Map<String, Object> data, String key) {
        Object val = data.get(key);
        if (val == null || val.toString().isBlank()) {
            throw new IllegalArgumentException(key + " is required.");
        }
        return val.toString().trim();
    }

    private String optionalText(Map<String, Object> data, String key) {
        Object val = data.get(key);
        return (val == null || val.toString().isBlank()) ? null : val.toString().trim();
    }
}
