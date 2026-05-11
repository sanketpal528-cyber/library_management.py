"""
Library Management System
A console-based application to manage books, members, and borrowing records.
"""

import json
import os
from datetime import datetime, timedelta

# ─── File paths for persistent storage ───────────────────────────────────────
BOOKS_FILE    = "books.json"
MEMBERS_FILE  = "members.json"
RECORDS_FILE  = "records.json"

# ─── Data loading / saving ────────────────────────────────────────────────────

def load_data(filepath):
    """Load JSON data from a file. Returns empty dict if file doesn't exist."""
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            return json.load(f)
    return {}

def save_data(filepath, data):
    """Save data as JSON to a file."""
    with open(filepath, "w") as f:
        json.dump(data, f, indent=4)

# ─── Book Management ──────────────────────────────────────────────────────────

def add_book(books):
    print("\n--- Add Book ---")
    book_id = input("Enter Book ID       : ").strip()
    if book_id in books:
        print("⚠  A book with this ID already exists.")
        return
    title   = input("Enter Book Title    : ").strip()
    author  = input("Enter Author Name   : ").strip()
    genre   = input("Enter Genre         : ").strip()
    copies  = input("Enter No. of Copies : ").strip()

    if not title or not author or not copies.isdigit():
        print("⚠  Invalid input. Book not added.")
        return

    books[book_id] = {
        "title"    : title,
        "author"   : author,
        "genre"    : genre,
        "copies"   : int(copies),
        "available": int(copies)
    }
    save_data(BOOKS_FILE, books)
    print(f"✔  Book '{title}' added successfully.")

def view_books(books):
    print("\n--- All Books ---")
    if not books:
        print("No books in the library yet.")
        return
    print(f"{'ID':<10} {'Title':<30} {'Author':<25} {'Genre':<15} {'Copies':<8} {'Available'}")
    print("-" * 100)
    for bid, b in books.items():
        print(f"{bid:<10} {b['title']:<30} {b['author']:<25} {b['genre']:<15} {b['copies']:<8} {b['available']}")

def search_book(books):
    print("\n--- Search Book ---")
    keyword = input("Enter title or author to search: ").strip().lower()
    results = {bid: b for bid, b in books.items()
               if keyword in b["title"].lower() or keyword in b["author"].lower()}
    if not results:
        print("No matching books found.")
    else:
        view_books(results)

def delete_book(books):
    print("\n--- Delete Book ---")
    book_id = input("Enter Book ID to delete: ").strip()
    if book_id not in books:
        print("⚠  Book ID not found.")
        return
    confirm = input(f"Delete '{books[book_id]['title']}'? (yes/no): ").strip().lower()
    if confirm == "yes":
        del books[book_id]
        save_data(BOOKS_FILE, books)
        print("✔  Book deleted.")
    else:
        print("Deletion cancelled.")

# ─── Member Management ────────────────────────────────────────────────────────

def add_member(members):
    print("\n--- Add Member ---")
    member_id = input("Enter Member ID   : ").strip()
    if member_id in members:
        print("⚠  Member ID already exists.")
        return
    name  = input("Enter Member Name : ").strip()
    email = input("Enter Email       : ").strip()
    phone = input("Enter Phone No.   : ").strip()

    if not name:
        print("⚠  Name cannot be empty.")
        return

    members[member_id] = {
        "name"           : name,
        "email"          : email,
        "phone"          : phone,
        "borrowed_books" : []
    }
    save_data(MEMBERS_FILE, members)
    print(f"✔  Member '{name}' registered successfully.")

def view_members(members):
    print("\n--- All Members ---")
    if not members:
        print("No members registered yet.")
        return
    print(f"{'ID':<10} {'Name':<25} {'Email':<30} {'Phone':<15} {'Books Borrowed'}")
    print("-" * 95)
    for mid, m in members.items():
        print(f"{mid:<10} {m['name']:<25} {m['email']:<30} {m['phone']:<15} {len(m['borrowed_books'])}")

def search_member(members):
    print("\n--- Search Member ---")
    keyword = input("Enter name or ID to search: ").strip().lower()
    results = {mid: m for mid, m in members.items()
               if keyword in m["name"].lower() or keyword == mid.lower()}
    if not results:
        print("No matching members found.")
    else:
        view_members(results)

# ─── Borrow / Return ──────────────────────────────────────────────────────────

def borrow_book(books, members, records):
    print("\n--- Borrow Book ---")
    member_id = input("Enter Member ID : ").strip()
    if member_id not in members:
        print("⚠  Member not found.")
        return
    book_id = input("Enter Book ID   : ").strip()
    if book_id not in books:
        print("⚠  Book not found.")
        return
    if books[book_id]["available"] <= 0:
        print("⚠  No copies available right now.")
        return

    # Check if member already borrowed this book
    if book_id in members[member_id]["borrowed_books"]:
        print("⚠  Member has already borrowed this book.")
        return

    # Update records
    record_id   = f"R{len(records) + 1:04d}"
    borrow_date = datetime.now().strftime("%Y-%m-%d")
    due_date    = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")

    records[record_id] = {
        "member_id"  : member_id,
        "book_id"    : book_id,
        "borrow_date": borrow_date,
        "due_date"   : due_date,
        "return_date": None,
        "fine"       : 0
    }

    books[book_id]["available"] -= 1
    members[member_id]["borrowed_books"].append(book_id)

    save_data(BOOKS_FILE, books)
    save_data(MEMBERS_FILE, members)
    save_data(RECORDS_FILE, records)

    print(f"✔  Book '{books[book_id]['title']}' borrowed by {members[member_id]['name']}.")
    print(f"   Due Date: {due_date}  |  Record ID: {record_id}")

