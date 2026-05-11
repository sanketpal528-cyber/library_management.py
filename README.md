# 📚 Library Management System

A console-based Library Management System built with Python 3.

## Features
- Add, view, search, and delete books
- Register and manage library members
- Borrow and return books with 14-day due dates
- Automatic fine calculation (₹5/day for overdue returns)
- Persistent data storage using JSON files
- Summary reports

## How to Run

```bash
python main.py
```

No external libraries required — uses only Python standard library.

## Project Structure

```
├── main.py          # Main application
├── books.json       # Book data (auto-created)
├── members.json     # Member data (auto-created)
├── records.json     # Borrow/return records (auto-created)
├── synopsis.md      # Project synopsis
└── README.md        # This file
```

## Menu Overview

```
Main Menu
├── 1. Book Management     → Add / View / Search / Delete books
├── 2. Member Management   → Register / View / Search members
├── 3. Borrow / Return     → Issue books, return books, view records
├── 4. View Reports        → Library summary statistics
└── 5. Exit
```
