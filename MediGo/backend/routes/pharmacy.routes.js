const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.get('/', pharmacyController.getAllPharmacies);
router.get('/nearby', pharmacyController.getNearbyPharmacies);
router.get('/:id', pharmacyController.getPharmacy);

// Protected routes
router.post('/', authMiddleware, pharmacyController.createPharmacy);
router.put('/:id', authMiddleware, pharmacyController.updatePharmacy);
router.put('/:id/status', authMiddleware, pharmacyController.updatePharmacyStatus);

module.exports = router;
