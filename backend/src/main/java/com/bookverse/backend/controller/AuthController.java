
package com.bookverse.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/student-login")
    public ResponseEntity<?> studentLogin(
            @RequestBody Map<String, String> data) {

        String studentId = data.get("student_id");
        String password = data.get("password");

        if (studentId == null || studentId.isBlank()
                || password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Student ID and password are required."));
        }

        try {
            var accounts = jdbcTemplate.queryForList("""
                SELECT sc.student_id, sc.password_hash, s.name
                FROM student_credentials sc
                JOIN student s ON s.student_id = sc.student_id
                WHERE sc.student_id = ?
                """, Integer.parseInt(studentId));

            if (accounts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid student ID or password."));
            }

            Map<String, Object> account = accounts.get(0);
            String storedHash = (String) account.get("password_hash");

            if (!passwordEncoder.matches(password, storedHash)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid student ID or password."));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful.",
                    "student_id", account.get("student_id"),
                    "name", account.get("name"),
                    "role", "student"
            ));

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Student ID must be numeric."));
        }
    }
    
    @PostMapping("/student-set-password")
    public ResponseEntity<?> setStudentPassword(
            @RequestBody Map<String, String> data) {

        String studentId = data.get("student_id");
        String email = data.get("email");
        String password = data.get("password");

        if (studentId == null || studentId.isBlank()
                || email == null || email.isBlank()
                || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "Student ID, registered email, and password are required.")
            );
        }

        if (password.length() < 8) {
            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "Password must be at least 8 characters.")
            );
        }

        try {
            int id = Integer.parseInt(studentId.trim());

            var students = jdbcTemplate.queryForList("""
                SELECT s.student_id
                FROM student s
                LEFT JOIN student_credentials sc
                    ON s.student_id = sc.student_id
                WHERE s.student_id = ?
                  AND LOWER(TRIM(s.email)) = LOWER(TRIM(?))
                  AND sc.student_id IS NULL
                """, id, email.trim());

            if (students.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                        Map.of("error",
                                "Student details do not match, or a password is already set.")
                );
            }

            String passwordHash = passwordEncoder.encode(password);

            jdbcTemplate.update("""
                INSERT INTO student_credentials
                    (student_id, password_hash)
                VALUES (?, ?)
                """, id, passwordHash);

            return ResponseEntity.ok(Map.of(
                    "message", "Password created successfully. You can now log in.",
                    "student_id", id
            ));

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Student ID must be numeric.")
            );
        }
    }
    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(
            @RequestBody Map<String, String> data) {

        String adminId = data.get("admin_id");
        String password = data.get("password");

        if (adminId == null || adminId.isBlank()
                || password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Admin ID and password are required."));
        }

        var accounts = jdbcTemplate.queryForList("""
            SELECT admin_id, password_hash
            FROM admin_credentials
            WHERE admin_id = ?
            """, adminId.trim());

        if (accounts.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid admin ID or password."));
        }

        String storedHash = (String) accounts.get(0).get("password_hash");

        if (!passwordEncoder.matches(password, storedHash)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid admin ID or password."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Admin login successful.",
                "admin_id", adminId.trim(),
                "role", "admin"
        ));
    }
}