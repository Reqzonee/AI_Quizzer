// authMiddleware.js
const jwt = require('jsonwebtoken');

class AuthMiddleware {
  authenticateUser(req, res, next) {
    const authHeader = req.headers('authorization');

    console.log("🚀 ~ verifyToken ~ authHeader:", authHeader);
  
    // Check if the Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Not Authenticated",
      });
    }
  
    // Check if the header is properly formatted with "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Token not found in Authorization header",
      });
    }
  
    console.log("🚀 ~ Token to be verified:", token);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;  // Get the user ID from the token payload
      req.userEmail = decoded.userEmail;
      console.log("email id is ", req.userEmail);
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  }
}

module.exports = new AuthMiddleware();
