# 📚 BookVerse

### Smart Library Management System

<p align="center">
  A database-driven library management system designed to simplify book discovery, borrowing, reservations, and library administration.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-Spring%20Boot-orange?style=for-the-badge&logo=springboot" alt="Java Spring Boot" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="Frontend" />
  <img src="https://img.shields.io/badge/Build-Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white" alt="Maven" />
</p>

---

## 🌟 About the Project

**BookVerse** is a full-stack Library Management System developed as an academic Database Management Systems (DBMS) project.

The project focuses on applying relational database concepts to a practical library environment. It connects a web-based frontend with a Java Spring Boot backend and a PostgreSQL database to manage books, authors, publishers, students, borrowing transactions, reservations, and fines.

BookVerse demonstrates how a properly structured database and backend services can support organized, consistent, and efficient library operations.

## 🎯 Project Objectives

* Design and implement a relational database for library management.
* Establish relationships between books, authors, publishers, and students.
* Apply primary keys, foreign keys, and integrity constraints.
* Connect PostgreSQL with a Java Spring Boot backend.
* Integrate frontend operations through REST APIs.
* Demonstrate practical SQL operations and transaction management.

## ✨ Features

### 📖 Book Catalogue

* Browse books and their publication details.
* Search and filter books by relevant information.
* Organize books by category, publisher, and author.
* Track individual copies and their availability.

### 👨‍💼 Administration

* View library dashboard statistics.
* Manage book and student information.
* Monitor borrowing transactions and returns.
* Review reservations and outstanding fines.

### 🔄 Borrowing Management

* Record book-issue transactions.
* Maintain issue dates, due dates, and return dates.
* Track transaction statuses such as `ISSUED`, `RETURNED`, and `OVERDUE`.
* Link each transaction to a student and a specific book copy.

### 📌 Reservations and Fines

* Maintain reservation records.
* Track reservation statuses.
* Record overdue fines and payment statuses.
* Associate fines with their corresponding borrowing transactions.

### 🔐 Authentication

* Provide separate student and administrator login flows.
* Support student password setup through the backend.

*Feature availability depends on the corresponding backend implementation and configuration.*

## 🛠️ Technology Stack

| Component             | Technology              |
| --------------------- | ----------------------- |
| Frontend              | HTML5, CSS3, JavaScript |
| Backend               | Java, Spring Boot       |
| Database              | PostgreSQL              |
| Database Connectivity | Spring JDBC / JDBC      |
| Build Tool            | Apache Maven            |
| Communication         | REST APIs               |
| Version Control       | Git and GitHub          |

## 🏗️ System Architecture

```text
                 ┌──────────────────────────┐
                 │       FRONTEND           │
                 │    HTML, CSS, JavaScript │
                 └────────────┬─────────────┘
                              │
                         HTTP / REST
                              │
                 ┌────────────▼─────────────┐
                 │      BACKEND             │
                 │       Spring Boot        │
                 │ Controllers and SQL      │
                 │ Database Access Logic    │
                 └────────────┬─────────────┘
                              │
                            JDBC
                              │
                 ┌────────────▼─────────────┐
                 │       DATABASE           │
                 │       PostgreSQL         │
                 │ Tables, Keys, Constraints│
                 │ Relationships, Data      │
                 └──────────────────────────┘
```

## 🗄️ Database Design

The database contains the following core relational tables:

| Table                | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `author`             | Stores author information                             |
| `category`           | Stores book categories                                |
| `publisher`          | Stores publisher information                          |
| `student`            | Stores student records                                |
| `book`               | Stores book details and references                    |
| `book_author`        | Establishes the many-to-many book-author relationship |
| `book_copy`          | Tracks individual physical copies                     |
| `borrow_transaction` | Records book issues and returns                       |
| `reservation`        | Stores book reservation records                       |
| `fine`               | Tracks fines and payment status                       |

### 🔗 Entity Relationships

* **Category → Book:** One category can contain multiple books.
* **Publisher → Book:** One publisher can publish multiple books.
* **Book ↔ Author:** Many-to-many relationship implemented through `book_author`.
* **Book → Book Copy:** One book can have multiple physical copies.
* **Student → Borrow Transaction:** One student can have multiple borrowing records.
* **Student → Reservation:** One student can make multiple reservations.
* **Borrow Transaction → Fine:** A borrowing transaction can have an associated fine.

