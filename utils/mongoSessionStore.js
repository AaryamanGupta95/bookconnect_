const mongoose = require('mongoose');
const { Schema } = mongoose;

// Ensure mongoose is connected before creating the model
let Session;

// Session Schema for MongoDB
const sessionSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  session: {
    type: String,
    required: true
  }
}, {
  collection: 'sessions'
});

// Create TTL index for automatic expiration (only once, not duplicate)
sessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

// MongoDB Session Store for express-session
class MongoSessionStore {
  constructor() {
    // Initialize Session model if not already done
    if (!Session) {
      Session = mongoose.model('Session', sessionSchema);
    }
    this.Session = Session;
  }

  async get(sid, callback) {
    try {
      const sessionDoc = await this.Session.findById(sid);
      if (!sessionDoc) {
        return callback(null, null);
      }
      
      // Check if expired
      if (sessionDoc.expires < new Date()) {
        await this.Session.findByIdAndDelete(sid);
        return callback(null, null);
      }
      
      const session = JSON.parse(sessionDoc.session);
      callback(null, session);
    } catch (error) {
      callback(error);
    }
  }

  async set(sid, session, callback) {
    try {
      const expires = session.cookie?.expires 
        ? new Date(session.cookie.expires) 
        : new Date(Date.now() + (session.cookie?.maxAge || 7200000));
      
      const sessionData = {
        _id: sid,
        expires: expires,
        session: JSON.stringify(session)
      };
      
      await this.Session.findByIdAndUpdate(
        sid,
        sessionData,
        { upsert: true, new: true }
      );
      
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  async destroy(sid, callback) {
    try {
      await this.Session.findByIdAndDelete(sid);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  async touch(sid, session, callback) {
    try {
      const expires = session.cookie?.expires 
        ? new Date(session.cookie.expires) 
        : new Date(Date.now() + (session.cookie?.maxAge || 7200000));
      
      await this.Session.findByIdAndUpdate(
        sid,
        { expires: expires },
        { upsert: true }
      );
      
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  async all(callback) {
    try {
      const sessions = await this.Session.find({ expires: { $gt: new Date() } });
      const result = {};
      sessions.forEach(doc => {
        result[doc._id] = JSON.parse(doc.session);
      });
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  }

  async length(callback) {
    try {
      const count = await this.Session.countDocuments({ expires: { $gt: new Date() } });
      callback(null, count);
    } catch (error) {
      callback(error);
    }
  }

  async clear(callback) {
    try {
      await this.Session.deleteMany({});
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  // Optional method that some express-session versions expect
  createSession(req, session) {
    // Default behavior - just return the session
    return session;
  }
}

module.exports = MongoSessionStore;

