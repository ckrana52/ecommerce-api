const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get category by id
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category
router.post('/', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });

    let image = req.body.image;
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }

    const category = await Category.create({
      name: name || '',
      description: description || '',
      image: image || ''
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put('/:id', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const name = req.body.name ? req.body.name : '';
    const description = req.body.description ? req.body.description : '';
    let image = req.body.image ? req.body.image : '';
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }

    if (!name) return res.status(400).json({ error: "Category name is required" });

    const updateData = { name, description, image };
    console.log('UpdateData:', updateData);

    await Category.update(req.params.id, updateData);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Category.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 