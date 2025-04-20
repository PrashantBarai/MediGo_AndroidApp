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
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Tablets',
      'Syrups',
      'Devices',
      'Supplements',
      'Protection'
    ],
  },
  images: [{
    type: String
  }],
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  discount: {
    percentage: {
      type: Number,
      default: 0
    },
    validUntil: {
      type: String
    }
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  manufacturingDate: {
    type: String,
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
