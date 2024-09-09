const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Quiz model
    ref: 'Quiz', // This refers to the 'Quiz' model
    required: true,
  },
  userId: {
    type: String, // Store the user ID
    required: true,
  },
  userSelectedAnswers: [
    {
      questionIndex: {
        type: Number, // Index of the question in the quiz
        required: true,
      },
      selectedOption: {
        type: String, // The option selected by the user
        required: true,
      },
      isCorrect:{
        type: Boolean,
        default: true
      }
    },
  ],
  score: {
    type: Number,
    default: 0, // Store the user's total score for the quiz
  },
  completedAt: {
    type: Date,
    default: Date.now, // Store when the quiz was completed
  }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
