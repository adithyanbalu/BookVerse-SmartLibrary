--
-- PostgreSQL database dump
--

\restrict 8GiAu4ChKqQnQzuTpQZYUza6m61KcXfAyXfmHbFnKVTXsDomfW9x3mvx2Hat9aM

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.reservation DROP CONSTRAINT IF EXISTS reservation_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reservation DROP CONSTRAINT IF EXISTS reservation_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.book DROP CONSTRAINT IF EXISTS fk_book_publisher;
ALTER TABLE IF EXISTS ONLY public.book DROP CONSTRAINT IF EXISTS fk_book_category;
ALTER TABLE IF EXISTS ONLY public.fine DROP CONSTRAINT IF EXISTS fine_borrow_id_fkey;
ALTER TABLE IF EXISTS ONLY public.borrow_transaction DROP CONSTRAINT IF EXISTS borrow_transaction_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.borrow_transaction DROP CONSTRAINT IF EXISTS borrow_transaction_accession_number_fkey;
ALTER TABLE IF EXISTS ONLY public.book_copy DROP CONSTRAINT IF EXISTS book_copy_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.book_author DROP CONSTRAINT IF EXISTS book_author_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.book_author DROP CONSTRAINT IF EXISTS book_author_author_id_fkey;
ALTER TABLE IF EXISTS ONLY public.student DROP CONSTRAINT IF EXISTS student_pkey;
ALTER TABLE IF EXISTS ONLY public.student DROP CONSTRAINT IF EXISTS student_email_key;
ALTER TABLE IF EXISTS ONLY public.reservation DROP CONSTRAINT IF EXISTS reservation_pkey;
ALTER TABLE IF EXISTS ONLY public.publisher DROP CONSTRAINT IF EXISTS publisher_publisher_name_key;
ALTER TABLE IF EXISTS ONLY public.publisher DROP CONSTRAINT IF EXISTS publisher_pkey;
ALTER TABLE IF EXISTS ONLY public.fine DROP CONSTRAINT IF EXISTS fine_pkey;
ALTER TABLE IF EXISTS ONLY public.fine DROP CONSTRAINT IF EXISTS fine_borrow_id_key;
ALTER TABLE IF EXISTS ONLY public.category DROP CONSTRAINT IF EXISTS category_pkey;
ALTER TABLE IF EXISTS ONLY public.category DROP CONSTRAINT IF EXISTS category_category_name_key;
ALTER TABLE IF EXISTS ONLY public.borrow_transaction DROP CONSTRAINT IF EXISTS borrow_transaction_pkey;
ALTER TABLE IF EXISTS ONLY public.book DROP CONSTRAINT IF EXISTS book_pkey;
ALTER TABLE IF EXISTS ONLY public.book DROP CONSTRAINT IF EXISTS book_isbn_key;
ALTER TABLE IF EXISTS ONLY public.book_copy DROP CONSTRAINT IF EXISTS book_copy_pkey;
ALTER TABLE IF EXISTS ONLY public.book_author DROP CONSTRAINT IF EXISTS book_author_pkey;
ALTER TABLE IF EXISTS ONLY public.author DROP CONSTRAINT IF EXISTS author_pkey;
DROP TABLE IF EXISTS public.student;
DROP TABLE IF EXISTS public.reservation;
DROP TABLE IF EXISTS public.publisher;
DROP TABLE IF EXISTS public.fine;
DROP TABLE IF EXISTS public.category;
DROP TABLE IF EXISTS public.borrow_transaction;
DROP TABLE IF EXISTS public.book_copy;
DROP TABLE IF EXISTS public.book_author;
DROP TABLE IF EXISTS public.book;
DROP TABLE IF EXISTS public.author;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: author; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.author (
    author_id integer NOT NULL,
    author_name character varying(150) NOT NULL
);


ALTER TABLE public.author OWNER TO postgres;

--
-- Name: book; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book (
    book_id integer NOT NULL,
    title character varying(200) NOT NULL,
    isbn character varying(20) NOT NULL,
    publication_year integer,
    category_id integer NOT NULL,
    publisher_id integer NOT NULL
);


ALTER TABLE public.book OWNER TO postgres;

--
-- Name: book_author; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book_author (
    book_id integer NOT NULL,
    author_id integer NOT NULL
);


ALTER TABLE public.book_author OWNER TO postgres;

--
-- Name: book_copy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book_copy (
    accession_number integer NOT NULL,
    book_id integer NOT NULL,
    status character varying(30) NOT NULL,
    CONSTRAINT book_copy_status_check CHECK (((status)::text = ANY ((ARRAY['AVAILABLE'::character varying, 'BORROWED'::character varying, 'RESERVED'::character varying, 'LOST'::character varying])::text[])))
);


