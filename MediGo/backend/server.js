const app = require('./app');
const connectDB = require('./config/db.config');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 