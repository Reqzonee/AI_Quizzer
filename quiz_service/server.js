const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db'); // Importing DB connection
const quizRoutes = require('./routes/quizRoutes');

dotenv.config(); // Load environment variables from .env file

// Ensure the DB connection is invoked correctly
db.connect();

const app = express();
app.use(express.json()); // Middleware for parsing JSON requests

// Routes
app.use('/api/quiz', quizRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
