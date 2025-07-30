const db = require('../db');
const Customer = require('./customer');
const SMS = require('./sms');

const Order = {
  async getAll() {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC, id DESC');
    for (const order of orders) {
      // প্রতিটি অর্ডারের জন্য products ফিল্ড যোগ করুন
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
      // created_by, updated_by, updated_at, note ফিল্ডও পাঠান (যদি থাকে)
      // ধরে নিচ্ছি orders টেবিলে এই ফিল্ডগুলো আছে
    }
    return orders;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    
    const order = rows[0];
    
    // Fetch order products
    const [items] = await db.query(
      `SELECT oi.*, p.name, p.image, p.code 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`, 
      [id]
    );
    
    order.products = items.map(item => ({
      id: item.product_id,
      product_id: item.product_id,
      name: item.name,
      image: item.image,
      code: item.code,
      quantity: item.quantity,
      price: item.price
    }));
    
    return order;
  },
  async create(data) {
    const { name, phone, address, user_id, total, status, items, email, note, ip_address, created_by } = data;

    // Validate minimum requirements
    if (!phone || phone.trim() === '') {
      throw new Error('Phone number is required');
    }

    if (!items || items.length === 0) {
      throw new Error('At least one product is required');
    }

    // Auto add customer if not exists (by phone or email)
    let customerId = null;
    if (phone || email) {
      let customer = null;
      if (phone) {
        const [rows] = await db.query('SELECT * FROM customers WHERE phone = ?', [phone]);
        customer = rows[0];
      }
      if (!customer && email) {
        const [rows] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
        customer = rows[0];
      }
      if (!customer) {
        // Create new customer with available data
        const customerData = {
          name: name || `Customer-${phone}`, // Use phone as name if name not provided
          email: email || null,
          phone: phone,
          address: address || null
        };
        const cust = await Customer.create(customerData);
        customerId = cust.id;
      } else {
        customerId = customer.id;
      }
    }

    // Enhanced INSERT query with payment_status and other fields
    const [result] = await db.query(
      'INSERT INTO orders (name, phone, address, total, status, customer_id, payment_status, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, phone, address, total, status || 'incomplete', customerId, data.payment_status || 'pending', data.ip_address || null]
    );
    const orderId = result.insertId;
    
    if (items && items.length) {
      for (const item of items) {
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );
      }
    }

    // Auto-send SMS confirmation if phone number is provided
    if (phone && name) {
      try {
        await SMS.sendOrderConfirmation({ id: orderId, name, phone });
      } catch (smsError) {
        console.error('Failed to send auto SMS:', smsError);
        // Don't fail the order creation if SMS fails
      }
    }

    return { id: orderId, name, phone, address, total, status: status || 'pending', items };
  },
  async update(id, data) {
    const { name, address, status, payment_status, total, phone, courier, note, products } = data;
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    
    if (payment_status !== undefined) {
      updates.push('payment_status = ?');
      values.push(payment_status);
    }
    
    if (total !== undefined) {
      updates.push('total = ?');
      values.push(total);
    }
    
    if (courier !== undefined) {
      updates.push('courier = ?');
      values.push(courier);
    }
    
    if (note !== undefined) {
      updates.push('note = ?');
      values.push(note);
    }
    
    if (updates.length === 0) {
      return { id, message: 'No fields to update' };
    }
    
    values.push(id);
    const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;
    
    await db.query(query, values);
    
    // Update order items if products are provided
    if (products && Array.isArray(products)) {
      // Delete existing order items
      await db.query('DELETE FROM order_items WHERE order_id = ?', [id]);
      
      // Insert new order items
      for (const item of products) {
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [id, item.product_id || item.id, item.quantity, item.price]
        );
      }
    }
    
    // Return updated order with products
    return await this.getById(id);
  },
  async delete(id) {
    await db.query('DELETE FROM orders WHERE id = ?', [id]);
    await db.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    return true;
  },
  async search(query) {
    // query can be order id or phone (partial)
    let sql = 'SELECT * FROM orders WHERE id = ? OR phone LIKE ?';
    let params = [query, `%${query}%`];
    const [rows] = await db.query(sql, params);
    return rows;
  }
};

module.exports = Order; 