const Order = require('../models/order.model');
const Product = require('../models/product.model');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name price image category manufacturer');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders by user
exports.getOrdersByUser = async (req, res) => {
  try {
    // TODO: Replace with Firebase userId when auth is implemented
    const userId = req.query.userId || 'guest';
    
    const orders = await Order.find({ userId })
      .populate('items.product', 'name price image category manufacturer');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders by pharmacy
exports.getOrdersByPharmacy = async (req, res) => {
  try {
    const orders = await Order.find({ pharmacy: req.user.id })
      .populate('user', 'name email phone')
      .populate('items.product', 'name price image');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price image category manufacturer');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // TODO: Add Firebase auth check here later
    // if (order.userId !== req.user.uid) {
    //   return res.status(403).json({ message: 'Not authorized to view this order' });
    // }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!items || !items.length || !totalAmount || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate phone number format (country code + 10 digits)
    const phoneRegex = /^\+\d{2,3}\d{10}$/;
    if (!phoneRegex.test(deliveryAddress.phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Must include country code (e.g., +91) followed by 10 digits'
      });
    }

    // Validate required address fields
    if (!deliveryAddress.fullName || !deliveryAddress.addressLine1 || !deliveryAddress.city || !deliveryAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required address fields (fullName, addressLine1, city, pincode)'
      });
    }

    // Create order
    const order = new Order({
      // TODO: Replace with Firebase userId when auth is implemented
      userId: 'guest',
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice,
        discount: item.discount
      })),
      totalAmount,
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phoneNumber: deliveryAddress.phoneNumber,
        addressLine1: deliveryAddress.addressLine1,
        addressLine2: deliveryAddress.addressLine2,
        landmark: deliveryAddress.landmark,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode
      },
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      orderDate: new Date()
    });

    // Save order
    await order.save();

    // Update product quantities and total quantity ordered
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          stock: -item.quantity,
          totalQuantityOrdered: item.quantity 
        }
      }, { new: true });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order. Please try again.',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to update this order
    if (order.pharmacy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to update this order
    if (order.pharmacy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.paymentStatus = paymentStatus;
    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus !== 'placed' && order.orderStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in its current status'
      });
    }

    // Update order status to cancelled
    order.orderStatus = 'cancelled';
    await order.save();

    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          stock: item.quantity,
          totalQuantityOrdered: -item.quantity 
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};
