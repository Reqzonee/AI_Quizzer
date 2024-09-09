const express = require('express');
const dotenv = require('dotenv');
const feedbackRoutes = require('./src/routes/feedbackRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Use feedback routes
app.use('/feedback', feedbackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Feedback service running on port ${PORT}`);
});
