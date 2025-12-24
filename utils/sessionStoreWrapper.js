/**
 * Session Store Wrapper
 * 
 * This wrapper allows the session store to be updated after initialization.
 * It starts with in-memory storage and switches to MongoDB/Redis when available.
 */

const EventEmitter = require('events');

class SessionStoreWrapper extends EventEmitter {
  constructor() {
    super();
    this.store = null;
    this.memoryStore = new Map();
  }

  setStore(store) {
    this.store = store;
    // Forward events from the underlying store
    if (store && typeof store.on === 'function') {
      store.on('disconnect', () => this.emit('disconnect'));
      store.on('connect', () => this.emit('connect'));
    }
  }

  async get(sid, callback) {
    if (this.store) {
      try {
        return this.store.get(sid, callback);
      } catch (error) {
        console.error('Error getting session from store:', error);
        // Fallback to in-memory
        const session = this.memoryStore.get(sid);
        if (session && session.expires > Date.now()) {
          return callback(null, session.data);
        } else {
          this.memoryStore.delete(sid);
          return callback(null, null);
        }
      }
    } else {
      // Use in-memory fallback
      const session = this.memoryStore.get(sid);
      if (session && session.expires > Date.now()) {
        return callback(null, session.data);
      } else {
        this.memoryStore.delete(sid);
        return callback(null, null);
      }
    }
  }

  async set(sid, session, callback) {
    if (this.store) {
      // Always use the persistent store (DualStore or single store)
      return this.store.set(sid, session, (err) => {
        if (err) {
          console.error('Error setting session in persistent store:', err);
          // Fallback to in-memory only if persistent store fails
          const expires = session.cookie?.expires 
            ? new Date(session.cookie.expires).getTime()
            : Date.now() + (session.cookie?.maxAge || 7200000);
          
          this.memoryStore.set(sid, {
            data: session,
            expires: expires
          });
          return callback(null);
        }
        // Success - also clear from memory store if it was there
        this.memoryStore.delete(sid);
        return callback(null);
      });
    } else {
      // Use in-memory fallback (only before store is initialized)
      const expires = session.cookie?.expires 
        ? new Date(session.cookie.expires).getTime()
        : Date.now() + (session.cookie?.maxAge || 7200000);
      
      this.memoryStore.set(sid, {
        data: session,
        expires: expires
      });
      
      return callback(null);
    }
  }

  async destroy(sid, callback) {
    this.memoryStore.delete(sid);
    if (this.store) {
      return this.store.destroy(sid, callback);
    } else {
      return callback(null);
    }
  }

  async touch(sid, session, callback) {
    if (this.store) {
      return this.store.touch(sid, session, callback);
    } else {
      // Update in-memory
      const existing = this.memoryStore.get(sid);
      if (existing) {
        const expires = session.cookie?.expires 
          ? new Date(session.cookie.expires).getTime()
          : Date.now() + (session.cookie?.maxAge || 7200000);
        existing.expires = expires;
      }
      return callback(null);
    }
  }

  async all(callback) {
    if (this.store && this.store.all) {
      return this.store.all(callback);
    } else {
      const result = {};
      this.memoryStore.forEach((value, sid) => {
        if (value.expires > Date.now()) {
          result[sid] = value.data;
        }
      });
      return callback(null, result);
    }
  }

  async length(callback) {
    if (this.store && this.store.length) {
      return this.store.length(callback);
    } else {
      let count = 0;
      this.memoryStore.forEach((value) => {
        if (value.expires > Date.now()) {
          count++;
        }
      });
      return callback(null, count);
    }
  }

  async clear(callback) {
    this.memoryStore.clear();
    if (this.store && this.store.clear) {
      return this.store.clear(callback);
    } else {
      return callback(null);
    }
  }

  // Optional method that some express-session versions expect
  createSession(req, session) {
    if (this.store && typeof this.store.createSession === 'function') {
      return this.store.createSession(req, session);
    }
    // Default behavior - just return the session
    return session;
  }
}

module.exports = SessionStoreWrapper;

