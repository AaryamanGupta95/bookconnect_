/**
 * Quick check for Redis sessions
 * 
 * Usage: node cli/check-redis-sessions.js
 */

require('dotenv').config();
const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: redisUrl });

async function checkSessions() {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    
    console.log('🔍 Checking Redis for sessions...\n');
    
    // Check different possible prefixes
    const prefixes = ['sess:', 'session:', 'bookconnect_sid:'];
    
    for (const prefix of prefixes) {
      const keys = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        console.log(`✅ Found ${keys.length} session(s) with prefix "${prefix}"`);
        keys.slice(0, 3).forEach(key => {
          console.log(`   - ${key}`);
        });
        if (keys.length > 3) {
          console.log(`   ... and ${keys.length - 3} more`);
        }
      }
    }
    
    // Also check all keys
    const allKeys = await client.keys('*');
    console.log(`\n📊 Total keys in Redis: ${allKeys.length}`);
    
    if (allKeys.length > 0) {
      console.log('\nAll keys:');
      allKeys.forEach(key => console.log(`   - ${key}`));
    }
    
    await client.quit();
  } catch (error) {
    console.error('Error:', error.message);
    if (client.isOpen) await client.quit();
  }
}

checkSessions();

