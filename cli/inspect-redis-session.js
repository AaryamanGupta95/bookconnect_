/**
 * Inspect Redis Session Details
 * 
 * Usage: node cli/inspect-redis-session.js [session-id]
 * If no session-id provided, shows all sessions
 */

require('dotenv').config();
const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: redisUrl });

async function inspectSession(sessionId = null) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    
    console.log('🔍 Inspecting Redis Sessions...\n');
    
    if (sessionId) {
      // Inspect specific session
      const key = sessionId.startsWith('sess:') ? sessionId : `sess:${sessionId}`;
      const data = await client.get(key);
      
      if (!data) {
        console.log(`❌ Session not found: ${key}\n`);
        await client.quit();
        return;
      }
      
      console.log(`📄 Session: ${key}\n`);
      try {
        const parsed = JSON.parse(data);
        console.log('User:', parsed.user ? parsed.user.username : 'No user');
        console.log('Email:', parsed.user ? parsed.user.email : 'No email');
        console.log('Admin:', parsed.user ? parsed.user.isAdmin : false);
        console.log('Cookie expires:', parsed.cookie?.expires || 'Not set');
        console.log('\nFull Data:');
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw Data:', data);
      }
    } else {
      // Show all sessions
      const keys = await client.keys('sess:*');
      
      console.log(`📊 Found ${keys.length} session(s)\n`);
      
      if (keys.length === 0) {
        console.log('No sessions found. Make sure you are logged in.\n');
      } else {
        for (const key of keys) {
          const data = await client.get(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              console.log(`\n📄 ${key}`);
              console.log(`   User: ${parsed.user?.username || 'Unknown'}`);
              console.log(`   Email: ${parsed.user?.email || 'Unknown'}`);
              console.log(`   Admin: ${parsed.user?.isAdmin || false}`);
              
              const ttl = await client.ttl(key);
              if (ttl > 0) {
                const minutes = Math.floor(ttl / 60);
                const seconds = ttl % 60;
                console.log(`   Expires in: ${minutes}m ${seconds}s`);
              }
            } catch (e) {
              console.log(`   Raw data: ${data.substring(0, 100)}...`);
            }
          }
        }
      }
    }
    
    await client.quit();
    console.log('\n✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client.isOpen) await client.quit();
  }
}

const sessionId = process.argv[2];
inspectSession(sessionId);

