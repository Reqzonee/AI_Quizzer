const express = require('express');
const router = express.Router();
const { login, signup } = require('../controllers/authController');

// Login route
router.post('/login', login);

// Signup route
router.post('/signup', signup);

module.exports = router;
