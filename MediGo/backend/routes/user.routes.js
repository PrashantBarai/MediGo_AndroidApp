const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Get all users
router.get('/', userController.getAllUsers);

// Get single user
router.get('/:id', userController.getUser);

// Create user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router; 