ALTER TABLE public.book_copy OWNER TO postgres;

--
-- Name: borrow_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.borrow_transaction (
    borrow_id integer NOT NULL,
    student_id integer NOT NULL,
    accession_number integer NOT NULL,
    issue_date date NOT NULL,
    due_date date NOT NULL,
    return_date date,
    status character varying(30) NOT NULL,
    CONSTRAINT borrow_transaction_status_check CHECK (((status)::text = ANY ((ARRAY['ISSUED'::character varying, 'RETURNED'::character varying, 'OVERDUE'::character varying])::text[])))
);


ALTER TABLE public.borrow_transaction OWNER TO postgres;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    category_id integer NOT NULL,
    category_name character varying(100) NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: fine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fine (
    fine_id integer NOT NULL,
    borrow_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_status character varying(30) NOT NULL,
    CONSTRAINT fine_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT fine_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying])::text[])))
);


ALTER TABLE public.fine OWNER TO postgres;

--
-- Name: publisher; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publisher (
    publisher_id integer NOT NULL,
    publisher_name character varying(150) NOT NULL
);


ALTER TABLE public.publisher OWNER TO postgres;

--
-- Name: reservation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation (
    reservation_id integer NOT NULL,
    student_id integer NOT NULL,
    book_id integer NOT NULL,
    reservation_date date NOT NULL,
    status character varying(30) NOT NULL,
    CONSTRAINT reservation_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'COMPLETED'::character varying])::text[])))
);


ALTER TABLE public.reservation OWNER TO postgres;

--
-- Name: student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student (
    student_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(15),
    department character varying(100)
);


ALTER TABLE public.student OWNER TO postgres;

--
-- Data for Name: author; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.author VALUES (1, 'Abraham Silberschatz');
INSERT INTO public.author VALUES (2, 'Thomas H. Cormen');
INSERT INTO public.author VALUES (3, 'Stuart Russell');
INSERT INTO public.author VALUES (4, 'Peter Norvig');
INSERT INTO public.author VALUES (5, 'Andrew S. Tanenbaum');
INSERT INTO public.author VALUES (6, 'Robert C. Martin');
INSERT INTO public.author VALUES (7, 'Alan Beaulieu');
INSERT INTO public.author VALUES (8, 'Hellen Keller');
INSERT INTO public.author VALUES (9, 'Test Author');
INSERT INTO public.author VALUES (10, 'Updated Test Author.');
INSERT INTO public.author VALUES (11, 'Audit Test Author');


--
-- Data for Name: book; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.book VALUES (101, 'Database System Concepts', '9780073523323', 2019, 2, 2);
INSERT INTO public.book VALUES (102, 'Introduction to Algorithms', '9780262033848', 2022, 1, 1);
INSERT INTO public.book VALUES (103, 'Artificial Intelligence: A Modern Approach', '9780134610993', 2021, 3, 1);
INSERT INTO public.book VALUES (104, 'Computer Networks', '9780132126953', 2020, 4, 1);
INSERT INTO public.book VALUES (106, 'Learning SQL', '9781492057611', 2020, 2, 3);
INSERT INTO public.book VALUES (108, 'The Story of My Life', 'BOOK-108', 2026, 5, 2);
INSERT INTO public.book VALUES (105, 'Clean Code', '9780132350884', 2008, 5, 2);
INSERT INTO public.book VALUES (109, 'BookVerse Integration Test Edited', 'BOOK-109', 2026, 1, 2);


--
-- Data for Name: book_author; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.book_author VALUES (101, 1);
INSERT INTO public.book_author VALUES (102, 2);
INSERT INTO public.book_author VALUES (103, 3);
INSERT INTO public.book_author VALUES (103, 4);
INSERT INTO public.book_author VALUES (104, 5);
INSERT INTO public.book_author VALUES (105, 6);
INSERT INTO public.book_author VALUES (106, 7);
INSERT INTO public.book_author VALUES (108, 8);
INSERT INTO public.book_author VALUES (109, 10);


