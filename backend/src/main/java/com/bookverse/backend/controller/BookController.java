
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
@RequestMapping("/api/books")
public class BookController {

    private final JdbcTemplate jdbcTemplate;

    public BookController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getAllBooks() {
        String sql = """
            SELECT b.book_id, b.title, b.isbn, b.publication_year,
                   b.category_id, b.publisher_id,
                   c.category_name, p.publisher_name,
                   (SELECT STRING_AGG(a.author_name, ', ')
                    FROM book_author ba
                    JOIN author a ON a.author_id = ba.author_id
                    WHERE ba.book_id = b.book_id) AS author_name,
                   (SELECT COUNT(*) FROM book_copy bc
                    WHERE bc.book_id = b.book_id) AS total_copies,
                   (SELECT COUNT(*) FROM book_copy bc
                    WHERE bc.book_id = b.book_id
                      AND bc.status = 'AVAILABLE') AS available_copies
            FROM book b
            LEFT JOIN category c ON c.category_id = b.category_id
            LEFT JOIN publisher p ON p.publisher_id = b.publisher_id
            ORDER BY b.book_id
            """;
        return jdbcTemplate.queryForList(sql);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable int id) {
        String sql = """
            SELECT b.book_id, b.title, b.isbn, b.publication_year,
                   b.category_id, b.publisher_id,
                   c.category_name, p.publisher_name,
                   (SELECT STRING_AGG(a.author_name, ', ')
                    FROM book_author ba
                    JOIN author a ON a.author_id = ba.author_id
                    WHERE ba.book_id = b.book_id) AS author_name,
                   (SELECT COUNT(*) FROM book_copy bc
                    WHERE bc.book_id = b.book_id) AS total_copies,
                   (SELECT COUNT(*) FROM book_copy bc
                    WHERE bc.book_id = b.book_id
                      AND bc.status = 'AVAILABLE') AS available_copies
            FROM book b
            LEFT JOIN category c ON c.category_id = b.category_id
            LEFT JOIN publisher p ON p.publisher_id = b.publisher_id
            WHERE b.book_id = ?
            """;
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, id);
        if (list.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Book not found."));
        }
        return ResponseEntity.ok(list.get(0));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> addBook(@RequestBody Map<String, Object> data) {
        try {
            String title = requiredText(data, "title");
            String authorName = requiredText(data, "author_name");
            String isbn = requiredText(data, "isbn");

            int bookId;
            Object idVal = data.get("book_id");
            if (idVal != null && !idVal.toString().isBlank()) {
                bookId = Integer.parseInt(idVal.toString());
            } else {
                bookId = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(MAX(book_id), 100) + 1 FROM book",
                    Integer.class
                );
            }

            int categoryId = requiredInt(data, "category_id");
            
            int publisherId = 1;
            Object pubVal = data.get("publisher_id");
            if (pubVal != null && !pubVal.toString().isBlank()) {
                publisherId = Integer.parseInt(pubVal.toString());
            }

            int copies = requiredInt(data, "copies");

            Integer year = null;
            Object yearValue = data.get("publication_year");
            if (yearValue != null && !yearValue.toString().isBlank()) {
                year = Integer.valueOf(yearValue.toString());
            }

            if (copies < 1) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "At least one copy is required."));
            }

            if (jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM book WHERE book_id = ?",
                    Integer.class, bookId) > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Book ID already exists."));
            }

            if (jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM book WHERE isbn = ?",
                    Integer.class, isbn) > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "ISBN already exists."));
            }

            // Insert the book. A null publication year is allowed.
            jdbcTemplate.update("""
                INSERT INTO book
                    (book_id, title, isbn, publication_year,
                     category_id, publisher_id)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                bookId, title, isbn, year, categoryId, publisherId
            );

            // Reuse an author if the name already exists (case-insensitive).
            List<Integer> authorIds = jdbcTemplate.query(
                """
                SELECT author_id FROM author
                WHERE LOWER(TRIM(author_name)) = LOWER(TRIM(?))
                ORDER BY author_id
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getInt("author_id"),
                authorName
            );

            int authorId;
            if (authorIds.isEmpty()) {
                authorId = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(MAX(author_id), 0) + 1 FROM author",
                    Integer.class
                );

                jdbcTemplate.update(
                    "INSERT INTO author (author_id, author_name) VALUES (?, ?)",
                    authorId, authorName
                );
            } else {
                authorId = authorIds.get(0);
            }

            // Link the book to its author.
            jdbcTemplate.update("""
                INSERT INTO book_author (book_id, author_id)
                VALUES (?, ?)
                """, bookId, authorId);

            // Use the supplied numeric accession number for the first copy
            // when provided; generate subsequent numbers from the current max.
            int nextAccession = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(accession_number), 1000) + 1 FROM book_copy",
                Integer.class
            );

            Object accessionValue = data.get("accession_number");
            if (accessionValue != null
                    && !accessionValue.toString().isBlank()) {
                int requestedAccession =
                    Integer.parseInt(accessionValue.toString());

                Integer exists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM book_copy WHERE accession_number = ?",
                    Integer.class, requestedAccession
                );

                if (exists != null && exists > 0) {
                    throw new IllegalArgumentException(
                        "Accession number already exists."
                    );
                }
                nextAccession = requestedAccession;
            }

            for (int i = 0; i < copies; i++) {
                int accessionNumber = nextAccession + i;

                Integer exists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM book_copy WHERE accession_number = ?",
                    Integer.class, accessionNumber
                );

                if (exists != null && exists > 0) {
                    throw new IllegalArgumentException(
                        "Accession number " + accessionNumber
                            + " already exists. Choose another starting number."
                    );
                }

                jdbcTemplate.update("""
                    INSERT INTO book_copy (accession_number, book_id, status)
                    VALUES (?, ?, 'AVAILABLE')
                    """, accessionNumber, bookId);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Book, author, and copies added successfully.",
                "book_id", bookId,
                "author_id", authorId,
                "copies_created", copies
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Log the actual cause in the backend terminal for debugging.
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Could not add book. Check IDs, ISBN, accession numbers, and database constraints."
            ));
        }
    }

    
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateBook(
            @PathVariable int id,
            @RequestBody Map<String, Object> data) {

        try {
            String title = requiredText(data, "title");
            String authorName = requiredText(data, "author_name");
            String isbn = requiredText(data, "isbn");

            int categoryId = requiredInt(data, "category_id");
            
            int publisherId = 1;
            Object pubVal = data.get("publisher_id");
            if (pubVal != null && !pubVal.toString().isBlank()) {
                publisherId = Integer.parseInt(pubVal.toString());
            } else {
                Integer currentPub = jdbcTemplate.queryForObject("SELECT publisher_id FROM book WHERE book_id = ?", Integer.class, id);
                if (currentPub != null) publisherId = currentPub;
            }

            Integer year = null;
            Object yearValue = data.get("publication_year");

            if (yearValue != null && !yearValue.toString().isBlank()) {
                year = Integer.valueOf(yearValue.toString());
            }

            Integer bookExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM book WHERE book_id = ?",
                Integer.class, id
            );

            if (bookExists == null || bookExists == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Book not found."));
            }

            Integer duplicateIsbn = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM book WHERE isbn = ? AND book_id <> ?",
                Integer.class, isbn, id
            );

            if (duplicateIsbn != null && duplicateIsbn > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Another book already uses this ISBN."));
            }

            jdbcTemplate.update("""
                UPDATE book
                SET title = ?,
                    isbn = ?,
                    publication_year = ?,
                    category_id = ?,
                    publisher_id = ?
                WHERE book_id = ?
                """,
                title, isbn, year, categoryId, publisherId, id
            );

            // Find an existing author without creating a duplicate.
            List<Integer> authorIds = jdbcTemplate.query(
                """
                SELECT author_id
                FROM author
                WHERE LOWER(TRIM(author_name)) = LOWER(TRIM(?))
                ORDER BY author_id
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getInt("author_id"),
                authorName
            );

            int authorId;

            if (authorIds.isEmpty()) {
                authorId = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(MAX(author_id), 0) + 1 FROM author",
                    Integer.class
                );

                jdbcTemplate.update(
                    "INSERT INTO author (author_id, author_name) VALUES (?, ?)",
                    authorId, authorName
                );
            } else {
                authorId = authorIds.get(0);
            }

            // The current edit form supports one author per book.
            // Replace the book's author links without touching physical copies.
            jdbcTemplate.update(
                "DELETE FROM book_author WHERE book_id = ?", id
            );

            jdbcTemplate.update("""
                INSERT INTO book_author (book_id, author_id)
                VALUES (?, ?)
                """, id, authorId);

            return ResponseEntity.ok(Map.of(
                "message", "Book and author updated successfully.",
                "book_id", id,
                "author_id", authorId
            ));

        } catch (Exception e) {
            e.printStackTrace();

            // Ensure partial changes are not committed on failure.
            org.springframework.transaction.interceptor
                .TransactionAspectSupport.currentTransactionStatus()
                .setRollbackOnly();

            return ResponseEntity.badRequest().body(Map.of(
                "error", "Could not update book. Check the fields and database constraints."
            ));
        }
    }

    
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteBook(@PathVariable int id) {
        try {
            Integer exists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM book WHERE book_id = ?",
                Integer.class,
                id
            );

            if (exists == null || exists == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Book not found."));
            }

            // Check whether any copy has borrowing history.
            Integer borrowingHistory = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM book_copy bc
                JOIN borrow_transaction bt
                  ON bt.accession_number = bc.accession_number
                WHERE bc.book_id = ?
                """,
                Integer.class,
                id
            );

            if (borrowingHistory != null && borrowingHistory > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "error",
                        "Cannot delete this book because its copies have borrowing history."
                    ));
            }

            // Reservations reference the book directly.
            Integer reservationCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM reservation WHERE book_id = ?",
                Integer.class,
                id
            );

            if (reservationCount != null && reservationCount > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "error",
                        "Cannot delete this book because reservations reference it."
                    ));
            }

            // No borrowing history or reservations: remove dependent records first.
            jdbcTemplate.update(
                "DELETE FROM book_author WHERE book_id = ?", id
            );

            jdbcTemplate.update(
                "DELETE FROM book_copy WHERE book_id = ?", id
            );

            jdbcTemplate.update(
                "DELETE FROM book WHERE book_id = ?", id
            );

            return ResponseEntity.ok(Map.of(
                "message", "Book deleted successfully.",
                "book_id", id
            ));

        } catch (Exception e) {
            e.printStackTrace();

            org.springframework.transaction.interceptor
                .TransactionAspectSupport.currentTransactionStatus()
                .setRollbackOnly();

            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "error",
                    "Book could not be deleted. Database changes have been rolled back."
                ));
        }
    }
    
    private String requiredText(
            Map<String, Object> data, String key) {

        Object value = data.get(key);

        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException(
                key + " is required."
            );
        }

        return value.toString().trim();
    }

    private int requiredInt(
            Map<String, Object> data, String key) {

        Object value = data.get(key);

        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException(
                key + " is required."
            );
        }

        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                key + " must be a valid integer."
            );
        }
    }
}