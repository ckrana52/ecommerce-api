const express = require('express');
const router = express.Router();
const Slider = require('../models/slider');
const multer = require('multer');
const path = require('path');

// Multer config
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

// Get all sliders
router.get('/', async (req, res) => {
  try {
    const sliders = await Slider.getAll();
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get slider by id
router.get('/:id', async (req, res) => {
  try {
    const slider = await Slider.getById(req.params.id);
    if (!slider) return res.status(404).json({ error: 'Not found' });
    res.json(slider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create slider (with image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let data = req.body;
    if (req.file) {
      data.image = '/uploads/' + req.file.filename;
    }
    const slider = await Slider.create(data);
    res.status(201).json(slider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update slider (with image upload)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    let data = req.body;
    if (req.file) {
      data.image = '/uploads/' + req.file.filename;
    }
    const slider = await Slider.update(req.params.id, data);
    res.json(slider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete slider
router.delete('/:id', async (req, res) => {
  try {
    await Slider.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 