--
-- Data for Name: book_copy; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.book_copy VALUES (1002, 101, 'BORROWED');
INSERT INTO public.book_copy VALUES (1003, 102, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (1004, 102, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (1005, 103, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (1006, 104, 'BORROWED');
INSERT INTO public.book_copy VALUES (1007, 104, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (1008, 105, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (1009, 106, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (1010, 106, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (1001, 101, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (109, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (110, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (111, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (112, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (113, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (114, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (115, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (116, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (117, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (118, 108, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (1011, 109, 'AVAILABLE');
INSERT INTO public.book_copy VALUES (1012, 109, 'AVAILABLE');


--
-- Data for Name: borrow_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.borrow_transaction VALUES (5001, 25014, 1002, '2026-10-03', '2026-10-17', NULL, 'ISSUED');
INSERT INTO public.borrow_transaction VALUES (5002, 25024, 1006, '2026-09-18', '2026-10-02', NULL, 'OVERDUE');
INSERT INTO public.borrow_transaction VALUES (5003, 25040, 1001, '2026-10-08', '2026-10-22', '2026-10-08', 'RETURNED');


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.category VALUES (1, 'Programming');
INSERT INTO public.category VALUES (2, 'Database');
INSERT INTO public.category VALUES (3, 'Artificial Intelligence');
INSERT INTO public.category VALUES (4, 'Computer Networks');
INSERT INTO public.category VALUES (5, 'Software Engineering');


--
-- Data for Name: fine; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.fine VALUES (7001, 5002, 60.00, 'PENDING');


--
-- Data for Name: publisher; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.publisher VALUES (1, 'Pearson');
INSERT INTO public.publisher VALUES (2, 'McGraw Hill');
INSERT INTO public.publisher VALUES (3, 'O Reilly Media');
INSERT INTO public.publisher VALUES (4, 'Wiley');


--
-- Data for Name: reservation; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.reservation VALUES (6002, 25049, 103, '2026-10-06', 'APPROVED');
INSERT INTO public.reservation VALUES (6001, 25040, 101, '2026-10-08', 'APPROVED');


--
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.student VALUES (25014, 'Adithyan B', 'adithyan@example.com', '9876543210', 'Computer Science');
INSERT INTO public.student VALUES (25024, 'Ali Adnan Thaha', 'ali@example.com', '9876543211', 'Computer Science');
INSERT INTO public.student VALUES (25040, 'Madhav A', 'madhav@example.com', '9876543212', 'Computer Science');
INSERT INTO public.student VALUES (25049, 'Robin Antony', 'robin@example.com', '9876543213', 'Computer Science');


--
-- Name: author author_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT author_pkey PRIMARY KEY (author_id);


--
-- Name: book_author book_author_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_author
    ADD CONSTRAINT book_author_pkey PRIMARY KEY (book_id, author_id);


--
-- Name: book_copy book_copy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_copy
    ADD CONSTRAINT book_copy_pkey PRIMARY KEY (accession_number);


--
-- Name: book book_isbn_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_isbn_key UNIQUE (isbn);


--
-- Name: book book_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (book_id);


--
-- Name: borrow_transaction borrow_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.borrow_transaction
    ADD CONSTRAINT borrow_transaction_pkey PRIMARY KEY (borrow_id);


--
-- Name: category category_category_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_category_name_key UNIQUE (category_name);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- Name: fine fine_borrow_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fine
    ADD CONSTRAINT fine_borrow_id_key UNIQUE (borrow_id);


--
-- Name: fine fine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fine
    ADD CONSTRAINT fine_pkey PRIMARY KEY (fine_id);


--
-- Name: publisher publisher_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT publisher_pkey PRIMARY KEY (publisher_id);


--
-- Name: publisher publisher_publisher_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT publisher_publisher_name_key UNIQUE (publisher_name);


--
-- Name: reservation reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (reservation_id);


--
-- Name: student student_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_email_key UNIQUE (email);


--
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (student_id);


--
-- Name: book_author book_author_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_author
    ADD CONSTRAINT book_author_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.author(author_id);


--
-- Name: book_author book_author_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_author
    ADD CONSTRAINT book_author_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(book_id);


--
-- Name: book_copy book_copy_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_copy
    ADD CONSTRAINT book_copy_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(book_id);


--
-- Name: borrow_transaction borrow_transaction_accession_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.borrow_transaction
    ADD CONSTRAINT borrow_transaction_accession_number_fkey FOREIGN KEY (accession_number) REFERENCES public.book_copy(accession_number);


--
-- Name: borrow_transaction borrow_transaction_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.borrow_transaction
    ADD CONSTRAINT borrow_transaction_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id);


--
-- Name: fine fine_borrow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fine
    ADD CONSTRAINT fine_borrow_id_fkey FOREIGN KEY (borrow_id) REFERENCES public.borrow_transaction(borrow_id);


--
-- Name: book fk_book_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT fk_book_category FOREIGN KEY (category_id) REFERENCES public.category(category_id);


--
-- Name: book fk_book_publisher; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT fk_book_publisher FOREIGN KEY (publisher_id) REFERENCES public.publisher(publisher_id);


--
-- Name: reservation reservation_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(book_id);


--
-- Name: reservation reservation_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 8GiAu4ChKqQnQzuTpQZYUza6m61KcXfAyXfmHbFnKVTXsDomfW9x3mvx2Hat9aM

