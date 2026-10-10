CREATE TABLE STUDENT (
    Student_ID INTEGER PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Phone VARCHAR(15),
    Department VARCHAR(100)
);

CREATE TABLE CATEGORY (
    Category_ID INTEGER PRIMARY KEY,
    Category_Name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE PUBLISHER (
    Publisher_ID INTEGER PRIMARY KEY,
    Publisher_Name VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE BOOK (
    Book_ID INTEGER PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    ISBN VARCHAR(20) UNIQUE NOT NULL,
    Publication_Year INTEGER,
    Category_ID INTEGER NOT NULL,
    Publisher_ID INTEGER NOT NULL,

    CONSTRAINT fk_book_category
        FOREIGN KEY (Category_ID)
        REFERENCES CATEGORY(Category_ID),

    CONSTRAINT fk_book_publisher
        FOREIGN KEY (Publisher_ID)
        REFERENCES PUBLISHER(Publisher_ID)
);

CREATE TABLE AUTHOR (
    Author_ID INTEGER PRIMARY KEY,
    Author_Name VARCHAR(150) NOT NULL
);

CREATE TABLE BOOK_AUTHOR (
    Book_ID INTEGER,
    Author_ID INTEGER,

    PRIMARY KEY (Book_ID, Author_ID),

    FOREIGN KEY (Book_ID)
        REFERENCES BOOK(Book_ID),

    FOREIGN KEY (Author_ID)
        REFERENCES AUTHOR(Author_ID)
);

CREATE TABLE BOOK_COPY (
    Accession_Number INTEGER PRIMARY KEY,
    Book_ID INTEGER NOT NULL,
    Status VARCHAR(30) NOT NULL,

    FOREIGN KEY (Book_ID)
        REFERENCES BOOK(Book_ID),

    CHECK (Status IN ('AVAILABLE', 'BORROWED', 'RESERVED', 'LOST'))
);

CREATE TABLE BORROW_TRANSACTION (
    Borrow_ID INTEGER PRIMARY KEY,
    Student_ID INTEGER NOT NULL,
    Accession_Number INTEGER NOT NULL,
    Issue_Date DATE NOT NULL,
    Due_Date DATE NOT NULL,
    Return_Date DATE,
    Status VARCHAR(30) NOT NULL,

    FOREIGN KEY (Student_ID)
        REFERENCES STUDENT(Student_ID),

    FOREIGN KEY (Accession_Number)
        REFERENCES BOOK_COPY(Accession_Number),

    CHECK (Status IN ('ISSUED', 'RETURNED', 'OVERDUE'))
);

CREATE TABLE RESERVATION (
    Reservation_ID INTEGER PRIMARY KEY,
    Student_ID INTEGER NOT NULL,
    Book_ID INTEGER NOT NULL,
    Reservation_Date DATE NOT NULL,
    Status VARCHAR(30) NOT NULL,

    FOREIGN KEY (Student_ID)
        REFERENCES STUDENT(Student_ID),

    FOREIGN KEY (Book_ID)
        REFERENCES BOOK(Book_ID),

    CHECK (Status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'))
);

CREATE TABLE FINE (
    Fine_ID INTEGER PRIMARY KEY,
    Borrow_ID INTEGER UNIQUE NOT NULL,
    Amount NUMERIC(10,2) NOT NULL,
    Payment_Status VARCHAR(30) NOT NULL,

    FOREIGN KEY (Borrow_ID)
        REFERENCES BORROW_TRANSACTION(Borrow_ID),

    CHECK (Amount >= 0),
    CHECK (Payment_Status IN ('PENDING', 'PAID'))
);


INSERT INTO STUDENT
(Student_ID, Name, Email, Phone, Department)
VALUES
(25014, 'Adithyan B', 'adithyan@example.com', '9876543210', 'Computer Science'),
(25024, 'Ali Adnan Thaha', 'ali@example.com', '9876543211', 'Computer Science'),
(25040, 'Madhav A', 'madhav@example.com', '9876543212', 'Computer Science'),
(25049, 'Robin Antony', 'robin@example.com', '9876543213', 'Computer Science');


INSERT INTO CATEGORY
(Category_ID, Category_Name)
VALUES
(1, 'Programming'),
(2, 'Database'),
(3, 'Artificial Intelligence'),
(4, 'Computer Networks'),
(5, 'Software Engineering');


INSERT INTO PUBLISHER
(Publisher_ID, Publisher_Name)
VALUES
(1, 'Pearson'),
(2, 'McGraw Hill'),
(3, 'O Reilly Media'),
(4, 'Wiley');


INSERT INTO BOOK
(Book_ID, Title, ISBN, Publication_Year, Category_ID, Publisher_ID)
VALUES
(101, 'Database System Concepts', '9780073523323', 2019, 2, 2),
(102, 'Introduction to Algorithms', '9780262033848', 2022, 1, 1),
(103, 'Artificial Intelligence: A Modern Approach', '9780134610993', 2021, 3, 1),
(104, 'Computer Networks', '9780132126953', 2020, 4, 1),
(105, 'Clean Code', '9780132350884', 2008, 5, 2),
(106, 'Learning SQL', '9781492057611', 2020, 2, 3);


INSERT INTO AUTHOR
(Author_ID, Author_Name)
VALUES
(1, 'Abraham Silberschatz'),
(2, 'Thomas H. Cormen'),
(3, 'Stuart Russell'),
(4, 'Peter Norvig'),
(5, 'Andrew S. Tanenbaum'),
(6, 'Robert C. Martin'),
(7, 'Alan Beaulieu');


INSERT INTO BOOK_AUTHOR
(Book_ID, Author_ID)
VALUES
(101, 1),
(102, 2),
(103, 3),
(103, 4),
(104, 5),
(105, 6),
(106, 7);


INSERT INTO BOOK_COPY
(Accession_Number, Book_ID, Status)
VALUES
(1001, 101, 'AVAILABLE'),
(1002, 101, 'BORROWED'),
(1003, 102, 'AVAILABLE'),
(1004, 102, 'AVAILABLE'),
(1005, 103, 'AVAILABLE'),
(1006, 104, 'BORROWED'),
(1007, 104, 'AVAILABLE'),
(1008, 105, 'AVAILABLE'),
(1009, 106, 'AVAILABLE'),
(1010, 106, 'AVAILABLE');


INSERT INTO BORROW_TRANSACTION
(Borrow_ID, Student_ID, Accession_Number,
 Issue_Date, Due_Date, Return_Date, Status)
VALUES
(5001, 25014, 1002,
 CURRENT_DATE - 5,
 CURRENT_DATE + 9,
 NULL,
 'ISSUED'),

(5002, 25024, 1006,
 CURRENT_DATE - 20,
 CURRENT_DATE - 6,
 NULL,
 'OVERDUE');


INSERT INTO RESERVATION
(Reservation_ID, Student_ID, Book_ID,
 Reservation_Date, Status)
VALUES
(6001, 25040, 101,
 CURRENT_DATE,
 'PENDING'),

(6002, 25049, 103,
 CURRENT_DATE - 2,
 'APPROVED');


INSERT INTO FINE
(Fine_ID, Borrow_ID, Amount, Payment_Status)
VALUES
(7001, 5002, 60.00, 'PENDING');

SELECT * FROM BOOK;
SELECT * FROM STUDENT;
SELECT * FROM BOOK_COPY;

SELECT
    b.Book_ID,
    b.Title,
    c.Accession_Number,
    c.Status
FROM BOOK b
JOIN BOOK_COPY c
    ON b.Book_ID = c.Book_ID
ORDER BY b.Book_ID;

SELECT
    b.Book_ID,
    b.Title,
    b.ISBN,
    c.Category_Name,
    p.Publisher_Name
FROM BOOK b
JOIN CATEGORY c
    ON b.Category_ID = c.Category_ID
JOIN PUBLISHER p
    ON b.Publisher_ID = p.Publisher_ID;

SELECT *
FROM BOOK
WHERE LOWER(Title) LIKE '%database%';

SELECT
    b.Title,
    bc.Accession_Number,
    bc.Status
FROM BOOK b
JOIN BOOK_COPY bc
    ON b.Book_ID = bc.Book_ID
WHERE bc.Status = 'AVAILABLE';

SELECT
    s.Name,
    b.Title,
    bt.Issue_Date,
    bt.Due_Date,
    bt.Return_Date,
    bt.Status
FROM BORROW_TRANSACTION bt
JOIN STUDENT s
    ON bt.Student_ID = s.Student_ID
JOIN BOOK_COPY bc
    ON bt.Accession_Number = bc.Accession_Number
JOIN BOOK b
    ON bc.Book_ID = b.Book_ID;


INSERT INTO BORROW_TRANSACTION
(
    Borrow_ID,
    Student_ID,
    Accession_Number,
    Issue_Date,
    Due_Date,
    Return_Date,
    Status
)
VALUES
(
    5003,
    25040,
    1001,
    CURRENT_DATE,
    CURRENT_DATE + 14,
    NULL,
    'ISSUED'
);

UPDATE BOOK_COPY
SET Status = 'BORROWED'
WHERE Accession_Number = 1001;

SELECT
    bc.Accession_Number,
    b.Title,
    bc.Status
FROM BOOK_COPY bc
JOIN BOOK b
    ON bc.Book_ID = b.Book_ID
WHERE bc.Accession_Number = 1001;

UPDATE BORROW_TRANSACTION
SET
    Return_Date = CURRENT_DATE,
    Status = 'RETURNED'
WHERE Borrow_ID = 5003;

UPDATE BOOK_COPY
SET Status = 'AVAILABLE'
WHERE Accession_Number = 1001;

SELECT
    bt.Borrow_ID,
    s.Name,
    b.Title,
    bt.Issue_Date,
    bt.Due_Date,
    bt.Return_Date,
    bt.Status
FROM BORROW_TRANSACTION bt
JOIN STUDENT s
    ON bt.Student_ID = s.Student_ID
JOIN BOOK_COPY bc
    ON bt.Accession_Number = bc.Accession_Number
JOIN BOOK b
    ON bc.Book_ID = b.Book_ID
WHERE bt.Borrow_ID = 5003;

SELECT
    bt.Borrow_ID,
    s.Name AS Student_Name,
    b.Title,
    bt.Due_Date,
    CURRENT_DATE - bt.Due_Date AS Days_Overdue
FROM BORROW_TRANSACTION bt
JOIN STUDENT s
    ON bt.Student_ID = s.Student_ID
JOIN BOOK_COPY bc
    ON bt.Accession_Number = bc.Accession_Number
JOIN BOOK b
    ON bc.Book_ID = b.Book_ID
WHERE bt.Status = 'OVERDUE';

SELECT
    bt.Borrow_ID,
    s.Name AS Student_Name,
    b.Title,
    CURRENT_DATE - bt.Due_Date AS Days_Overdue,
    (CURRENT_DATE - bt.Due_Date) * 10 AS Fine_Amount
FROM BORROW_TRANSACTION bt
JOIN STUDENT s
    ON bt.Student_ID = s.Student_ID
JOIN BOOK_COPY bc
    ON bt.Accession_Number = bc.Accession_Number
JOIN BOOK b
    ON bc.Book_ID = b.Book_ID
WHERE bt.Status = 'OVERDUE';

SELECT
    r.Reservation_ID,
    s.Name AS Student_Name,
    b.Title,
    r.Reservation_Date,
    r.Status
FROM RESERVATION r
JOIN STUDENT s
    ON r.Student_ID = s.Student_ID
JOIN BOOK b
    ON r.Book_ID = b.Book_ID
WHERE r.Status = 'PENDING';

UPDATE RESERVATION
SET Status = 'APPROVED'
WHERE Reservation_ID = 6001;

SELECT *
FROM RESERVATION
WHERE Reservation_ID = 6001;

SELECT
    b.Book_ID,
    b.Title,
    COUNT(bt.Borrow_ID) AS Borrow_Count
FROM BOOK b
JOIN BOOK_COPY bc
    ON b.Book_ID = bc.Book_ID
JOIN BORROW_TRANSACTION bt
    ON bc.Accession_Number = bt.Accession_Number
GROUP BY b.Book_ID, b.Title
ORDER BY Borrow_Count DESC;

SELECT
    Status,
    COUNT(*) AS Total_Copies
FROM BOOK_COPY
GROUP BY Status;

SELECT
    s.Student_ID,
    s.Name,
    SUM(f.Amount) AS Total_Pending_Fine
FROM STUDENT s
JOIN BORROW_TRANSACTION bt
    ON s.Student_ID = bt.Student_ID
JOIN FINE f
    ON bt.Borrow_ID = f.Borrow_ID
WHERE f.Payment_Status = 'PENDING'
GROUP BY s.Student_ID, s.Name
ORDER BY Total_Pending_Fine DESC;

SELECT
    book_id,
    COUNT(*) AS total_copies,
    SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_copies
FROM book_copy
GROUP BY book_id
ORDER BY book_id;

SELECT category_id, category_name
FROM category
ORDER BY category_id;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('author', 'book_author', 'book_copy')
ORDER BY table_name, ordinal_position;



SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('author', 'book_author', 'book_copy')
ORDER BY table_name, ordinal_position;


-- 1. Inspect the BOOK table columns
SELECT table_name, column_name, data_type,
       is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'book'
ORDER BY ordinal_position;

-- 2. Inspect primary keys, foreign keys, and unique constraints
SELECT
    tc.table_name,
    tc.constraint_type,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.constraint_schema = kcu.constraint_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
   AND tc.constraint_schema = ccu.constraint_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('book', 'author', 'book_author', 'book_copy')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;


-- Check publisher IDs available to the book form
SELECT publisher_id, publisher_name
FROM publisher
ORDER BY publisher_id;

-- Check existing physical copy records and accession numbers
SELECT accession_number, book_id, status
FROM book_copy
ORDER BY accession_number
LIMIT 20;

-- Check whether book IDs are generated automatically
SELECT column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'book'
  AND column_name = 'book_id';

SELECT table_name, column_name, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
       (table_name = 'author' AND column_name = 'author_id')
       OR
       (table_name = 'book_copy' AND column_name = 'accession_number')
       OR
       (table_name = 'book' AND column_name = 'book_id')
  )
ORDER BY table_name, column_name;


SELECT b.book_id, b.title, b.isbn,
       a.author_id, a.author_name,
       bc.accession_number, bc.status
FROM book b
JOIN book_author ba ON ba.book_id = b.book_id
JOIN author a ON a.author_id = ba.author_id
JOIN book_copy bc ON bc.book_id = b.book_id
WHERE b.title = 'YOUR_TEST_TITLE'
ORDER BY bc.accession_number;


SELECT
    b.book_id,
    b.title,
    b.isbn,
    b.category_id,
    b.publisher_id,
    a.author_id,
    a.author_name,
    bc.accession_number,
    bc.status
FROM book b
LEFT JOIN book_author ba
    ON ba.book_id = b.book_id
LEFT JOIN author a
    ON a.author_id = ba.author_id
LEFT JOIN book_copy bc
    ON bc.book_id = b.book_id
WHERE b.title = 'BookVerse Integration Test'
ORDER BY bc.accession_number;


SELECT b.book_id, b.title, a.author_name,
       COUNT(bc.accession_number) AS total_copies
FROM book b
LEFT JOIN book_author ba ON ba.book_id = b.book_id
LEFT JOIN author a ON a.author_id = ba.author_id
LEFT JOIN book_copy bc ON bc.book_id = b.book_id
WHERE b.title = 'BookVerse Integration Test Edited'
GROUP BY b.book_id, b.title, a.author_name;


SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
      'borrow_transaction',
      'reservation',
      'fine'
  )
ORDER BY table_name, ordinal_position;


SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
   AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
      'book',
      'book_author',
      'book_copy',
      'borrow_transaction',
      'fine',
      'reservation'
  )
