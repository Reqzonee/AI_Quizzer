const QuizRepository = require('../quizRepository/quizRepository');

// Create Quiz Controller
exports.createQuiz = async (req, res) => {
    const { title, grade, subject, totalQuestions, maxScore, difficulty } = req.body;
    const createdBy = req.userId; // Passed from middleware

    // const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);

  
    try {
      // Call the repository function that integrates the Groq logic to generate questions
      const quiz = await QuizRepository.createQuiz(
        title, 
        { grade, subject, totalQuestions, maxScore, difficulty }, 
        createdBy
      );
      
      res.status(201).json(quiz);
    } catch (error) {
      res.status(500).json({ message: `Error creating quiz: ${error.message}` });
    }
  };
  
// Get Quiz by ID Controller
exports.getQuiz = async (req, res) => {
  const { quizId } = req.params;
//   console.log("quizid is ", quizId);

  try {
    const quiz = await QuizRepository.getQuizById(quizId);
    res.status(200).json(quiz);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get All Quizzes Controller
exports.getAllQuizzes = async (req, res) => {
  const {limit} = req.body.limit || 10; // Default limit to 10 if not provided
  const {page} = req.body.page || 1; // Default to page 1 if not provided

  try {
    const quizzes = await QuizRepository.getAllQuizzes(limit, page);
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
