const express = require('express');
const { createQuiz, getQuiz, getAllQuizzes } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a quiz
router.post('/create', authMiddleware.authenticateUser, createQuiz);

// Route to get a specific quiz by its ID
router.get('/:quizId', getQuiz); 

// Route to get all quizzes with optional pagination
router.get('/', getAllQuizzes);

module.exports = router;
