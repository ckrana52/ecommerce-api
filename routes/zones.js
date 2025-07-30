const express = require('express');
const router = express.Router();
const Zone = require('../models/zone');

// Get all zones
router.get('/', async (req, res) => {
  try {
    const zones = await Zone.getAll();
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get zone by id
router.get('/:id', async (req, res) => {
  try {
    const zone = await Zone.getById(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Not found' });
    res.json(zone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create zone
router.post('/', async (req, res) => {
  try {
    const { name, city_id, delivery_charge, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Zone name is required' });
    if (!city_id) return res.status(400).json({ error: 'City ID is required' });
    const zone = await Zone.create({ name, city_id, delivery_charge, status });
    res.status(201).json(zone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update zone
router.put('/:id', async (req, res) => {
  try {
    const { name, city_id, delivery_charge, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Zone name is required' });
    await Zone.update(req.params.id, { name, city_id, delivery_charge, status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete zone
router.delete('/:id', async (req, res) => {
  try {
    await Zone.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 