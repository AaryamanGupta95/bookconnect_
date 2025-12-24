# 📚 BookConnect

A modern book review and discussion platform where readers can discover books, share reviews, chat with fellow readers, and explore author profiles.

## ✨ Features

- 📖 **Book Management**: Browse, search, and discover books
- ⭐ **Reviews & Ratings**: Share and read book reviews
- 💬 **Real-time Chat**: Connect with fellow readers
- 👤 **Author Profiles**: Explore authors and their works
- 🔐 **User Authentication**: Secure login and registration
- 👨‍💼 **Admin Dashboard**: Manage books and reviews
- 🔍 **Advanced Search**: Filter by title, author, ISBN

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Redis (optional, for session storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BookConnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open: `http://localhost:3000` (or `https://localhost:3000` if HTTPS is configured)
   - Register a new account or use admin credentials

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available options. Key variables:

- `MONGODB_URI`: MongoDB connection string (required)
- `REDIS_URL`: Redis connection URL (optional)
- `SESSION_SECRET`: Secret for session encryption (required)
- `PORT`: Server port (default: 3000)
- `ADMIN_EMAIL`: Email with admin access (optional)

### Admin Access

Default admin credentials:
- Email: `host@bookconnect.com`
- Password: `host123`

Or create admin user:
```bash
node cli/create-admin.js admin@bookconnect.com admin123 admin
```

Then add to `.env`:
```
ADMIN_EMAIL=admin@bookconnect.com
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy Options:**
- **Render**: Free tier available, easy setup
- **Railway**: $5 credit/month, simple deployment
- **Vercel**: Great for frontend + API
- **Heroku**: Classic platform (paid)

## 🛠️ Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed:mongo` - Seed MongoDB with sample data

### Project Structure

```
BookConnect/
├── controllers/     # Route controllers
├── models-mongo/    # MongoDB models
├── routes/          # Express routes
├── views/           # EJS templates
├── public/          # Static files (CSS, uploads)
├── utils/           # Utility functions
├── cli/             # CLI scripts
└── server.js        # Main server file
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Admin Credentials](./ADMIN_CREDENTIALS.md)
- [HTTPS Setup](./HTTPS_SETUP.md)
- [Edge HTTPS Fix](./EDGE_FIX_COMPLETE.md)
- [Features Added](./FEATURES_ADDED.md)

## 🔒 Security

- Password hashing with bcrypt
- Session management with Redis + MongoDB
- Environment variable configuration
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 👤 Author

BookConnect Team

---

**Made with ❤️ for book lovers**













