# How to Connect MongoDB Compass to Your BookConnect Database

## Quick Connection Steps:

1. **Open MongoDB Compass**
2. **Click the "+ Add new connection" button** (green button in the left sidebar)
3. **Enter the connection string:**
   ```
   mongodb://localhost:27017/book_connect
   ```
   Or use the simplified form:
   - **Host:** `localhost`
   - **Port:** `27017`
   - **Database:** `book_connect` (optional - can leave blank)

4. **Click "Connect"**

## Understanding MongoDB Databases:

- **MongoDB creates databases automatically** when you first write data to them
- Your app connects to `mongodb://localhost:27017/book_connect`
- The database `book_connect` will appear in Compass **after** you:
  - Register a user
  - Add a book
  - Create a review
  - Or run the seed script

## Collections You'll See:

Once data is created, you'll see these collections:
- `users` - User accounts
- `books` - Book listings
- `reviews` - Book reviews
- `sessions` - User sessions (created automatically)

## Current Status:

Right now, your database is empty (0 users, 0 books, 0 reviews), which is why you don't see it in Compass yet. The application is running fine - it just hasn't created any data yet!













