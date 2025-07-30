const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
router.post('/', authMiddleware, adminOnly, upload.array('images'), async (req, res) => {
  try {
    let data = req.body;
    if (typeof data.variants === 'string') {
      try { data.variants = JSON.parse(data.variants); } catch { data.variants = []; }
    }
    if (req.files && req.files.length > 0) {
      data.images = JSON.stringify(req.files.map(f => '/uploads/' + f.filename));
      data.image = '/uploads/' + req.files[0].filename;
    } else {
      data.images = JSON.stringify([]);
    }
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/:id', authMiddleware, adminOnly, upload.array('images'), async (req, res) => {
  try {
    let data = req.body;
    if (typeof data.variants === 'string') {
      try { data.variants = JSON.parse(data.variants); } catch { data.variants = []; }
    }
    const prevProduct = await Product.getById(req.params.id);
    let existingImages = [];
    if (data.existingImages) {
      try { existingImages = JSON.parse(data.existingImages); } catch { existingImages = []; }
    } else if (prevProduct.images) {
      try { existingImages = JSON.parse(prevProduct.images); } catch { existingImages = []; }
    }
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(f => '/uploads/' + f.filename);
    }
    data.images = JSON.stringify([...existingImages, ...newImages]);
    data.image = [...existingImages, ...newImages][0] || '';
    const product = await Product.update(req.params.id, data);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 