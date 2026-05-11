# Library Management System — Project Synopsis

**Student Name:** Sanket Pal  
**Project Title:** Library Management System  
**Technology Used:** Python 3 (Console-Based Application)  
**Date:** May 2026

---

## 1. Introduction

A Library Management System (LMS) is a software application designed to automate and simplify the day-to-day operations of a library. Managing books, members, and borrowing records manually is time-consuming and error-prone. This project provides a simple, efficient, and user-friendly console-based solution to handle all core library operations digitally.

---

## 2. Problem Statement

Traditional libraries rely on manual registers and paper-based records to track books and members. This leads to:
- Difficulty in finding available books quickly
- No easy way to track overdue books or collect fines
- Risk of data loss due to physical damage to records
- Slow and inefficient member registration and book issuing process

This project addresses all of the above problems through a structured digital system.

---

## 3. Objectives

- Provide a menu-driven interface for easy navigation
- Allow librarians to add, view, search, and delete books
- Register and manage library members
- Issue (borrow) and return books with due date tracking
- Automatically calculate fines for overdue returns (₹5 per day)
- Generate summary reports on library status
- Store all data persistently using JSON files so data is not lost on exit

---

## 4. Scope of the Project

This system covers the following functional areas:

| Module              | Features                                              |
|---------------------|-------------------------------------------------------|
| Book Management     | Add, View, Search, Delete books                       |
| Member Management   | Register, View, Search members                        |
| Borrow / Return     | Issue books, return books, view all borrow records    |
| Fine Calculation    | Auto-calculate overdue fines at ₹5/day                |
| Reports             | Summary of total books, members, borrows, fines       |
| Data Persistence    | JSON-based file storage (books.json, members.json, records.json) |

---

## 5. System Design

### 5.1 Data Structures

**Books** (stored in `books.json`):
```json
{
  "B001": {
    "title": "Python Programming",
    "author": "Guido van Rossum",
    "genre": "Technology",
    "copies": 3,
    "available": 2
  }
}
```

**Members** (stored in `members.json`):
```json
{
  "M001": {
    "name": "Sanket Pal",
    "email": "sanket@example.com",
    "phone": "9876543210",
    "borrowed_books": ["B001"]
  }
}
```

**Records** (stored in `records.json`):
```json
{
  "R0001": {
    "member_id": "M001",
    "book_id": "B001",
    "borrow_date": "2026-05-01",
    "due_date": "2026-05-15",
    "return_date": null,
    "fine": 0
  }
}
```

### 5.2 Module Flow

```
Main Menu
├── 1. Book Management
│     ├── Add Book
│     ├── View All Books
│     ├── Search Book
│     └── Delete Book
├── 2. Member Management
│     ├── Register Member
│     ├── View All Members
│     └── Search Member
├── 3. Borrow / Return
│     ├── Borrow a Book
│     ├── Return a Book
│     └── View All Records
├── 4. View Reports
└── 5. Exit
```

---

## 6. Features

- **Persistent Storage**: All data is saved to JSON files. No data is lost when the program exits.
- **Availability Tracking**: The system tracks how many copies of each book are available in real time.
- **Due Date & Fine System**: When a book is borrowed, a 14-day due date is set. If returned late, a fine of ₹5 per overdue day is calculated automatically.
- **Search Functionality**: Books can be searched by title or author; members can be searched by name or ID.
- **Input Validation**: The system validates user inputs and shows appropriate error messages.
- **Clean Tabular Output**: All records are displayed in formatted tables for easy reading.

---

## 7. Technologies Used

| Technology | Purpose                          |
|------------|----------------------------------|
| Python 3   | Core programming language        |
| JSON       | Data storage (file-based DB)     |
| `datetime` | Due date and fine calculation    |
| `os`       | File existence checks            |

---

## 8. Limitations

- This is a console-based application; it does not have a graphical user interface (GUI).
- Data is stored in local JSON files, not a database like MySQL or SQLite.
- No login/authentication system is implemented in this version.
- Designed for single-user use (no multi-user or network support).

---

## 9. Future Enhancements

- Add a GUI using **Tkinter** or **PyQt**
- Integrate a proper database (**SQLite** or **MySQL**)
- Add user authentication (Admin / Librarian login)
- Generate PDF reports for borrowing history
- Send email/SMS reminders for overdue books
- Add a web-based interface using **Flask** or **Django**

---

## 10. Conclusion

The Library Management System successfully automates the core operations of a library in a simple, efficient, and user-friendly manner. It demonstrates the practical use of Python programming concepts including dictionaries, file I/O, functions, loops, and date/time handling. This project serves as a strong foundation that can be extended into a full-scale library management application with a database and GUI in the future.

---

*Project developed as a Micro Project for academic purposes.*
