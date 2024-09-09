const QuizAttempt = require("../models/QuizAttempt"); // Import the QuizAttempt model
const quizModel = require("../models/quizModel");
const { decrypt } = require("../utils/encryptionUtils"); // Import decrypt function
require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const axios = require('axios');

class AttemptQuizRepository {
  // Save or update a quiz attempt
  async saveQuizAttempt(email, quizId, userId, selectedAnswers) {
    console.log("email is ", email);
     try {
      // Fetch the quiz details using quizId
      // console.log("quiz id is ", quizId);
      const quiz = await quizModel.findById(quizId);

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Initialize the score
      let score = 0;

      // Extract correct answers from the quiz questions
      // console.log("quiz correct options are ", quiz.questions);
      const correctAnswers = quiz.questions.map((question, index) => ({
        questionIndex: index,
        correctOption: decrypt(question.correctOption),
      }));

      // Map selected answers from the user's submission
      const userAnswers = selectedAnswers.map((answer) => {
        // Find the correct answer for the question
        const correctAnswer = correctAnswers.find(
          (correct) => correct.questionIndex === answer.questionIndex
        );

        // Determine if the selected option is correct
        const isCorrect =
          correctAnswer &&
          correctAnswer.correctOption === answer.selectedOption;

        // Update the score if the answer is correct
        if (isCorrect) {
          score += quiz.questions[answer.questionIndex].marks; // Add the question's marks to the score
        }

        return {
          questionIndex: answer.questionIndex,
          selectedOption: answer.selectedOption,
          isCorrect: isCorrect, // Set isCorrect based on whether the answer is correct
        };
      });

      // Save the quiz attempt
      const quizAttempt = new QuizAttempt({
        quizId,
        userId,
        userSelectedAnswers: userAnswers, // Store the user's selected answers
        score,
        completedAt: new Date(), // Record the completion time
      });

      const results = quiz.questions.map((question, index) => {
        // Find the user's selected answer for the current question
        const userAnswer = quizAttempt.userSelectedAnswers.find(
          (answer) => answer.questionIndex === index
        );
      
        // Decrypt or extract the correct answer
        const correctOption = decrypt(question.correctOption);
      
        return {
          questionText: question.questionText,
          options: question.options.map((option) => ({
            optionText: option.optionText,
            _id: option._id,
          })),
          userSelectedOption: userAnswer ? userAnswer.selectedOption : null,
          correctOption: correctOption,
          isCorrect: userAnswer ? userAnswer.isCorrect : false,
        };
      });      

      console.log("before axios call in saveQuizAttempt");
      console.log("process.env.FEEDBACK_SERVICE_URL ", process.env.FEEDBACK_SERVICE_URL);
      console.log("email email ", email);

      const feedbackResponse = await axios.post(
        `${process.env.FEEDBACK_SERVICE_URL}/`, // Use URL from .env
        {results,
        email}
      );

      console.log("feedback is ", feedbackResponse);
    
      // Save the attempt to the database
      await quizAttempt.save();

      return quizAttempt;
    } catch (error) {
      console.error("Failed to save quiz attempt:", error); // Log the full error object
      throw new Error(`Failed to save quiz attempt: ${error.message}`);
    }
  }

  // Fetch user's quiz attempts
  async getUserQuizAttempts(userId) {
    try {
      // console.log("Fetching quiz attempts for userId:", userId); // Log userId

      // Fetch quiz attempts for the user
      const attempts = await QuizAttempt.find({ userId }).sort({
        completedAt: -1,
      });
      return attempts;
    } catch (error) {
      console.error("Error fetching quiz attempts:", error); // Log detailed error
      throw new Error(`Failed to fetch quiz attempts: ${error.message}`);
    }
  }

  async getAttemptedQuizById(userId, quizId) {
    try {
      // Fetch quiz details
      const quiz = await quizModel.findById(quizId).lean();
      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Fetch user's attempt
      const attempt = await QuizAttempt.findOne({ userId, quizId }).lean();
      if (!attempt) {
        throw new Error("No attempt found for the given user and quiz");
      }

      // Map questions and user answers
      const results = quiz.questions.map((question, index) => {
        // Find user's answer for the current question
        const userAnswer = attempt.userSelectedAnswers.find(
          (answer) => answer.questionIndex === index
        );

        const selectedOptionId = userAnswer ? userAnswer.selectedOption : null;
        const selectedOption = question.options.find(
          (option) => option.optionText === selectedOptionId
        );

        return {
          questionText: question.questionText,
          options: question.options.map((option) => ({
            optionText: option.optionText,
            _id: option._id,
          })),
          userSelectedOption: selectedOption ? selectedOption.optionText : null,
          isCorrect: userAnswer ? userAnswer.isCorrect : false,
        };
      });

      return {
        title: quiz.title,
        grade: quiz.grade,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        totalMarks: quiz.totalMarks,
        score: attempt.score,
        completedAt: attempt.completedAt,
        questions: results,
      };
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      throw new Error(`Failed to fetch quiz results: ${error.message}`);
    }
  }

