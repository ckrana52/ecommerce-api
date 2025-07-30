const express = require('express');
const router = express.Router();
const Page = require('../models/page');
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

// Get all pages
router.get('/', async (req, res) => {
  try {
    const pages = await Page.getAll();
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get page by id
router.get('/:id', async (req, res) => {
  try {
    const page = await Page.getById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create page
router.post('/', async (req, res) => {
  try {
    const page = await Page.create(req.body);
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get page by slug
router.get('/:slug', authMiddleware, async (req, res) => {
  try {
    const page = await Page.getBySlug(req.params.slug);
    if (!page) return res.status(404).json({ error: 'Not found' });
    res.send(page.content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update page
router.put('/:id', async (req, res) => {
  try {
    const page = await Page.update(req.params.id, req.body);
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update page by slug
router.put('/:slug', authMiddleware, adminOnly, async (req, res) => {
  try {
    const page = await Page.updateBySlug(req.params.slug, req.body.content);
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete page
router.delete('/:id', async (req, res) => {
  try {
    await Page.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 