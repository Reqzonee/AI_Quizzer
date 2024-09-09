const UserRapozatory = require('../rapozatory/user_rapozatory');

// Signup Controller
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const result = await UserRapozatory.signup(name, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await UserRapozatory.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
