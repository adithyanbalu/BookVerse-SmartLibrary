# BookVerse — Smart Digital Library Management System

BookVerse is a full-stack, database-driven Smart Digital Library Management System built for modern academic institutions. It features a responsive web interface, a Spring Boot REST API, and a robust PostgreSQL relational database.

### 👥 Team Members
* **Adithyan B**
* **Madhav A**
* **Ali Adnan Thaha**
* **Robin Antony**

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, CSS3 (Vanilla Glassmorphism UI), JavaScript (ES6+ async/await)
* **Backend:** Java 21, Spring Boot 3.4.3, Spring JDBC (`JdbcTemplate`)
* **Database:** PostgreSQL 18
* **Build Tool:** Maven Wrapper (`mvnw`)
* **API Architecture:** RESTful JSON Endpoints

---

## 🗄️ Relational Database Schema & Entity Relationships

The PostgreSQL database `bookverse` consists of 10 normalized tables connected through foreign keys:

1. **`STUDENT`** (`student_id` PK, `name`, `email`, `phone`, `department`)
2. **`CATEGORY`** (`category_id` PK, `category_name`)
3. **`PUBLISHER`** (`publisher_id` PK, `publisher_name`)
4. **`BOOK`** (`book_id` PK, `title`, `isbn`, `publication_year`, `category_id` FK, `publisher_id` FK)
5. **`AUTHOR`** (`author_id` PK, `author_name`)
6. **`BOOK_AUTHOR`** (`book_id` FK, `author_id` FK — Composite PK)
7. **`BOOK_COPY`** (`accession_number` PK, `book_id` FK, `status` CHECK: `AVAILABLE`, `BORROWED`, `RESERVED`, `LOST`)
8. **`BORROW_TRANSACTION`** (`borrow_id` PK, `student_id` FK, `accession_number` FK, `issue_date`, `due_date`, `return_date`, `status` CHECK: `ISSUED`, `RETURNED`, `OVERDUE`)
9. **`RESERVATION`** (`reservation_id` PK, `student_id` FK, `book_id` FK, `reservation_date`, `status` CHECK: `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`)
10. **`FINE`** (`fine_id` PK, `borrow_id` FK UNIQUE, `amount`, `payment_status` CHECK: `PENDING`, `PAID`)

---

## 🚀 Getting Started & Setup Instructions

### Prerequisites
* Java JDK 21+
* PostgreSQL 18+ installed and running on `localhost:5432`
* Web Browser (Chrome, Edge, Firefox)

### 1. Database Configuration
Ensure PostgreSQL is running and database `bookverse` is created:
```sql
CREATE DATABASE bookverse;
```

Update your database credentials in `backend/src/main/resources/application.properties` (or set environment variables):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bookverse
spring.datasource.username=postgres
spring.datasource.password=YourPostgresPassword
```

You can populate the schema and sample data using:
* `backend/src/main/resources/schema.sql`
* `backend/src/main/resources/sample_data.sql`

### 2. Run the Spring Boot Backend
Open a terminal in the `backend` directory and run:
```cmd
.\mvnw.cmd spring-boot:run
```
The backend server will start on `http://localhost:8080`.

### 3. Open the Frontend
Serve the `frontend/` directory using Live Server, Python HTTP server, or open `frontend/index.html` directly in your browser:
```cmd
cd frontend
python -m http.server 5500
```
Open `http://127.0.0.1:5500` in your web browser.

---

## 📡 REST API Documentation

