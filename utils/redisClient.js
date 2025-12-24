const { createClient } = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: redisUrl });

client.on('error', (err) => console.error('Redis Client Error', err));

async function connect() {
  if (!client.isOpen) await client.connect();
}

module.exports = { client, connect };
