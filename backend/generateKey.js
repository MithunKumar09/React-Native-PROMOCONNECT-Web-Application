const crypto = require('crypto');
require('dotenv').config(); // Load environment variables

const key = crypto.randomBytes(32).toString('hex');
console.log(`Generated JWT Secret Key: ${key}`);

// Save the key to the .env file
const fs = require('fs');
fs.appendFileSync('.env', `JWT_SECRET=${key}\n`, 'utf8');
