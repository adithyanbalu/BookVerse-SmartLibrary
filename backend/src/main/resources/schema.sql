-- BookVerse Smart Digital Library Management System
-- PostgreSQL Database Schema Script

CREATE TABLE IF NOT EXISTS student (
    student_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS category (
    category_id INTEGER PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS publisher (
    publisher_id INTEGER PRIMARY KEY,
    publisher_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS book (
    book_id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    isbn VARCHAR(30) NOT NULL UNIQUE,
    publication_year INTEGER,
    category_id INTEGER NOT NULL REFERENCES category(category_id),
    publisher_id INTEGER NOT NULL REFERENCES publisher(publisher_id)
);

CREATE TABLE IF NOT EXISTS author (
    author_id INTEGER PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS book_author (
    book_id INTEGER NOT NULL REFERENCES book(book_id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES author(author_id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE IF NOT EXISTS book_copy (
    accession_number INTEGER PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES book(book_id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('AVAILABLE', 'BORROWED', 'RESERVED', 'LOST'))
);

CREATE TABLE IF NOT EXISTS borrow_transaction (
    borrow_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student(student_id),
    accession_number INTEGER NOT NULL REFERENCES book_copy(accession_number),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('ISSUED', 'RETURNED', 'OVERDUE'))
);

CREATE TABLE IF NOT EXISTS reservation (
    reservation_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student(student_id),
    book_id INTEGER NOT NULL REFERENCES book(book_id),
    reservation_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'))
);

CREATE TABLE IF NOT EXISTS fine (
    fine_id INTEGER PRIMARY KEY,
    borrow_id INTEGER NOT NULL UNIQUE REFERENCES borrow_transaction(borrow_id),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_status VARCHAR(30) NOT NULL CHECK (payment_status IN ('PENDING', 'PAID'))
);