def return_book(books, members, records):
    print("\n--- Return Book ---")
    record_id = input("Enter Record ID : ").strip()
    if record_id not in records:
        print("⚠  Record not found.")
        return

    record = records[record_id]
    if record["return_date"]:
        print("⚠  This book has already been returned.")
        return

    return_date = datetime.now().strftime("%Y-%m-%d")
    due         = datetime.strptime(record["due_date"], "%Y-%m-%d")
    today       = datetime.now()
    fine        = 0

    if today > due:
        overdue_days = (today - due).days
        fine = overdue_days * 5  # ₹5 per day fine
        print(f"⚠  Book is {overdue_days} day(s) overdue. Fine: ₹{fine}")

    record["return_date"] = return_date
    record["fine"]        = fine

    book_id   = record["book_id"]
    member_id = record["member_id"]

    books[book_id]["available"] += 1
    if book_id in members[member_id]["borrowed_books"]:
        members[member_id]["borrowed_books"].remove(book_id)

    save_data(BOOKS_FILE, books)
    save_data(MEMBERS_FILE, members)
    save_data(RECORDS_FILE, records)

    print(f"✔  Book returned successfully. Fine collected: ₹{fine}")

def view_records(records, books, members):
    print("\n--- Borrow / Return Records ---")
    if not records:
        print("No records found.")
        return
    print(f"{'Record ID':<12} {'Member':<20} {'Book':<25} {'Borrowed':<12} {'Due':<12} {'Returned':<12} {'Fine'}")
    print("-" * 105)
    for rid, r in records.items():
        member_name = members.get(r["member_id"], {}).get("name", "Unknown")
        book_title  = books.get(r["book_id"], {}).get("title", "Unknown")
        returned    = r["return_date"] if r["return_date"] else "Pending"
        print(f"{rid:<12} {member_name:<20} {book_title:<25} {r['borrow_date']:<12} {r['due_date']:<12} {returned:<12} ₹{r['fine']}")

# ─── Reports ──────────────────────────────────────────────────────────────────

def show_reports(books, members, records):
    print("\n========== LIBRARY REPORT ==========")
    total_books     = sum(b["copies"] for b in books.values())
    available_books = sum(b["available"] for b in books.values())
    borrowed_books  = total_books - available_books
    total_members   = len(members)
    active_borrows  = sum(1 for r in records.values() if not r["return_date"])
    total_fines     = sum(r["fine"] for r in records.values())

    print(f"  Total Book Titles   : {len(books)}")
    print(f"  Total Book Copies   : {total_books}")
    print(f"  Available Copies    : {available_books}")
    print(f"  Currently Borrowed  : {borrowed_books}")
    print(f"  Total Members       : {total_members}")
    print(f"  Active Borrows      : {active_borrows}")
    print(f"  Total Fines Collected: ₹{total_fines}")
    print("=====================================")

# ─── Sub-menus ────────────────────────────────────────────────────────────────

def book_menu(books):
    while True:
        print("\n--- Book Management ---")
        print("1. Add Book")
        print("2. View All Books")
        print("3. Search Book")
        print("4. Delete Book")
        print("5. Back to Main Menu")
        choice = input("Enter choice: ").strip()
        if   choice == "1": add_book(books)
        elif choice == "2": view_books(books)
        elif choice == "3": search_book(books)
        elif choice == "4": delete_book(books)
        elif choice == "5": break
        else: print("Invalid choice.")

def member_menu(members):
    while True:
        print("\n--- Member Management ---")
        print("1. Register Member")
        print("2. View All Members")
        print("3. Search Member")
        print("5. Back to Main Menu")
        choice = input("Enter choice: ").strip()
        if   choice == "1": add_member(members)
        elif choice == "2": view_members(members)
        elif choice == "3": search_member(members)
        elif choice == "5": break
        else: print("Invalid choice.")

def borrow_menu(books, members, records):
    while True:
        print("\n--- Borrow / Return ---")
        print("1. Borrow a Book")
        print("2. Return a Book")
        print("3. View All Records")
        print("4. Back to Main Menu")
        choice = input("Enter choice: ").strip()
        if   choice == "1": borrow_book(books, members, records)
        elif choice == "2": return_book(books, members, records)
        elif choice == "3": view_records(records, books, members)
        elif choice == "4": break
        else: print("Invalid choice.")

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    # Load persistent data
    books   = load_data(BOOKS_FILE)
    members = load_data(MEMBERS_FILE)
    records = load_data(RECORDS_FILE)

    print("=" * 45)
    print("   WELCOME TO LIBRARY MANAGEMENT SYSTEM")
    print("=" * 45)

    while True:
        print("\n========== MAIN MENU ==========")
        print("1. Book Management")
        print("2. Member Management")
        print("3. Borrow / Return Books")
        print("4. View Reports")
        print("5. Exit")
        print("================================")
        choice = input("Enter your choice: ").strip()

        if   choice == "1": book_menu(books)
        elif choice == "2": member_menu(members)
        elif choice == "3": borrow_menu(books, members, records)
        elif choice == "4": show_reports(books, members, records)
        elif choice == "5":
            print("\nThank you for using the Library Management System. Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
