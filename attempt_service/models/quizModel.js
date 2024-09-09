const mongoose = require('mongoose');
const { encrypt } = require('../utils/encryptionUtils'); // Assume these functions are implemented

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  grade: {
    type: String, 
    required: true,
  },
  subject: {
    type: String, 
    required: true,
  },
  difficulty: {
    type: String, 
    required: true,
  },
  totalMarks: {
    type: Number,
    default: 0, 
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
      },
      options: [
        {
          optionText: {
            type: String,
            required: true,
          }
        }
      ],
      correctOption: {
        type: String,
        required: true,
      },
      marks: {
        type: Number, // Marks for this specific question
        required: true,
        min: 1, // Ensure at least 1 mark is assigned to each question
      }
    }
  ],
  createdBy: {
    type: String,  // Just store the userId as a string from user_service
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
