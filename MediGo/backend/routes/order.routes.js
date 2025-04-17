const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protected routes
router.get('/', authMiddleware, orderController.getAllOrders);
router.get('/user', authMiddleware, orderController.getOrdersByUser);
router.get('/pharmacy', authMiddleware, orderController.getOrdersByPharmacy);
router.get('/:id', authMiddleware, orderController.getOrder);
router.post('/', authMiddleware, orderController.createOrder);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.put('/:id/payment', authMiddleware, orderController.updatePaymentStatus);

module.exports = router;
