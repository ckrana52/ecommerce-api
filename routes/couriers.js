const express = require('express');
const router = express.Router();
const Courier = require('../models/courier');
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// Get all couriers
router.get('/', async (req, res) => {
  try {
    const couriers = await Courier.getAll();
    res.json(couriers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint (MUST come before /:id route)
router.get('/test', (req, res) => {
  res.json({ message: 'Couriers API is working', timestamp: new Date().toISOString() });
});

// Update courier status by name (MUST come before /:id route)
router.patch('/status/:name', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const courier = await Courier.updateStatus(req.params.name, status);
    res.json(courier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update courier by name (MUST come before /:id route)
router.put('/name/:name', authMiddleware, adminOnly, async (req, res) => {
  try {
    const courier = await Courier.updateByName(req.params.name, req.body);
    res.json(courier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create courier
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const courier = await Courier.create(req.body);
    res.status(201).json(courier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get courier by id
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const courier = await Courier.getById(req.params.id);
    if (!courier) return res.status(404).json({ error: 'Not found' });
    res.json(courier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update courier
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const courier = await Courier.update(req.params.id, req.body);
    res.json(courier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete courier
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Courier.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 