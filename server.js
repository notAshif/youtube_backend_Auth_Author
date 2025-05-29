const express = require('express');
const cookieParser = require('cookie-parser');
const corsMiddleware = require('./middleware/corsMiddleware');
const connectDB = require('./db');
require('dotenv').config();

const app = express();

// Connect to MongoDB before setting up routes
connectDB().then(() => {
  // Middleware
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(cookieParser());

  // Routes
  app.use('/auth', require('./routes/auth'));
  app.use('/user', require('./routes/user'));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});