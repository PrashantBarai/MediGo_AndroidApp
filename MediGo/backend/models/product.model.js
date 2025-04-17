const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Nutritional Drinks',
      'Ayurveda',
      'Vitamins & Supplement',
      'Healthcare Devices',
      'Homeopathy',
      'Diabetes Care'
    ],
  },
  image: {
    type: String,
    required: true,
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  ingredients: [{
    type: String
  }],
  dosage: {
    type: String
  },
  sideEffects: {
    type: String
  },
  storageInstructions: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
