// authMiddleware.js
const jwt = require('jsonwebtoken');

class AuthMiddleware {
  authenticateUser(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer Token
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded,"decoce")
      req.userId = decoded.id;  // Get the user ID from the token payload
      req.email=decoded.email;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  }
}

module.exports = new AuthMiddleware();
