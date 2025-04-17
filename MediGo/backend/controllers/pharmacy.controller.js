const Pharmacy = require('../models/pharmacy.model');
const User = require('../models/user.model');

// Get all pharmacies
exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find().populate('user', 'name email phone');
    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get nearby pharmacies
exports.getNearbyPharmacies = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radius in meters

    const pharmacies = await Pharmacy.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    }).populate('user', 'name email phone');

    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single pharmacy
exports.getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate('user', 'name email phone');
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create pharmacy
exports.createPharmacy = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'pharmacy') {
      return res.status(403).json({ message: 'Only pharmacy users can create pharmacy profiles' });
    }

    const existingPharmacy = await Pharmacy.findOne({ user: req.user.id });
    if (existingPharmacy) {
      return res.status(400).json({ message: 'Pharmacy profile already exists' });
    }

    const pharmacy = new Pharmacy({
      ...req.body,
      user: req.user.id,
    });

    await pharmacy.save();
    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update pharmacy
exports.updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (pharmacy.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this pharmacy' });
    }

    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedPharmacy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update pharmacy status
exports.updatePharmacyStatus = async (req, res) => {
  try {
    const { isOpen } = req.body;
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (pharmacy.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this pharmacy' });
    }

    pharmacy.isOpen = isOpen;
    await pharmacy.save();

    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
