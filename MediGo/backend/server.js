const express = require('express');
const cors = require('cors');
const { BACKEND_API_URL, FRONTEND_URL } = require('./src/config/config');
const connectDB = require('./config/db.config');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: FRONTEND_URL
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 