  async getAllQuizzes(limit, page) {
    // Default limit and page values
    limit = parseInt(limit, 10) || 10;
    page = parseInt(page, 10) || 1;
  
    try {
      // Fetch quizzes with pagination
      const quizzes = await quizModel.find()
        .limit(limit)
        .skip((page - 1) * limit);
      
        // console.log("quizzes ", quizzes);
  
      // Fetch total number of quizzes for pagination metadata
      const totalQuizzes = await quizModel.countDocuments();
      // console.log("object ", totalQuizzes);
  
      // Prepare the response with pagination data
      return {
        quizzes,
        totalQuizzes,
        totalPages: Math.ceil(totalQuizzes / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error(`Error in getAllQuizzes: ${error.message}`);
      throw new Error(`Unable to fetch all quizzes: ${error.message}`);
    }
  }
  
  async createQuiz(
    message
  ) {
    const {
      quizId,
      title,
      grade,
      subject,
      questions,
      totalQuestions,
      maxScore,
      difficulty,
      createdBy
    } = message;
    console.log("Processing quiz with details:", {
      quizId,
      title,
      grade,
      subject,
      questions,
      totalQuestions,
      maxScore,
      difficulty,
      createdBy
    });
    try {
      if (!quizId || !title || !questions || !Array.isArray(questions)) {
        throw new Error("Invalid input data");
      }

      // Format and decrypt questions for storage
      const formattedQuestions = questions.map((question) => ({
        // questionIndex: question.questionIndex,
        questionText: question.questionText,
        options: question.options.map((option) => ({
          optionText: option.optionText,
        })),
        correctOption: question.correctOption, // Decrypt the correct option
        marks: 1,
      }));

      // return formattedQuestions;

      const newQuiz = new quizModel({
        quizId,
        title,
        grade,
        subject,
        questions: formattedQuestions,
        totalMarks: maxScore, // Initialize score
        difficulty,
        createdBy,
      });

      const saveQuiz = await newQuiz.save();
      return saveQuiz;
    } catch (error) {
      throw new Error(`Failed to create quiz: ${error.message}`);
    }
  }

  async getQuizById(quizId) {
    try {
      const quiz = await quizModel.findById(quizId);
      if (!quiz) {
        throw new Error("Quiz not found");
      }

      return quiz;
    } catch (error) {
      throw new Error(`Unable to fetch quiz by ID: ${error.message}`);
    }
  }

  async getQuizByfilter(
    userId,      // This is the creator's ID, mapped to createdBy
    grade,
    subject,
    minMarks,
    maxMarks,
    completedDate
  ) {
    try {
      // Build the query object
      const query = { createdBy: userId };  // Use `createdBy` for filtering by userId
  
      // Apply grade filter if provided
      if (grade) {
        query.grade = grade;
      }
  
      // Apply subject filter if provided
      if (subject) {
        query.subject = subject;
      }
  
      // Handle totalMarks filtering
      if (minMarks !== undefined || maxMarks !== undefined) {
        query.totalMarks = {};  // Initialize totalMarks query
  
        if (minMarks !== undefined) {
          query.totalMarks.$gte = minMarks;  // Minimum marks condition
        }
  
        if (maxMarks !== undefined) {
          query.totalMarks.$lte = maxMarks;  // Maximum marks condition
        }
      }
  
      // Handle completedDate filtering (e.g., based on `createdAt`)
      if (completedDate) {
        if (Array.isArray(completedDate) && completedDate.length === 2) {
          // If `completedDate` is a range: [startDate, endDate]
          query.createdAt = { $gte: new Date(completedDate[0]), $lte: new Date(completedDate[1]) };
        } else {
          // Single completedDate
          query.createdAt = new Date(completedDate);
        }
      }

      console.log("query is ", query);
  
      // Fetch quizzes based on the constructed query
      const quizzes = await quizModel.find(query).exec();
  
      console.log("quizzes ", quizzes);
      return quizzes;
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      throw new Error("Error fetching quiz data");
    }
  }
  
  async getQuizByDateFilter(userId, fromDate, toDate) {
    try {
      // Build the query object
      const query = { userId };

      // if (grade) {
      //   query.grade = grade;
      // }
      // if (subject) {
      //   query.subject = subject;
      // }
      if (fromDate || toDate) {
        query.completedAt = {}; // Initialize the date filter

        if (fromDate) {
          query.completedAt.$gte = new Date(fromDate);
        }
        if (toDate) {
          query.completedAt.$lte = new Date(toDate);
        }
      }

      // Fetch quizzes based on the constructed query
      const quizzes = await QuizAttempt.find(query).exec();
      return quizzes;
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      throw new Error("Error fetching quiz data");
    }
  }
}

module.exports = new AttemptQuizRepository();
