// authMiddleware.js
const jwt = require('jsonwebtoken');

class AuthMiddleware {
  authenticateUser(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer Token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;  // Get the user ID from the token payload
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  }
}

module.exports = new AuthMiddleware();
