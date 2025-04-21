const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  discount: {
    percentage: Number,
    validUntil: String
  }
});

const deliveryAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: {
    type: String
  },
  landmark: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String
  },
  pincode: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'guest'
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 50
  },
  totalSavings: {
    type: Number,
    default: 0
  },
  deliveryAddress: {
    type: deliveryAddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod', 'card', 'upi']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total savings before saving
orderSchema.pre('save', function(next) {
  this.totalSavings = this.items.reduce((savings, item) => {
    if (item.discount && item.discount.percentage) {
      const originalTotal = item.originalPrice * item.quantity;
      const discountedTotal = item.price * item.quantity;
      return savings + (originalTotal - discountedTotal);
    }
    return savings;
  }, 0);
  next();
});

module.exports = mongoose.model('Order', orderSchema);
