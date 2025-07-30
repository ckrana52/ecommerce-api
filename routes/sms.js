const express = require('express');
const router = express.Router();
const SMS = require('../models/sms');
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

// Get all SMS logs
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const logs = await SMS.getAll();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get SMS log by id
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const log = await SMS.getById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create SMS log
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const log = await SMS.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-send order confirmation SMS
router.post('/auto/order-confirmation', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { orderId, customerName, phone } = req.body;
    if (!orderId || !customerName || !phone) {
      return res.status(400).json({ error: 'Missing required fields: orderId, customerName, phone' });
    }
    
    const log = await SMS.sendOrderConfirmation({ id: orderId, name: customerName, phone });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get SMS logs by order ID
router.get('/order/:orderId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const logs = await SMS.getByOrderId(req.params.orderId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update SMS log
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const log = await SMS.update(req.params.id, req.body);
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete SMS log
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await SMS.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 