| Endpoint | Method | Description | Success Code |
| :--- | :--- | :--- | :--- |
| `/api/books` | GET | Fetch all books with aggregated author names and copy counts | 200 OK |
| `/api/books/{id}` | GET | Get single book details | 200 OK / 404 |
| `/api/books` | POST | Add a new book, author link, and physical copies | 201 Created |
| `/api/books/{id}` | PUT | Update existing book details and author links | 200 OK |
| `/api/books/{id}` | DELETE | Delete eligible book (safely blocked if borrowing history or reservations exist) | 200 OK / 409 |
| `/api/students` | GET | List registered students with loan counts and fines | 200 OK |
| `/api/students` | POST | Register a new student | 201 Created |
| `/api/loans` | GET | Fetch active and historical borrowing transactions | 200 OK |
| `/api/loans/issue` | POST | Issue an available book copy to a student | 201 Created |
| `/api/loans/return/{id}` | POST | Return a borrowed book copy and calculate overdue fine if applicable | 200 OK |
| `/api/reservations` | GET | List reservation requests | 200 OK |
| `/api/reservations` | POST | Request a book reservation | 201 Created |
| `/api/reservations/{id}/status` | PUT | Approve or reject a reservation | 200 OK |
| `/api/fines` | GET | List outstanding and settled fines | 200 OK |
| `/api/fines/{id}/pay` | PUT | Mark fine payment status as PAID | 200 OK |
| `/api/dashboard/stats` | GET | Dynamic PostgreSQL library summary counters | 200 OK |

---

## 🎓 Essential SQL Queries for DBMS Faculty Evaluation

### 1. Multi-Table Join & Subquery (Book Catalog View)
```sql
SELECT b.book_id, b.title, b.isbn, b.publication_year,
       c.category_name, p.publisher_name,
       (SELECT STRING_AGG(a.author_name, ', ')
        FROM book_author ba
        JOIN author a ON a.author_id = ba.author_id
        WHERE ba.book_id = b.book_id) AS authors,
       (SELECT COUNT(*) FROM book_copy bc WHERE bc.book_id = b.book_id) AS total_copies,
       (SELECT COUNT(*) FROM book_copy bc WHERE bc.book_id = b.book_id AND bc.status = 'AVAILABLE') AS available_copies
FROM book b
LEFT JOIN category c ON c.category_id = b.category_id
LEFT JOIN publisher p ON p.publisher_id = b.publisher_id
ORDER BY b.book_id;
```

### 2. Aggregation & Grouping (Student Loan & Fine Summary)
```sql
SELECT s.student_id, s.name, s.department,
       COUNT(bt.borrow_id) AS total_borrows,
       COALESCE(SUM(f.amount), 0) AS total_unpaid_fines
FROM student s
LEFT JOIN borrow_transaction bt ON bt.student_id = s.student_id
LEFT JOIN fine f ON f.borrow_id = bt.borrow_id AND f.payment_status = 'PENDING'
GROUP BY s.student_id, s.name, s.department;
```

### 3. Transactional Overdue Return & Fine Trigger Simulation
```sql
BEGIN;
-- Mark borrowing transaction returned
UPDATE borrow_transaction
SET return_date = CURRENT_DATE, status = 'RETURNED'
WHERE borrow_id = 5002;

-- Mark copy available
UPDATE book_copy
SET status = 'AVAILABLE'
WHERE accession_number = (SELECT accession_number FROM borrow_transaction WHERE borrow_id = 5002);

-- Insert fine if overdue
INSERT INTO fine (fine_id, borrow_id, amount, payment_status)
VALUES (7002, 5002, 60.00, 'PENDING');
COMMIT;
```

---

## 🧪 Automated Testing

To run the automated Spring Boot integration test suite (covering Delete integrity, issue/return logic, and stats):
```cmd
.\mvnw.cmd test
```

---

## 🔍 Faculty Demonstration Checklist

1. **Start Application**: Run `.\mvnw.cmd spring-boot:run` in `backend`, open `http://127.0.0.1:5500`.
2. **Dashboard Overview**: Verify total books, active loans, pending reservations, and live fine sums fetched from PostgreSQL.
3. **Delete Integrity Demo**:
   * Attempt to delete Book #101 ("Database System Concepts") -> Observe red toast error preventing deletion due to borrowing history!
   * Add a new disposable book -> Delete it -> Observe successful removal from table and PostgreSQL database without refreshing!
4. **Circulation Workflow Demo**:
   * Issue a copy of a book to student Adithyan B.
   * Return the book -> Observe physical copy status change back to `AVAILABLE`.
5. **Fine Ledger Demo**:
   * View pending fines -> Click "Mark paid" -> Verify status updates to `PAID`.
>>>>>>> 756f6ff (feat: complete BookVerse DBMS project with Spring Boot REST API, PostgreSQL database dump, and updated frontend)
