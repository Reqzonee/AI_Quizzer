const Quiz = require('../models/quizModel');
// const { decrypt } = require('../utils/encryptionUtils'); // Decryption function
require('dotenv').config(); // Ensure dotenv is required here or in the main file
const Groq = require('groq-sdk');
const { encrypt } = require('../utils/encryptionUtils');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const axios = require('axios');
const { CreateChannel, PublishMessage } = require('../utils/rabbitmqservice');

class QuizRepository {
    async createQuiz(title, quizDetails, createdBy) {
      try {
        const { grade, subject, totalQuestions, maxScore, difficulty } = quizDetails;
  
        if (!title || !subject || totalQuestions <= 0) {
          throw new Error('Title, subject, and total questions are required');
        }
  
        // Generate questions using Groq
        const promptContent = `Generate ${totalQuestions} ${difficulty} level ${subject} questions with multiple-choice options. 
        Include the question text, four options labeled A, B, C, D, and indicate the correct answer for each question. 
        Give response in JSON format including parsing as:
        [
          {
            "question": "text of question",
            "A": "option A",
            "B": "option B",
            "C": "option C",
            "D": "option D",
            "correctAnswer": "A|B|C|D"
          }
        ]`;

        // console.log("promt is ", promptContent);
        // console.log("api key is ", process.env.GROQ_API_KEY);
  
        const response = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: promptContent,
            },
          ],
          model: 'llama3-8b-8192',
        });

        // console.log("response is ", response);
  
        const generatedContent = response.choices[0]?.message?.content || '';
        const jsonString = generatedContent.match(/\[(.|\n)*?\]/)?.[0];          
  
        if (!jsonString) {
          throw new Error('Invalid response from Groq');
        }
  
        // Safely parse the string into a JSON object
        const questions = JSON.parse(jsonString);
        // console.log("questions are ", questions);
  
        if (questions.length === 0) {
          throw new Error('No questions were generated');
        }

        // console.log("questions is ", questions);
        const convertToDesiredFormat = (data) => {
            return {
                questions: data.map(item => {
                    const options = ['A', 'B', 'C', 'D'].map(letter => ({
                        optionText: item[letter]
                    }));
        
                    // Find the correct option text using the correctAnswer key (A, B, C, D)
                    const correctOptionText = item[item.correctAnswer];
                    // console.log("correctOptionText ", correctOptionText);
        
                    return {
                        questionText: item.question,
                        options,
                        marks:1,
                        correctOption: correctOptionText // Store the answer text, not the letter
                    };
                })
            };
        };
                
        const formattedData = convertToDesiredFormat(questions);

        const encryptCorrectOptions = (data) => {
            return {
              questions: data.questions.map(question => ({
                ...question,
                correctOption: encrypt(question.correctOption)
              }))
            };
          };
        
          const encryptedData = encryptCorrectOptions(formattedData);

          console.log("After encrypting ", encryptedData);
                    
        const newQuiz = new Quiz({
          title,
          grade,
          subject,
          questions: encryptedData.questions,
          totalMarks:maxScore,
          difficulty,
          createdBy
        });

        // console.log("new Quiz is ", newQuiz);
  
        const savedQuiz = await newQuiz.save();
        // await axios.post(`${process.env.ATTEMPT_SERVICE_URL}/quiz`, {
        //     quizId: savedQuiz._id,
        //     grade,
        //     subject,
        //     title,
        //     questions: encryptedData.questions,
        //     maxScore,
        //     difficulty,
        //     createdBy,
        //   });
  
        // Publish the message to RabbitMQ
    try {
        console.log("🚀 ~ generateQuizController ~ channel:");
        const channel = await CreateChannel();
        const message = JSON.stringify({
          quizId: savedQuiz._id,
          grade,
          subject,
          title,
          questions: encryptedData.questions,
          totalQuestions,
          maxScore,
          difficulty,
          createdBy
        });
        await PublishMessage(channel, "quiz.attempt.create", message);
        console.log("Quiz creation message published to RabbitMQ");
      } catch (error) {
        console.error("Failed to publish message to RabbitMQ:", error.message);
      }
        return savedQuiz;
  
      } catch (error) {
        throw new Error(`Unable to create quiz: ${error.message}`);
      }
    }

    async getQuizById(quizId){
        try {
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            return quiz;

        } catch (error) {
            throw new Error(`Unable to fetch quiz by ID: ${error.message}`);
        }
    }

    async getAllQuizzes(limit, page){
        try {
            const quizzes = await Quiz.find()
            .limit(limit)
            .skip((page - 1) * limit);
        
        // Fetch total number of quizzes for pagination metadata
        const totalQuizzes = await Quiz.countDocuments();

        // Prepare the response with pagination data
        return {
            quizzes,
            totalQuizzes,
            totalPages: Math.ceil(totalQuizzes / limit),
            currentPage: page
        };
        } catch (error) {
            throw new Error(`Unable to fetch all quizzes: ${error.message}`);
        }
    }
}
  
module.exports = new QuizRepository();
