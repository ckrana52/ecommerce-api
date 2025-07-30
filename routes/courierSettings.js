const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Courier Settings router is working!' });
});

// Get all courier settings
router.get('/', (req, res) => {
  res.json([
    { courier_name: 'steadfast', is_active: false },
    { courier_name: 'pathao', is_active: false },
    { courier_name: 'redx', is_active: false },
    { courier_name: 'ecourier', is_active: false },
    { courier_name: 'paperfly', is_active: false },
    { courier_name: 'parceldex', is_active: false },
    { courier_name: 'bahok', is_active: false }
  ]);
});

// Update courier status
router.patch('/:courierName/status', (req, res) => {
  const { courierName } = req.params;
  const { is_active } = req.body;
  res.json({ courier_name: courierName, is_active: is_active });
});

module.exports = router; 