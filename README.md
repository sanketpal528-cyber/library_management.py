# 📚 Library Management System

[![GitHub Pages](https://img.shields.io/badge/Live%20Site-GitHub%20Pages-6c63ff?style=flat-square&logo=github)](https://sanketpal528-cyber.github.io/library_management.py/)
[![Version](https://img.shields.io/badge/Version-1.2.0-06d6a0?style=flat-square)](CHANGELOG.md)
[![License](https://img.shields.io/badge/License-MIT-f72585?style=flat-square)](LICENSE)
[![Made with](https://img.shields.io/badge/Made%20with-HTML%20CSS%20JS-ffd166?style=flat-square)](index.html)

A web-based Library Management System built with HTML, CSS, and JavaScript.

## 🌐 Live Website

**👉 [https://sanketpal528-cyber.github.io/library_management.py/](https://sanketpal528-cyber.github.io/library_management.py/)**

> To activate the live link, enable GitHub Pages:
> 1. Go to your repo on GitHub
> 2. Click **Settings** → **Pages**
> 3. Under **Source**, select **Deploy from a branch**
> 4. Choose **main** branch, **/ (root)** folder → click **Save**
> 5. Wait ~1 minute, then visit the link above ✅

---

## Features

- 📖 Add, view, search, and delete books with availability tracking
- 👤 Register and manage library members
- 🔄 Borrow and return books with 14-day due dates
- 💰 Automatic fine calculation (₹5/day for overdue returns)
- 📋 Filterable borrow/return records (Active / Returned / Overdue)
- 📊 Live dashboard and reports
- 💾 Data saved in browser `localStorage` — no server needed

## How to Run Locally

Just open `index.html` in any browser — no installation required.

## Project Structure

```
├── index.html       # Main website page
├── style.css        # Styling and layout
├── app.js           # All logic (books, members, borrow, fines, reports)
├── main.py          # Console-based version (Python)
├── synopsis.md      # Project synopsis
└── README.md        # This file
```

## Tech Stack

| Technology   | Purpose                              |
|--------------|--------------------------------------|
| HTML5        | Page structure                       |
| CSS3         | Styling, responsive layout           |
| JavaScript   | Logic, CRUD, fine calculation        |
| localStorage | Persistent data storage in browser   |

## Website Sections

```
Navbar
├── Dashboard      → Live stats (books, members, borrows, fines)
├── Books          → Add / Edit / Delete / Search books
├── Members        → Register / Edit / Delete / Search members
├── Borrow/Return  → Issue books, return with live fine preview
├── Records        → Full history with filters
└── Reports        → Summary stats + top books + overdue list
```