ORDER BY tc.table_name, kcu.column_name;

SELECT book_id, title, isbn
FROM book
ORDER BY book_id;

SELECT *
FROM book
WHERE title ILIKE '%Integration Test%';

SELECT book_id, title, isbn
FROM book
WHERE title ILIKE '%Integration Test%';


-- Check the student table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'student'
ORDER BY ordinal_position;

-- Check for existing authentication-related tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
      table_name ILIKE '%user%'
      OR table_name ILIKE '%auth%'
      OR table_name ILIKE '%login%'
      OR table_name ILIKE '%credential%'
  )
ORDER BY table_name;


CREATE TABLE student_credentials (
    student_id INTEGER PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_credentials
        FOREIGN KEY (student_id)
        REFERENCES student(student_id)
        ON DELETE CASCADE
);


CREATE TABLE admin_credentials (
    admin_id VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO admin_credentials (admin_id, password_hash)
VALUES (
    'admin01',
    '$2a$10$xV/AEN9aY4u9u8R3nJVan.JxRKEh6tc7gPuoJtQzPx5DawoQnI2Wa'
);

SELECT
    s.student_id,
    s.name,
    s.email,
    CASE
        WHEN sc.student_id IS NOT NULL THEN 'Credentials exist'
        ELSE 'Password not set'
    END AS login_status
FROM student s
LEFT JOIN student_credentials sc
    ON s.student_id = sc.student_id
ORDER BY s.student_id;
