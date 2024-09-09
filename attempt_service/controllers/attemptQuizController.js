const attemptQuizRepository = require('../rapozatory/AttemptQuizRepository');

// Submit quiz attempt
exports.submitQuizAttempt = async (req, res) => {
  const { quizId } = req.params; // Extract quizId from the request parameters
  const { selectedAnswers } = req.body; // Only pass selectedAnswers in the request body
  
  const userId = req.userId; // Get userId from the authentication middleware
  const email = req.email; // Get userId from the authentication middleware

  try {
    // Save the quiz attempt
    const quizAttempt = await attemptQuizRepository.saveQuizAttempt(email,quizId, userId, selectedAnswers);

    res.status(201).json({
      message: 'Quiz attempt submitted successfully',
      quizAttempt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get user's quiz attempts
exports.getUserQuizAttempts = async (req, res) => {
  const { userId } = req.params;

  try {
    const attempts = await attemptQuizRepository.getUserQuizAttempts(userId);
    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttemptedQuizById = async (req, res) => {
  const  userId  = req.userId;
  const {quizId} = req.params;

  try {
    const attempts = await attemptQuizRepository.getAttemptedQuizById(userId, quizId);
    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Create a new quiz
exports.createQuiz = async (req, res) => {
    const { quizId, title, grade, subject, totalQuestions, maxScore, difficulty, createdBy, questions} = req.body;

    // console.log("hhhhhhhhh", questions);
  
    try {
      // Call the repository function that integrates the Groq logic to generate questions
      const quiz = await attemptQuizRepository.createQuiz(
        quizId,
        title, 
        grade, 
        subject,
        questions, 
        totalQuestions,
        maxScore, 
        difficulty ,
        createdBy
      );
      
      res.status(201).json(quiz);
    } catch (error) {
      res.status(500).json({ message: `Error creating quiz: ${error.message}` });
    }
  };

  exports.getQuiz = async (req, res) => {
    const { quizId } = req.params;
  //   console.log("quizid is ", quizId);
  
    try {
      const quiz = await attemptQuizRepository.getQuizById(quizId);
      res.status(200).json(quiz);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  exports.getquizbyfilter = async(req, res)=>{
    const { grade, subject, minMarks, maxMarks, completedDate } = req.body;
    const userId = req.userId;

    try {
      const quiz = await attemptQuizRepository.getQuizByfilter(userId, grade, subject, minMarks, maxMarks, completedDate);
      res.status(200).json(quiz);
    } catch (error) {
      res.status(404).json({message: error.message});
    }
  };
  
  exports.getQuizByDateFilter = async(req, res)=>{
    const {fromDate, toDate } = req.body;
    const userId = req.userId;

    try {
      const quiz = await attemptQuizRepository.getQuizByDateFilter(userId, fromDate, toDate);
      res.status(200).json(quiz);
    } catch (error) {
      res.status(404).json({message: error.message});
    }
  };

  exports.getAllQuizzes = async(req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10; // Use query parameters for GET requests
    const page = parseInt(req.query.page, 10) || 1;
  
    console.log(`Fetching quizzes with limit ${limit} and page ${page}`);
  
    try {
      console.log("hhhhhhhhhhhhhhhhhhhhhhhh");
      const result = await attemptQuizRepository.getAllQuizzes(limit, page);
      console.log('Quizzes fetched:', result);
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error in getAllQuizzes: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  };
  