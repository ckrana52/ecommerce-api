const express = require('express');
const router = express.Router();
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

// GET /api/reports/summary
router.get('/summary', authMiddleware, adminOnly, (req, res) => {
  res.json({
    totalRevenue: 120000,
    totalOrders: 320,
    totalStore: 5,
    totalUsers: 12
  });
});

// GET /api/reports/hourly-orders
router.get('/hourly-orders', authMiddleware, adminOnly, (req, res) => {
  // 24 random values for 24 hours
  res.json(Array.from({ length: 24 }, () => Math.floor(Math.random() * 100 + 20)));
});

// GET /api/reports/today
router.get('/today', authMiddleware, adminOnly, (req, res) => {
  res.json({
    todayOrder: 12,
    websiteOrder: 8,
    manualOrder: 4,
    processing: 2,
    pendingPayment: 1,
    onHold: 1,
    scheduleDelivery: 0,
    cancelled: 0,
    completed: 6,
    pendingInvoiced: 0,
    invoiced: 2,
    invoiceChecked: 2,
    stockOut: 0,
    delivered: 5,
    courierHold: 0,
    courierReturn: 0,
    paid: 7,
    return: 0,
    damaged: 0
  });
});

// GET /api/reports/product-of-month
router.get('/product-of-month', authMiddleware, adminOnly, (req, res) => {
  res.json([
    { name: 'Product A', count: 120 },
    { name: 'Product B', count: 80 }
  ]);
});

// GET /api/reports/recent-updates
router.get('/recent-updates', authMiddleware, adminOnly, (req, res) => {
  res.json([
    { text: 'Product A updated by Admin1 - 2 hours ago' },
    { text: 'Order #12345 status changed to Delivered - 1 hour ago' }
  ]);
});

module.exports = router; 