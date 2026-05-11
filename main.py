books = {}

while True:
    print("\n===== LIBRARY MANAGEMENT SYSTEM =====")
    print("1. Add Book")
    print("2. View Books")
    print("3. Exit")

    choice = input("Enter your choice: ")

    if choice == '1':
        book_id = input("Enter Book ID: ")
        book_name = input("Enter Book Name: ")

        books[book_id] = book_name
        print("Book Added Successfully")

    elif choice == '2':
        print("\nAvailable Books:")
        for book_id, book_name in books.items():
            print(book_id, "-", book_name)

    elif choice == '3':
        print("Exiting Program...")
        break

    else:
        print("Invalid Choice")