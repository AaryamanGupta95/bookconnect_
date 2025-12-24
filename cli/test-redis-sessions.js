/**
 * Test Redis Session Storage
 * 
 * This script helps verify that sessions are being stored in Redis correctly.
 * 
 * Usage: node cli/test-redis-sessions.js
 */

require('dotenv').config();
const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: redisUrl });

async function testRedisSessions() {
  try {
    console.log('🔌 Connecting to Redis...\n');
    
    if (!client.isOpen) {
      await client.connect();
    }
    
    console.log('✅ Connected to Redis\n');
    
    // Get all session keys
    const keys = await client.keys('sess:*');
    
    console.log(`📊 Found ${keys.length} session(s) in Redis\n`);
    
    if (keys.length === 0) {
      console.log('⚠️  No sessions found in Redis.');
      console.log('💡 Make sure:');
      console.log('   1. REDIS_URL is set in .env file');
      console.log('   2. Redis server is running');
      console.log('   3. You have logged in to create a session\n');
    } else {
      console.log('📋 Session Keys:\n');
      keys.forEach((key, index) => {
        console.log(`  ${index + 1}. ${key}`);
      });
      
      // Show details of first session
      if (keys.length > 0) {
        console.log('\n📄 Sample Session Data:\n');
        const sessionData = await client.get(keys[0]);
        if (sessionData) {
          try {
            const parsed = JSON.parse(sessionData);
            console.log('  Session ID:', keys[0]);
            console.log('  User:', parsed.user ? parsed.user.username : 'No user');
            console.log('  Cookie:', parsed.cookie ? 'Present' : 'Missing');
            console.log('  Expires:', parsed.cookie?.expires || 'Not set');
            console.log('\n  Full Data:', JSON.stringify(parsed, null, 2));
          } catch (parseErr) {
            console.log('  Raw Data:', sessionData);
          }
        }
      }
    }
    
    // Check TTL
    if (keys.length > 0) {
      console.log('\n⏱️  Session TTL (Time To Live):\n');
      for (const key of keys.slice(0, 5)) { // Show first 5
        const ttl = await client.ttl(key);
        if (ttl > 0) {
          const minutes = Math.floor(ttl / 60);
          const seconds = ttl % 60;
          console.log(`  ${key}: ${minutes}m ${seconds}s remaining`);
        } else {
          console.log(`  ${key}: Expired or no TTL`);
        }
      }
    }
    
    console.log('\n✅ Test complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure Redis is running and REDIS_URL is correct in .env file\n');
  } finally {
    if (client.isOpen) {
      await client.quit();
      console.log('🔌 Redis connection closed');
    }
  }
}

testRedisSessions();

