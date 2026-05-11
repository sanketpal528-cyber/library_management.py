# 📚 Library Management System — Full Project Documentation

**Student Name:** Sanket Pal
**Project Title:** Library Management System
**Technology:** HTML5 · CSS3 · JavaScript · localStorage
**Date:** May 2026
**🌐 Live Website:** [https://sanketpal528-cyber.github.io/library_management.py/](https://sanketpal528-cyber.github.io/library_management.py/)
**📁 GitHub Repo:** [https://github.com/sanketpal528-cyber/library_management.py](https://github.com/sanketpal528-cyber/library_management.py)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Use Case Diagram](#3-use-case-diagram)
4. [Class Diagram](#4-class-diagram)
5. [Entity Relationship Diagram](#5-entity-relationship-diagram)
6. [Sequence Diagrams](#6-sequence-diagrams)
7. [Activity Diagrams](#7-activity-diagrams)
8. [State Diagram](#8-state-diagram)
9. [Component Diagram](#9-component-diagram)
10. [Data Flow Diagram](#10-data-flow-diagram)
11. [Module Descriptions](#11-module-descriptions)
12. [File Structure](#12-file-structure)
13. [Data Schema](#13-data-schema)
14. [Feature List](#14-feature-list)
15. [Technologies Used](#15-technologies-used)

---

## 1. Project Overview

The **Library Management System (LMS)** is a fully client-side web application that automates the core operations of a library. It allows a librarian to manage books, register members, issue and return books, track overdue fines, and view reports — all from a browser with no server or installation required.

### Key Highlights

| Property | Detail |
|---|---|
| Type | Web Application (Client-Side) |
| Language | HTML5, CSS3, JavaScript (ES6+) |
| Storage | Browser `localStorage` |
| Deployment | GitHub Pages |
| Fine Rate | ₹5 per overdue day |
| Loan Period | 14 days per book |

---

## 2. System Architecture

```mermaid
graph TB
    subgraph Browser["🌐 Browser (Client)"]
        direction TB
        UI["🖥️ index.html\nUser Interface"]
        CSS["🎨 style.css\nStyling & Animations"]
        JS["⚙️ app.js\nBusiness Logic"]
        LS[("💾 localStorage\nData Persistence")]

        UI --> CSS
        UI --> JS
        JS --> LS
        LS --> JS
    end

    subgraph GitHub["☁️ GitHub"]
        REPO["📁 Repository\nmain branch"]
        PAGES["🌐 GitHub Pages\nStatic Hosting"]
        ACTIONS["⚡ GitHub Actions\nCI/CD Deploy"]

        REPO --> ACTIONS
        ACTIONS --> PAGES
    end

    User["👤 Librarian"] --> Browser
    Browser --> GitHub
```

---

## 3. Use Case Diagram

```mermaid
graph TD
    A([👤 Librarian])

    subgraph BM["📖 Book Management"]
        B1[Add Book]
        B2[Edit Book]
        B3[Delete Book]
        B4[Search Book]
        B5[View All Books]
    end

    subgraph MM["👥 Member Management"]
        M1[Register Member]
        M2[Edit Member]
        M3[Delete Member]
        M4[Search Member]
        M5[View All Members]
    end

    subgraph BR["🔄 Borrow / Return"]
        R1[Borrow Book]
        R2[Return Book]
        R3[View Records]
        R4[Filter Records]
    end

    subgraph RP["📊 Reports"]
        P1[View Dashboard]
        P2[View Statistics]
        P3[Top Borrowed Books]
        P4[Overdue List]
    end

    A --> BM
    A --> MM
    A --> BR
    A --> RP

    R1 -.->|includes| RC1([Calculate Due Date])
    R2 -.->|includes| RC2([Calculate Fine])
    RC2 -.->|includes| RC3([Update Availability])
    R1 -.->|includes| RC3
```

---

## 4. Class Diagram

```mermaid
classDiagram
    direction TB

    class Library {
        -Object books
        -Object members
        -Object records
        +loadData(key) Object
        +saveData(key, data) void
        +getDashboardStats() Object
        +generateReport() Object
    }

    class Book {
        +String bookId
        +String title
        +String author
        +String genre
        +int copies
        +int available
        +addBook(data) void
        +editBook(id, data) void
        +deleteBook(id) void
        +searchBook(query) List
        +updateAvailability(id, delta) void
    }

    class Member {
        +String memberId
        +String name
        +String email
        +String phone
        +List~String~ borrowedBooks
        +register(data) void
        +editMember(id, data) void
        +deleteMember(id) void
        +searchMember(query) List
    }

    class BorrowRecord {
        +String recordId
        +String memberId
        +String bookId
        +String borrowDate
        +String dueDate
        +String returnDate
        +float fine
        +createRecord(mid, bid) String
        +processReturn(recordId) void
        +calculateFine(dueDate) float
        +isOverdue() bool
    }

    class FineCalculator {
        +int FINE_PER_DAY = 5
        +int LOAN_DAYS = 14
        +calculate(dueDate, returnDate) float
        +getDaysOverdue(dueDate) int
        +previewFine(recordId) float
    }

    Library "1" *-- "many" Book : contains
    Library "1" *-- "many" Member : contains
    Library "1" *-- "many" BorrowRecord : contains
    BorrowRecord "many" --> "1" Book : references
    BorrowRecord "many" --> "1" Member : references
    BorrowRecord --> FineCalculator : uses
```

---

## 5. Entity Relationship Diagram

```mermaid
erDiagram
    BOOK {
        string bookId PK
        string title
        string author
        string genre
        int copies
        int available
    }

    MEMBER {
        string memberId PK
        string name
        string email
        string phone
    }

    BORROW_RECORD {
        string recordId PK
        string memberId FK
        string bookId FK
        date borrowDate
        date dueDate
        date returnDate
        float fine
    }

    MEMBER ||--o{ BORROW_RECORD : "borrows"
    BOOK   ||--o{ BORROW_RECORD : "is borrowed in"
```

---

## 6. Sequence Diagrams

### 6.1 Add a Book

```mermaid
sequenceDiagram
    actor L as Librarian
    participant UI as index.html
    participant JS as app.js
    participant LS as localStorage

    L->>UI: Fill book form & click Add Book
    UI->>JS: saveBook(event)
    JS->>LS: load lms_books
    LS-->>JS: existing books

    alt Book ID already exists
        JS-->>UI: ❌ Toast — "Book ID already exists"
    else New book
        JS->>JS: Create book object
        JS->>LS: save lms_books
        JS-->>UI: ✅ Toast — "Book added successfully"
        JS->>UI: renderBooks()
    end
```

---

### 6.2 Borrow a Book

```mermaid
sequenceDiagram
    actor L as Librarian
    participant UI as index.html
    participant JS as app.js
    participant LS as localStorage

    L->>UI: Enter Member ID + Book ID
    UI->>JS: borrowBook(event)
    JS->>LS: load books, members, records
    LS-->>JS: data

    alt Member not found
        JS-->>UI: ❌ Toast — "Member not found"
    else Book not found
        JS-->>UI: ❌ Toast — "Book not found"
    else No copies available
        JS-->>UI: ❌ Toast — "No copies available"
    else Already borrowed
        JS-->>UI: ❌ Toast — "Already borrowed"
    else All valid
        JS->>JS: recordId = R + padded count
        JS->>JS: dueDate = today + 14 days
        JS->>JS: books[id].available--
        JS->>JS: member.borrowedBooks.push(bookId)
        JS->>LS: save books, members, records
        JS-->>UI: ✅ Toast with Record ID & Due Date
    end
```

---

### 6.3 Return a Book

```mermaid
sequenceDiagram
    actor L as Librarian
    participant UI as index.html
    participant JS as app.js
    participant FC as FineCalculator
    participant LS as localStorage

    L->>UI: Type Record ID (live preview)
    UI->>JS: oninput → previewFine()
    JS->>LS: load records
    LS-->>JS: record data
    JS->>FC: calculate(dueDate, today)
    FC-->>JS: fine amount
    JS-->>UI: Show fine preview banner

    L->>UI: Click Return Book
    UI->>JS: returnBook(event)

    alt Record not found
        JS-->>UI: ❌ Toast — "Record not found"
    else Already returned
        JS-->>UI: ❌ Toast — "Already returned"
    else Valid
        JS->>FC: calculateFine(dueDate)
        FC-->>JS: fine (₹5 × overdue days)
        JS->>JS: record.returnDate = today
        JS->>JS: record.fine = fine
        JS->>JS: books[id].available++
        JS->>JS: remove bookId from member.borrowedBooks
        JS->>LS: save all data
        JS-->>UI: ✅ Toast — fine collected
    end
```

---

### 6.4 View Reports

```mermaid
sequenceDiagram
    actor L as Librarian
    participant UI as index.html
    participant JS as app.js
    participant LS as localStorage

    L->>UI: Click Reports in navbar
    UI->>JS: showSection('reports')
    JS->>JS: renderReports()
    JS->>LS: load books, members, records
    LS-->>JS: all data
    JS->>JS: Calculate stats
    JS->>JS: Sort top borrowed books
    JS->>JS: Filter overdue records
    JS-->>UI: Render stat cards
    JS-->>UI: Render top books list
    JS-->>UI: Render overdue list
```

---

## 7. Activity Diagrams

### 7.1 Complete Borrow → Return Flow

```mermaid
flowchart TD
    START([🟢 Start]) --> OPEN[Open Borrow Section]
    OPEN --> ENTER[Enter Member ID & Book ID]
    ENTER --> CHK_M{Member\nexists?}
    CHK_M -- ❌ No --> ERR1[Show Error Toast] --> ENTER
    CHK_M -- ✅ Yes --> CHK_B{Book\nexists?}
    CHK_B -- ❌ No --> ERR2[Show Error Toast] --> ENTER
    CHK_B -- ✅ Yes --> CHK_A{Copies\navailable?}
    CHK_A -- ❌ No --> ERR3[Show Error Toast] --> ENTER
    CHK_A -- ✅ Yes --> CHK_DUP{Already\nborrowed?}
    CHK_DUP -- ❌ Yes --> ERR4[Show Error Toast] --> ENTER
    CHK_DUP -- ✅ No --> CREATE[Create BorrowRecord]
    CREATE --> DUE[Set dueDate = Today + 14 days]
    DUE --> DEC[Decrease book availability]
    DEC --> SAVE1[Save to localStorage]
    SAVE1 --> TOAST1[✅ Show success toast]
    TOAST1 --> WAIT([⏳ 14 days pass...])

    WAIT --> RET[Open Return Section]
    RET --> ENTER_R[Enter Record ID]
    ENTER_R --> PREVIEW[Live fine preview shown]
    PREVIEW --> CHK_R{Record\nvalid?}
    CHK_R -- ❌ No --> ERR5[Show Error Toast] --> ENTER_R
    CHK_R -- ✅ Yes --> CHK_RET{Already\nreturned?}
    CHK_RET -- ❌ Yes --> ERR6[Show Error Toast] --> ENTER_R
    CHK_RET -- ✅ No --> CHK_OD{Overdue?}
    CHK_OD -- ✅ Yes --> FINE[Fine = Days × ₹5]
    CHK_OD -- ❌ No --> NOFINE[Fine = ₹0]
    FINE --> UPDATE[Set returnDate = Today]
    NOFINE --> UPDATE
    UPDATE --> INC[Increase book availability]
    INC --> SAVE2[Save to localStorage]
    SAVE2 --> TOAST2[✅ Show fine toast]
    TOAST2 --> END([🔴 End])
```

---

### 7.2 Member Registration Flow

```mermaid
flowchart TD
    A([Start]) --> B[Open Members Section]
    B --> C[Fill Registration Form]
    C --> D{Member ID\nalready exists?}
    D -- Yes --> E[Show Error Toast] --> C
    D -- No --> F{Name\nempty?}
    F -- Yes --> G[Show Error Toast] --> C
    F -- No --> H[Create Member Object]
    H --> I[borrowedBooks = empty list]
    I --> J[Save to localStorage]
    J --> K[Show success toast]
    K --> L[Refresh members table]
    L --> M([End])
```

---

## 8. State Diagram

### Book Availability States

```mermaid
stateDiagram-v2
    [*] --> Available : Book Added\n(copies > 0)

    Available --> LowStock : available < 40%\nof total copies

    LowStock --> Available : Book Returned

    Available --> OutOfStock : available = 0\n(all copies borrowed)

    LowStock --> OutOfStock : Last copy borrowed

    OutOfStock --> Available : Book Returned\n(available > 40%)

    OutOfStock --> LowStock : Book Returned\n(available < 40%)

    Available --> [*] : Book Deleted
    LowStock --> [*] : Book Deleted
    OutOfStock --> [*] : Book Deleted
```

---

### Borrow Record States

```mermaid
stateDiagram-v2
    [*] --> Active : Book Issued\n(returnDate = null)

    Active --> Overdue : today > dueDate

    Overdue --> Returned : Book Returned\n(fine calculated)

    Active --> Returned : Book Returned\n(on time, fine = 0)

    Returned --> [*]
```

---

## 9. Component Diagram

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend Layer"]
        HTML["index.html\n─────────────\n• Navbar\n• Dashboard Section\n• Books Section\n• Members Section\n• Borrow/Return Section\n• Records Section\n• Reports Section\n• Toast Component\n• Modal Component"]

        CSS["style.css\n─────────────\n• Dark Theme Variables\n• Glassmorphism Cards\n• Animations & Transitions\n• Responsive Grid\n• Button Styles\n• Table Styles\n• Badge Styles"]

        JS["app.js\n─────────────\n• Navigation Controller\n• Book CRUD\n• Member CRUD\n• Borrow Logic\n• Return Logic\n• Fine Calculator\n• Report Generator\n• Toast Manager\n• Modal Manager"]
    end

    subgraph Storage["💾 Storage Layer"]
        LS1[("lms_books")]
        LS2[("lms_members")]
        LS3[("lms_records")]
    end

    subgraph External["🌍 External Resources"]
        GF["Google Fonts\n(Poppins, Inter)"]
        FA["Font Awesome 6\n(Icons)"]
    end

    HTML --> CSS
    HTML --> JS
    JS --> LS1
    JS --> LS2
    JS --> LS3
    HTML --> GF
    HTML --> FA
```

---

## 10. Data Flow Diagram

### Level 0 — Context Diagram

```mermaid
graph LR
    L([👤 Librarian]) -->|Book/Member/Borrow data| SYS["📚 Library\nManagement\nSystem"]
    SYS -->|Reports, Records, Confirmations| L
    SYS <-->|Read/Write| DB[("💾 localStorage")]
```

---

### Level 1 — Detailed DFD

```mermaid
graph TD
    L([👤 Librarian])

    P1["1.0\nBook\nManagement"]
    P2["2.0\nMember\nManagement"]
    P3["3.0\nBorrow\nProcess"]
    P4["4.0\nReturn\nProcess"]
    P5["5.0\nReport\nGenerator"]

    DS1[("📖 Books Store\nlms_books")]
    DS2[("👥 Members Store\nlms_members")]
    DS3[("📋 Records Store\nlms_records")]

    L -->|Book details| P1
    P1 -->|CRUD operations| DS1
    DS1 -->|Book list| L

    L -->|Member details| P2
    P2 -->|CRUD operations| DS2
    DS2 -->|Member list| L

    L -->|Member ID + Book ID| P3
    P3 -->|Read member| DS2
    P3 -->|Read & update book| DS1
    P3 -->|Write record| DS3
    DS3 -->|Record ID + Due Date| L

    L -->|Record ID| P4
    P4 -->|Read record| DS3
    P4 -->|Update availability| DS1
    P4 -->|Update borrowed list| DS2
    P4 -->|Write return + fine| DS3
    DS3 -->|Fine amount| L

    DS1 -->|All data| P5
    DS2 -->|All data| P5
    DS3 -->|All data| P5
    P5 -->|Dashboard & Reports| L
```

---

## 11. Module Descriptions

### 11.1 Dashboard Module
- Displays 6 live stat cards: Book Titles, Available Copies, Total Members, Active Borrows, Overdue Books, Fines Collected
- Quick action buttons to navigate to key sections
- Auto-refreshes every time the section is opened

### 11.2 Book Management Module
| Function | Description |
|---|---|
| `saveBook(event)` | Adds a new book or updates existing one |
| `editBook(id)` | Pre-fills form with existing book data |
| `deleteBook(id)` | Removes book after confirmation modal |
| `renderBooks()` | Renders filtered/searched book table |
| `cancelBookEdit()` | Resets form to add mode |

### 11.3 Member Management Module
| Function | Description |
|---|---|
| `saveMember(event)` | Registers new member or updates existing |
| `editMember(id)` | Pre-fills form with member data |
| `deleteMember(id)` | Deletes member (blocked if has active borrows) |
| `renderMembers()` | Renders filtered/searched member table |

### 11.4 Borrow / Return Module
| Function | Description |
|---|---|
| `borrowBook(event)` | Validates and issues a book, creates record |
| `returnBook(event)` | Processes return, calculates fine |
| `previewFine()` | Live fine preview on Record ID input |

### 11.5 Records Module
| Function | Description |
|---|---|
| `renderRecords()` | Renders records filtered by All/Active/Returned/Overdue |

### 11.6 Reports Module
| Function | Description |
|---|---|
| `renderReports()` | Calculates and displays all stats |
| Top Books | Counts borrow frequency per book, sorts descending |
| Overdue List | Filters active records past due date |

---

## 12. File Structure

```
micro project/
│
├── index.html                          # Main website (all sections)
├── style.css                           # Dark theme, animations, responsive
├── app.js                              # All JavaScript logic
│
├── main.py                             # Console-based Python version
│
├── README.md                           # Project readme with live link
├── synopsis.md                         # Academic synopsis with UML
├── PROJECT_DOCUMENTATION.md           # This file — full documentation
│
├── Library_Management_System_Design.pdf
├── Library_Management_System_Synopsis.pdf
│
└── .github/
    └── workflows/
        └── deploy.yml                  # GitHub Actions — auto deploy to Pages
```

---

## 13. Data Schema

All data is stored in browser `localStorage` as JSON strings.

### lms_books
```json
{
  "B001": {
    "title": "Python Programming",
    "author": "Guido van Rossum",
    "genre": "Technology",
    "copies": 3,
    "available": 2
  },
  "B002": {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "genre": "Software Engineering",
    "copies": 2,
    "available": 2
  }
}
```

### lms_members
```json
{
  "M001": {
    "name": "Sanket Pal",
    "email": "sanket@example.com",
    "phone": "9876543210",
    "borrowedBooks": ["B001"]
  },
  "M002": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9123456789",
    "borrowedBooks": []
  }
}
```

### lms_records
```json
{
  "R0001": {
    "memberId": "M001",
    "bookId": "B001",
    "borrowDate": "2026-05-01",
    "dueDate": "2026-05-15",
    "returnDate": null,
    "fine": 0
  },
  "R0002": {
    "memberId": "M002",
    "bookId": "B002",
    "borrowDate": "2026-04-20",
    "dueDate": "2026-05-04",
    "returnDate": "2026-05-10",
    "fine": 30
  }
}
```

---

## 14. Feature List

| # | Feature | Status |
|---|---|---|
| 1 | Add / Edit / Delete Books | ✅ Done |
| 2 | Search Books by title or author | ✅ Done |
| 3 | Book availability tracking (copies vs available) | ✅ Done |
| 4 | Availability badges (Available / Low Stock / Out of Stock) | ✅ Done |
| 5 | Register / Edit / Delete Members | ✅ Done |
| 6 | Search Members by name or ID | ✅ Done |
| 7 | Borrow book with 14-day due date | ✅ Done |
| 8 | Return book with fine calculation (₹5/day) | ✅ Done |
| 9 | Live fine preview while typing Record ID | ✅ Done |
| 10 | Borrow records with filter (All/Active/Returned/Overdue) | ✅ Done |
| 11 | Dashboard with 6 live stat cards | ✅ Done |
| 12 | Reports — top borrowed books + overdue list | ✅ Done |
| 13 | Data persistence via localStorage | ✅ Done |
| 14 | Toast notifications for all actions | ✅ Done |
| 15 | Confirm modal for destructive actions | ✅ Done |
| 16 | Responsive design (mobile + desktop) | ✅ Done |
| 17 | Dark theme with glassmorphism UI | ✅ Done |
| 18 | Animated page transitions | ✅ Done |
| 19 | Font Awesome icons throughout | ✅ Done |
| 20 | GitHub Actions auto-deploy to GitHub Pages | ✅ Done |

---

## 15. Technologies Used

| Technology | Version | Purpose |
|---|---|---|
| HTML5 | — | Page structure, semantic markup |
| CSS3 | — | Styling, animations, responsive layout |
| JavaScript | ES6+ | All business logic and DOM manipulation |
| localStorage API | — | Client-side persistent data storage |
| Google Fonts | — | Poppins (headings), Inter (body) |
| Font Awesome | 6.5 | Icons throughout the UI |
| GitHub Pages | — | Free static site hosting |
| GitHub Actions | — | CI/CD auto-deployment pipeline |
| Mermaid | — | UML diagrams in Markdown |

---

*Full project documentation — Library Management System Micro Project, May 2026*
*Developed by Sanket Pal*
