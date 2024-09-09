const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

class UserService {
  async signup(name, email, password) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword
      });

      // Save user
      await user.save();

      // Generate JWT token with email included
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return { token, user: { id: user._id, name: user.name, email: user.email } };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async login(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token with email included
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return { token, user: { id: user._id, name: user.name, email: user.email } };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new UserService();
