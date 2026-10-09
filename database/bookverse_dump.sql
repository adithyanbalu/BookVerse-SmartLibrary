BEGIN;

-- Drop dependent tables first so foreign keys do not block cleanup.
DROP TABLE IF EXISTS public.fine CASCADE;
DROP TABLE IF EXISTS public.borrow_transaction CASCADE;
DROP TABLE IF EXISTS public.reservation CASCADE;
DROP TABLE IF EXISTS public.book_copy CASCADE;
DROP TABLE IF EXISTS public.book_author CASCADE;
DROP TABLE IF EXISTS public.book CASCADE;
DROP TABLE IF EXISTS public.student CASCADE;
DROP TABLE IF EXISTS public.author CASCADE;
DROP TABLE IF EXISTS public.category CASCADE;
DROP TABLE IF EXISTS public.publisher CASCADE;


CREATE TABLE public.author (
    author_id   INTEGER PRIMARY KEY,
    author_name VARCHAR(150) NOT NULL
);

CREATE TABLE public.category (
    category_id   INTEGER PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE public.publisher (
    publisher_id   INTEGER PRIMARY KEY,
    publisher_name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE public.student (
    student_id INTEGER PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    phone      VARCHAR(15),
    department VARCHAR(100)
);

CREATE TABLE public.book (
    book_id          INTEGER PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    isbn             VARCHAR(20) NOT NULL UNIQUE,
    publication_year INTEGER,
    category_id      INTEGER NOT NULL REFERENCES public.category(category_id),
    publisher_id     INTEGER NOT NULL REFERENCES public.publisher(publisher_id)
);

CREATE TABLE public.book_author (
    book_id   INTEGER NOT NULL REFERENCES public.book(book_id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES public.author(author_id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE public.book_copy (
    accession_number INTEGER PRIMARY KEY,
    book_id          INTEGER NOT NULL REFERENCES public.book(book_id),
    status           VARCHAR(30) NOT NULL
                     CHECK (status IN ('AVAILABLE', 'BORROWED', 'RESERVED', 'LOST'))
);

CREATE TABLE public.borrow_transaction (
    borrow_id        INTEGER PRIMARY KEY,
    student_id       INTEGER NOT NULL REFERENCES public.student(student_id),
    accession_number INTEGER NOT NULL REFERENCES public.book_copy(accession_number),
    issue_date       DATE NOT NULL,
    due_date         DATE NOT NULL,
    return_date      DATE,
    status           VARCHAR(30) NOT NULL
                     CHECK (status IN ('ISSUED', 'RETURNED', 'OVERDUE')),
    CHECK (due_date >= issue_date),
    CHECK (return_date IS NULL OR return_date >= issue_date)
);

CREATE TABLE public.reservation (
    reservation_id   INTEGER PRIMARY KEY,
    student_id       INTEGER NOT NULL REFERENCES public.student(student_id),
    book_id          INTEGER NOT NULL REFERENCES public.book(book_id),
    reservation_date DATE NOT NULL,
    status           VARCHAR(30) NOT NULL
                     CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'))
);

CREATE TABLE public.fine (
    fine_id       INTEGER PRIMARY KEY,
    borrow_id     INTEGER NOT NULL UNIQUE REFERENCES public.borrow_transaction(borrow_id),
    amount        NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    payment_status VARCHAR(30) NOT NULL
                   CHECK (payment_status IN ('PENDING', 'PAID'))
);


INSERT INTO public.category (category_id, category_name) VALUES
    (1, 'Programming'),
    (2, 'Database'),
    (3, 'Artificial Intelligence'),
    (4, 'Computer Networks'),
    (5, 'Software Engineering');

INSERT INTO public.publisher (publisher_id, publisher_name) VALUES
    (1, 'Pearson'),
    (2, 'McGraw Hill'),
    (3, 'O Reilly Media'),
    (4, 'Wiley');

INSERT INTO public.author (author_id, author_name) VALUES
    (1, 'Abraham Silberschatz'),
    (2, 'Thomas H. Cormen'),
    (3, 'Stuart Russell'),
    (4, 'Peter Norvig'),
    (5, 'Andrew S. Tanenbaum'),
    (6, 'Robert C. Martin'),
    (7, 'Alan Beaulieu'),
    (8, 'Helen Keller');


INSERT INTO public.student (student_id, name, email, phone, department) VALUES
    (25014, 'Adithyan B', 'adithyan@example.com', '9876543210', 'Computer Science'),
    (25024, 'Ali Adnan Thaha', 'ali@example.com', '9876543211', 'Computer Science'),
    (25040, 'Madhav A', 'madhav@example.com', '9876543212', 'Computer Science'),
    (25049, 'Robin Antony', 'robin@example.com', '9876543213', 'Computer Science');


INSERT INTO public.book
    (book_id, title, isbn, publication_year, category_id, publisher_id)
VALUES
    (101, 'Database System Concepts', '9780073523323', 2019, 2, 2),
    (102, 'Introduction to Algorithms', '9780262033848', 2022, 1, 1),
    (103, 'Artificial Intelligence: A Modern Approach', '9780134610993', 2021, 3, 1),
    (104, 'Computer Networks', '9780132126953', 2020, 4, 1),
    (105, 'Clean Code', '9780132350884', 2008, 5, 2),
    (106, 'Learning SQL', '9781492057611', 2020, 2, 3),
    (108, 'The Story of My Life', 'BOOK-108', 2026, 5, 2);

INSERT INTO public.book_author (book_id, author_id) VALUES
    (101, 1),
    (102, 2),
    (103, 3),
    (103, 4),
    (104, 5),
    (105, 6),
    (106, 7),
    (108, 8);


INSERT INTO public.book_copy (accession_number, book_id, status) VALUES
    (1001, 101, 'AVAILABLE'),
    (1002, 101, 'BORROWED'),
    (1003, 102, 'AVAILABLE'),
    (1004, 102, 'AVAILABLE'),
    (1005, 103, 'AVAILABLE'),
    (1006, 104, 'BORROWED'),
    (1007, 104, 'AVAILABLE'),
    (1008, 105, 'AVAILABLE'),
    (1009, 106, 'AVAILABLE'),
    (1010, 106, 'AVAILABLE'),
    (109, 108, 'AVAILABLE'),
    (110, 108, 'AVAILABLE'),
    (111, 108, 'AVAILABLE'),
    (112, 108, 'AVAILABLE'),
    (113, 108, 'AVAILABLE'),
    (114, 108, 'AVAILABLE'),
    (115, 108, 'AVAILABLE'),
    (116, 108, 'AVAILABLE'),
    (117, 108, 'AVAILABLE'),
    (118, 108, 'AVAILABLE');


INSERT INTO public.borrow_transaction
    (borrow_id, student_id, accession_number, issue_date, due_date, return_date, status)
VALUES
    (5001, 25014, 1002, DATE '2026-10-03', DATE '2026-10-17', NULL, 'ISSUED'),
    (5002, 25024, 1006, DATE '2026-09-18', DATE '2026-10-02', NULL, 'OVERDUE'),
    (5003, 25040, 1001, DATE '2026-10-08', DATE '2026-10-22', DATE '2026-10-08', 'RETURNED');


INSERT INTO public.reservation
    (reservation_id, student_id, book_id, reservation_date, status)
VALUES
    (6001, 25040, 101, DATE '2026-10-08', 'APPROVED'),
    (6002, 25049, 103, DATE '2026-10-06', 'APPROVED');

INSERT INTO public.fine (fine_id, borrow_id, amount, payment_status) VALUES
    (7001, 5002, 60.00, 'PENDING');

COMMIT;
