const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Get all orders
router.get('/', orderController.getAllOrders);

// Get orders by user
router.get('/user', orderController.getOrdersByUser);

// Get single order
router.get('/:id', orderController.getOrder);

// Create order
router.post('/', orderController.createOrder);

// Cancel order
router.put('/:id/cancel', orderController.cancelOrder);

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// Update payment status
router.patch('/:id/payment', orderController.updatePaymentStatus);

module.exports = router;
