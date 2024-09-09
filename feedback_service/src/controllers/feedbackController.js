// src/controllers/feedbackController.js

const { generateFeedbackForAttempt } = require("../rapozatory/groqRapozatory");

async function handleFeedbackRequest(req, res) {
    // console.log("helloji ");
  try {
    // Extract results from the request body
    const results = req.body.results;
    const {email} = req.body;
    // console.log("email is ", email);

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ message: 'Invalid or missing results data' });
    }

    // Generate feedback based on the results
    const feedback = await generateFeedbackForAttempt(email,results);

    console.log("feedback is ", feedback);

    // Return the generated feedback in the response
    res.status(200).json(feedback);
  } catch (error) {
    // Send an error response if something goes wrong
    res.status(500).json({ message: error.message });
  }
}

module.exports = { handleFeedbackRequest };