### 🧠 DBMS Concepts Applied

* Relational database modelling
* Primary keys and foreign keys
* One-to-many and many-to-many relationships
* Referential integrity
* `NOT NULL`, `UNIQUE`, and `CHECK` constraints
* SQL DDL and DML operations
* Database transactions using `BEGIN` and `COMMIT`
* Relational data consistency

## 📂 Project Structure

```text
DBMS-PROJECT/
│
├── index.html
├── app.js
├── styles.css
│
├── database/
│   └── bookverse_dump.sql
│
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/bookverse/backend/
│           │       ├── PasswordHashGenerator.java
│           │       └── controller/
│           │           ├── AuthController.java
│           │           └── StudentController.java
│           └── resources/
│
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following tools:

* Java JDK compatible with the project configuration
* PostgreSQL
* Apache Maven
* Git
* A modern web browser

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd DBMS-PROJECT
```

Replace the placeholder with the URL of this repository.

### 2. Create the Database

Open PostgreSQL or pgAdmin and create the database:

```sql
CREATE DATABASE bookverse;
```

### 3. Configure Database Connectivity

Configure the Spring Boot backend to connect to your local PostgreSQL instance.

Example configuration:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bookverse
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Set the environment variables according to your system and the configuration supported by the project.

**Security:** Never commit actual database passwords, access tokens, or other secrets to a public repository.

### 4. Initialize the Database

Open `database/bookverse_dump.sql` in pgAdmin or a PostgreSQL client and execute it against the development database.

> **Warning:** The SQL script contains `DROP TABLE ... CASCADE` commands. Executing it can delete existing tables and dependent objects. Use a disposable development database or take a verified backup first.

### 5. Run the Backend

Navigate to the backend directory:

```bash
cd backend
mvn spring-boot:run
```

Wait for Spring Boot to finish starting. Check the console output and application configuration to confirm the server port.

### 6. Launch the Frontend

Open `index.html` in your browser or serve the frontend using a local development server.

Make sure the frontend's API base URL matches the running backend. If requests fail, verify database connectivity, CORS configuration, and browser-console errors.

## 🔌 API Overview

The frontend communicates with the backend through REST endpoints.

Known endpoint patterns include:

| HTTP Method | Endpoint                 | Purpose                         |
| ----------- | ------------------------ | ------------------------------- |
| `GET`       | `/api/books`             | Retrieve books                  |
| `GET`       | `/api/students`          | Retrieve student records        |
| `GET`       | `/api/loans`             | Retrieve borrowing transactions |
| `GET`       | `/api/reservations`      | Retrieve reservations           |
| `GET`       | `/api/fines`             | Retrieve fines                  |
| `GET`       | `/api/dashboard/stats`   | Retrieve dashboard statistics   |
| `POST`      | `/api/loans/issue`       | Issue a book                    |
| `POST`      | `/api/students/register` | Register a student              |

Additional authentication, return, reservation, and fine-management endpoints may be implemented in the backend. Refer to the source code for their exact routes and request formats.

## 📸 Application Screenshots

Add screenshots of the actual application to showcase its interface and functionality.

Recommended screenshots:

* Administrator dashboard
* Book catalogue and search
* Student dashboard
* Borrowing and return workflow
* Reservation management
* Fine management

For example, if you save a screenshot as `screenshots/dashboard.png`, embed it using:

```markdown
![BookVerse Dashboard](screenshots/dashboard.png)
```

## 🚀 Future Enhancements

* Advanced book search and filtering
* Automated overdue-fine calculation
* Improved role-based authorization
* Database migration and backup support
* Unit and integration testing
* Pagination and reporting
* Deployment with environment-based configuration
* Accessibility and responsive-design improvements

## 👥 Team Members

**Project:** BookVerse — Smart Library Management System
**Domain:** Database Management Systems (DBMS)

1. **ADITHYAN B**
2. **MADHAV A**
3. **ROBIN ANTONY**
4. **ALI ADNAN THAHA**


*Update the member names and contributions to match your actual project team.*

## 🎓 Academic Context

Developed as an academic DBMS project to demonstrate the practical integration of a relational database, backend services, and a web-based application.

## 📄 License

No license has been specified yet. Add an appropriate license if you intend to permit others to reuse, modify, or distribute this project.

---

<p align="center">
  <strong>BookVerse — Bringing library operations together, one record at a time. 📚</strong>
</p>
