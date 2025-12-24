require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');

// Import routes
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const bookRoutes = require('./routes/bookRoutes');
const adminRoutes = require('./routes/adminRoutes');
const demoRoutes = require('./routes/demoRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authorRoutes = require('./routes/authorRoutes');

// Initialize express app
const app = express();

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Session storage: MongoDB (primary) with in-memory bootstrap wrapper
const MongoSessionStore = require('./utils/mongoSessionStore');
const SessionStoreWrapper = require('./utils/sessionStoreWrapper');

const sessionOptions = {
  name: 'bookconnect_sid',
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 hours
};

// Session store will be initialized in start() function after MongoDB connection
let mongoStore = null;
const sessionStoreWrapper = new SessionStoreWrapper();
sessionOptions.store = sessionStoreWrapper;

// Function to initialize session store (called after MongoDB connection)
async function initializeSessionStores() {
  // Set up MongoDB session store (single, primary store)
  try {
    mongoStore = new MongoSessionStore();
  } catch (mongoError) {
    console.error('⚠️  MongoDB session store error:', mongoError.message);
  }

  // Update the wrapper with the persistent Mongo store (or stay in-memory on failure)
  if (mongoStore) {
    sessionStoreWrapper.setStore(mongoStore);
  }
}

// Apply session middleware (store will be configured in initializeSessionStores)
// Using temporary in-memory store until MongoDB connects
app.use(session(sessionOptions));

// Expose current user to EJS templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Import API routes
const apiRoutes = require('./routes/apiRoutes');

// Routes
app.use('/', authRoutes);
app.use('/reviews', reviewRoutes);
app.use('/chat', chatRoutes);
app.use('/api', apiRoutes);
app.use('/books', bookRoutes);
app.use('/author', authorRoutes);
app.use('/admin', adminRoutes);
app.use('/demo', demoRoutes);

// 404 handler
app.use((req, res) => {
  // Ensure currentUser is available for 404 page
  res.locals.currentUser = req.session?.user || null;
  res.status(404).render('404');
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // shows call stack
  
  // Ensure currentUser is available for error page
  res.locals.currentUser = req.session?.user || null;
  
  if (req.path.startsWith('/api')) {
    // API request -> return JSON
    return res.status(err.status || 500).json({ error: err.message });
  }
  // Web request -> render error page
  res.status(err.status || 500).render('error', { error: err });
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION! Shutting down...', reason.stack || reason);
  process.exit(1);
});

// Create server (support HTTPS when certs provided)
const PORT = process.env.PORT || 3000;
let httpsEnabled = false;

function createServerWithHTTPS() {
  const keyPath = process.env.SSL_KEY || path.join(__dirname, 'certs', 'localhostkey.pem');
  const certPath = process.env.SSL_CERT || path.join(__dirname, 'certs', 'localhostcert.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    try {
      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      const server = https.createServer(options, app);
      httpsEnabled = true;
      return server;
    } catch (err) {
      console.error('⚠️  Error reading SSL certificates, falling back to HTTP:', err.message);
      return createServer(app);
    }
  }
  return null;
}

async function start() {
  try {
    // Connect to MongoDB first (required for sessions and data)
    const { connectMongoDB } = require('./db-mongo');
    await connectMongoDB();

    // Initialize session stores after MongoDB connection
    await initializeSessionStores();

    let server;
    const httpsServer = createServerWithHTTPS();
    
    if (httpsServer && process.env.NODE_ENV !== 'production') {
      // Only use HTTPS in development (local certificates)
      server = httpsServer;
      server.listen(PORT, () => {
        console.log(`🚀 Book Connect running at https://localhost:${PORT}`);
        console.log('   (Self-signed certificate - browser may show security warning)');
      });
    } else {
      // Use HTTP in production (hosting platforms handle HTTPS)
      server = createServer(app);
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = process.env.HOST || 'localhost';
      server.listen(PORT, () => {
        console.log(`🚀 Book Connect running at ${protocol}://${host}:${PORT}`);
        if (process.env.NODE_ENV === 'production') {
          console.log(`   Production mode - HTTPS handled by platform`);
        }
      });
    }

    // Attach socket.io
    const { Server } = require('socket.io');
    const io = new Server(server);
    // make io available in app locals for controllers
    app.locals.io = io;

    // Chat functionality with Socket.io
    const serverStartTime = Date.now();
    io.on('connection', (socket) => {
      // Send server timestamp to client on connection
      socket.emit('server timestamp', serverStartTime);
      
      // User connected
      socket.on('chat message', (message) => {
        // Broadcast message to all connected clients
        io.emit('chat message', message);
      });

      socket.on('disconnect', () => {
        // User disconnected
      });
    });

    // Make server and httpsEnabled available to app
    app.locals.server = server;
    app.locals.httpsEnabled = httpsEnabled;
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();

