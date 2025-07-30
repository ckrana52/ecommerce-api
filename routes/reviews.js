const express = require('express');
const router = express.Router();
const Review = require('../models/review');
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

// Get all reviews
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.getAll();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get review by id
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const review = await Review.getById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create review
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update review
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const review = await Review.update(req.params.id, req.body);
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete review
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Review.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 