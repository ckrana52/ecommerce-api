const express = require('express');
const router = express.Router();
const Settings = require('../models/settings'); // Adjust path as needed
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

// Get settings
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const group = req.query.group;
    const settings = await Settings.getAll(group);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public GET settings
router.get('/public', async (req, res) => {
  try {
    const group = req.query.group;
    const settings = await Settings.getAll(group);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get invoice string
router.get('/invoice-string', async (req, res) => {
  try {
    const setting = await Settings.getByKey('invoice_string');
    res.json({ invoiceString: setting ? setting.value : '' });
  } catch (err) {
    console.error('Error getting invoice string:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update invoice string - Simplified version
router.put('/invoice-string', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('=== Invoice String Update Request ===');
    console.log('Request body:', req.body);
    
    const { invoiceString } = req.body;
    
    if (invoiceString === undefined) {
      return res.status(400).json({ error: 'Invoice string is required' });
    }
    
    console.log('Invoice string value:', invoiceString);
    
    // Use simple upsert
    const setting = await Settings.upsert({
      group: 'general',
      key: 'invoice_string',
      value: invoiceString,
      description: 'Invoice string for the application'
    });
    
    console.log('Setting saved successfully:', setting);
    
    res.json({ 
      success: true, 
      message: 'Invoice string updated successfully',
      data: setting 
    });
  } catch (err) {
    console.error('Error in invoice-string PUT:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update multiple settings at once
router.put('/bulk', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('=== Bulk Settings Update ===');
    const settingsData = req.body;
    console.log('Settings data:', settingsData);
    
    const results = [];
    
    for (const [key, value] of Object.entries(settingsData)) {
      try {
        console.log(`Processing setting: ${key} = ${value}`);
        
        const result = await Settings.upsert({
          group: 'general',
          key: key,
          value: value,
          description: `Setting for ${key}`
        });
        
        results.push(result);
        console.log(`Successfully processed: ${key}`);
      } catch (err) {
        console.error(`Error updating setting ${key}:`, err);
        results.push({ key, error: err.message });
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Settings updated',
      results 
    });
  } catch (err) {
    console.error('Error in bulk update:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create/Update single setting
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const setting = await Settings.create(req.body);
    res.status(201).json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update single setting by ID
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const setting = await Settings.update(req.params.id, req.body);
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete setting
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Settings.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;