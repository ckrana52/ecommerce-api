const express = require('express');
const router = express.Router();
const City = require('../models/city');

// Get all cities
router.get('/', async (req, res) => {
  try {
    const cities = await City.getAll();
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get city by id
router.get('/:id', async (req, res) => {
  try {
    const city = await City.getById(req.params.id);
    if (!city) return res.status(404).json({ error: 'Not found' });
    res.json(city);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create city
router.post('/', async (req, res) => {
  try {
    const { name, delivery_charge, status } = req.body;
    if (!name) return res.status(400).json({ error: 'City name is required' });
    const city = await City.create({ name, delivery_charge, status });
    res.status(201).json(city);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update city
router.put('/:id', async (req, res) => {
  try {
    const { name, delivery_charge, status } = req.body;
    if (!name) return res.status(400).json({ error: 'City name is required' });
    await City.update(req.params.id, { name, delivery_charge, status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete city
router.delete('/:id', async (req, res) => {
  try {
    await City.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 