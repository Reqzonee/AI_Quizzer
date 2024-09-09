const express = require('express');
const router = express.Router();
const attemptQuizController = require('../controllers/attemptQuizController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to submit a quiz attempt with authentication middleware
router.post('/attempt/:quizId', authMiddleware.authenticateUser, attemptQuizController.submitQuizAttempt);
router.get('/', attemptQuizController.getAllQuizzes);

// Route to get user's quiz attempts with authentication middleware
router.get('/attempts/:userId', authMiddleware.authenticateUser, attemptQuizController.getUserQuizAttempts);
router.get('/attempt/:quizId', authMiddleware.authenticateUser, attemptQuizController.getAttemptedQuizById);

router.post('/quiz', attemptQuizController.createQuiz);
router.get('/:quizId', attemptQuizController.getQuiz); 

router.post('/quiz-filter',authMiddleware.authenticateUser, attemptQuizController.getquizbyfilter);
router.post('/quiz-filter-by-date',authMiddleware.authenticateUser, attemptQuizController.getQuizByDateFilter);



module.exports = router;
