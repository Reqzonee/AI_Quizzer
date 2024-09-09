const crypto = require('crypto');

const encrypt = (text) => {
    if (typeof text !== 'string') {
      throw new Error('The input must be a string');
    }
  
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  };
  

// Decryption function using AES-256-CBC without IV
const decrypt = (encryptedText) => {
  if (typeof encryptedText !== 'string') {
    throw new Error('The input must be a string');
  }

  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
//   console.log("decrypted ", decrypted);

  const output = decrypted.replace(/^encrypted/, '').replace(/Answer$/, '');

//   console.log(output);
  return output;
};

module.exports = { decrypt , encrypt };

