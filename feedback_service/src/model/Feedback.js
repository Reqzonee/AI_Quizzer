// src/models/feedback.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the feedback model
const feedbackSchema = new Schema({
  attemptId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  feedbackContent: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model from the schema
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
