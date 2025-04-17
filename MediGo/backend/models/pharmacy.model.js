const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true,
  },
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  deliveryRadius: {
    type: Number,
    default: 5 // in kilometers
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  minimumOrderAmount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);
