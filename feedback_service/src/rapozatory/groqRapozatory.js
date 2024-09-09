const Groq = require('groq-sdk');
const mailSender = require('./mailSender'); // Adjust the path if necessary
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateFeedbackForAttempt(recipientEmail,results) {
    console.log("recipientEmail is ", recipientEmail);
    try {
        // Build a summary of results for the prompt
        const promptContent = `Based on the following quiz results, provide a single-paragraph summary of the user's performance. Focus on areas where they performed well and where they need improvement.
        
        Quiz Results:
        ${results.map(result => 
            `Question: ${result.questionText}
            User Selected: ${result.userSelectedOption}
            Correct Answer: ${result.correctOption}
            Correct: ${result.isCorrect}`
        ).join('\n\n')}
        
        Summarize the user's performance and suggest what topics or skills they should focus on improving.`;

        // Call the groq API to generate feedback
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: promptContent,
                },
            ],
            model: 'llama3-8b-8192',
        });

        // Check if the response contains the expected structure
        if (response && response.choices && Array.isArray(response.choices)) {
            // Access the first choice
            const choice = response.choices[0];

            // Extract the feedback content
            const feedback = choice.message?.content;

            if (feedback) {
                console.log("Feedback is:", feedback);

                // Send feedback via email
                await mailSender(recipientEmail, 'Your Quiz Feedback', feedback);
            } else {
                console.log('No feedback content available');
            }

            return feedback || 'No feedback content available';
        } else {
            throw new Error('Unexpected response structure');
        }
    } catch (error) {
        console.error('Failed to generate feedback:', error.message);
        throw new Error('Failed to generate feedback');
    }
}

module.exports = { generateFeedbackForAttempt };
