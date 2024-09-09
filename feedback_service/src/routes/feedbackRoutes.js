// src/routes/feedbackRoutes.js

const express = require('express');
const router = express.Router();
const { handleFeedbackRequest } = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/' ,handleFeedbackRequest);

module.exports = router;
