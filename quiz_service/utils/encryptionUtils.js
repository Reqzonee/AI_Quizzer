const crypto = require('crypto');

// Encryption function using AES-256
const encrypt = (text) => {
  if (typeof text !== 'string') {
    throw new Error('The input must be a string');
  }

  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

module.exports = { encrypt };
