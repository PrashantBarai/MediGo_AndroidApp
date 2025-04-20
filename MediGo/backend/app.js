const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const errorMiddleware = require('./middleware/error.middleware');
const { testB2Connection } = require('./services/b2.service');
require('dotenv').config();

// Check if B2 environment variables are loaded
console.log('B2 Environment Variables:');
console.log('B2_ACCOUNT_ID:', process.env.B2_ACCOUNT_ID ? 'Set' : 'Not Set');
console.log('B2_APPLICATION_KEY:', process.env.B2_APPLICATION_KEY ? 'Set' : 'Not Set');
console.log('B2_BUCKET_ID:', process.env.B2_BUCKET_ID ? 'Set' : 'Not Set');
console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME ? 'Set' : 'Not Set');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const pharmacyRoutes = require('./routes/pharmacy.routes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pharmacies', pharmacyRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Test B2 connection
(async () => {
  try {
    await testB2Connection();
  } catch (error) {
    console.error('Failed to test B2 connection:', error);
  }
})();

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 