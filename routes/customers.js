const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
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

// Get all customers
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by id
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const customer = await Customer.getById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create customer
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const customer = await Customer.update(req.params.id, req.body);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Customer.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 