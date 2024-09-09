const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection error:', err));
  }
}

module.exports = new Database();
