const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Added db import

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

// Get all orders
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by id (public access for order confirmation)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    // ক্লায়েন্টের IP সংগ্রহ
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    req.body.ip_address = ip;
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.update(req.params.id, req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Order.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search orders by order id or phone
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Missing query' });
    const results = await Order.search(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get incomplete orders (for admin panel)
router.get('/incomplete', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, 
             GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as product_names,
             GROUP_CONCAT(p.name SEPARATOR ', ') as products_list
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.status IN ('incomplete', 'abandoned')
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    
    // Format the orders with products
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`, 
        [order.id]
      );
      order.products = items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price
      }));
    }
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get delivered orders (for admin panel)
router.get('/delivered', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, 
             GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as product_names,
             GROUP_CONCAT(p.name SEPARATOR ', ') as products_list
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.status IN ('delivered', 'courier_hold', 'courier_return', 'paid', 'return', 'damaged')
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    
    // Format the orders with products
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`, 
        [order.id]
      );
      order.products = items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price
      }));
    }
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order status history
router.get('/:id/status-history', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Get order details first
    const [orderRows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderRows[0];
    const currentUser = req.user ? req.user.email : 'Admin';
    
    // Create comprehensive status history (only if no existing history)
    const history = [];
    
    // 1. Order creation entry (always add this)
    history.push({
      id: 1,
      order_id: orderId,
      created_at: order.created_at,
      notes: `${order.id} Order Has Been Created by ${currentUser}`,
      user: currentUser
    });
    
    // 2. Status changes (if any) - only add if status is not pending
    if (order.status && order.status !== 'pending') {
      history.push({
        id: 2,
        order_id: orderId,
        created_at: order.updated_at || order.created_at,
        notes: `${currentUser} Successfully Update ${order.id} Order status to ${order.status}`,
        user: currentUser
      });
    }
    
    // 3. Courier updates (if courier exists)
    if (order.courier) {
      history.push({
        id: 3,
        order_id: orderId,
        created_at: order.updated_at || order.created_at,
        notes: `${order.courier} Entry Success <br> Parcel ID : ${order.id}<br>Status : in_review<br>COD Amount : ${order.total}`,
        user: 'Courier System'
      });
    }
    
    // 4. Payment status changes
    if (order.payment_status && order.payment_status !== 'pending') {
      history.push({
        id: 4,
        order_id: orderId,
        created_at: order.updated_at || order.created_at,
        notes: `Payment status updated to ${order.payment_status}`,
        user: currentUser
      });
    }
    
    // 5. Additional notes from order_note field
    if (order.order_note) {
      history.push({
        id: 5,
        order_id: orderId,
        created_at: order.updated_at || order.created_at,
        notes: order.order_note,
        user: currentUser
      });
    }
    
    // Sort by created_at (newest first)
    history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(history);
  } catch (err) {
    console.error('Error fetching order status history:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add note to order status history
router.post('/:id/status-history', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { notes } = req.body;
    const currentUser = req.user ? req.user.email : 'Admin';
    
    if (!notes || !notes.trim()) {
      return res.status(400).json({ error: 'Notes are required' });
    }
    
    // Add note to history (in real implementation, you'd save to database)
    const newNote = {
      id: Date.now(),
      order_id: orderId,
      created_at: new Date().toISOString(),
      notes: notes.trim(),
      user: currentUser
    };
    
    res.status(201).json(newNote);
  } catch (err) {
    console.error('Error adding note to order status history:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 