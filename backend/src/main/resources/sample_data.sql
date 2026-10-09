-- BookVerse Smart Digital Library Management System
-- PostgreSQL Sample Data Script

-- Categories
INSERT INTO category (category_id, category_name) VALUES
(1, 'Programming'),
(2, 'Database'),
(3, 'Artificial Intelligence'),
(4, 'Computer Networks'),
(5, 'Software Engineering')
ON CONFLICT (category_id) DO NOTHING;

-- Publishers
INSERT INTO publisher (publisher_id, publisher_name) VALUES
(1, 'Pearson'),
(2, 'McGraw Hill'),
(3, 'O Reilly Media'),
(4, 'Wiley')
ON CONFLICT (publisher_id) DO NOTHING;

-- Students
INSERT INTO student (student_id, name, email, phone, department) VALUES
(25014, 'Adithyan B', 'adithyan@example.com', '9876543210', 'Computer Science'),
(25024, 'Ali Adnan Thaha', 'ali@example.com', '9876543211', 'Computer Science'),
(25040, 'Madhav A', 'madhav@example.com', '9876543212', 'Computer Science'),
(25049, 'Robin Antony', 'robin@example.com', '9876543213', 'Computer Science')
ON CONFLICT (student_id) DO NOTHING;

-- Books
INSERT INTO book (book_id, title, isbn, publication_year, category_id, publisher_id) VALUES
(101, 'Database System Concepts', '9780073523323', 2019, 2, 2),
(102, 'Introduction to Algorithms', '9780262033848', 2022, 1, 1),
(103, 'Artificial Intelligence: A Modern Approach', '9780134610993', 2021, 3, 1),
(104, 'Computer Networks', '9780132126953', 2020, 4, 1),
(105, 'Clean Code', '9780132350884', 2008, 5, 2)
ON CONFLICT (book_id) DO NOTHING;

-- Authors
INSERT INTO author (author_id, author_name) VALUES
(1, 'Abraham Silberschatz'),
(2, 'Thomas H. Cormen'),
(3, 'Stuart Russell'),
(4, 'Peter Norvig'),
(5, 'Andrew S. Tanenbaum'),
(6, 'Robert C. Martin')
ON CONFLICT (author_id) DO NOTHING;

-- Book Authors
INSERT INTO book_author (book_id, author_id) VALUES
(101, 1),
(102, 2),
(103, 3),
(103, 4),
(104, 5),
(105, 6)
ON CONFLICT (book_id, author_id) DO NOTHING;

-- Book Copies
INSERT INTO book_copy (accession_number, book_id, status) VALUES
(1001, 101, 'AVAILABLE'),
(1002, 101, 'BORROWED'),
(1003, 102, 'AVAILABLE'),
(1004, 102, 'AVAILABLE'),
(1005, 103, 'AVAILABLE'),
(1006, 104, 'BORROWED'),
(1007, 104, 'AVAILABLE'),
(1008, 105, 'AVAILABLE')
ON CONFLICT (accession_number) DO NOTHING;

-- Borrow Transactions
INSERT INTO borrow_transaction (borrow_id, student_id, accession_number, issue_date, due_date, status) VALUES
(5001, 25014, 1002, CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '8 days', 'ISSUED'),
(5002, 25024, 1006, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '6 days', 'OVERDUE')
ON CONFLICT (borrow_id) DO NOTHING;

-- Reservations
INSERT INTO reservation (reservation_id, student_id, book_id, reservation_date, status) VALUES
(6001, 25040, 101, CURRENT_DATE - INTERVAL '1 day', 'APPROVED'),
(6002, 25049, 103, CURRENT_DATE - INTERVAL '3 days', 'APPROVED')
ON CONFLICT (reservation_id) DO NOTHING;

-- Fine
INSERT INTO fine (fine_id, borrow_id, amount, payment_status) VALUES
(7001, 5002, 60.00, 'PENDING')
ON CONFLICT (fine_id) DO NOTHING;
