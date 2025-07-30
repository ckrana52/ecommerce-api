const db = require('../db');

const SMS = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM sms_logs ORDER BY created_at DESC');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM sms_logs WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { customerNumber, content, status, orderId, customerName } = data;
    const [result] = await db.query(
      'INSERT INTO sms_logs (customerNumber, content, status, orderId, customerName, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [customerNumber, content, status || 'Pending', orderId || null, customerName || null]
    );
    return { 
      id: result.insertId, 
      customerNumber, 
      content, 
      status: status || 'Pending',
      orderId: orderId || null,
      customerName: customerName || null,
      created_at: new Date()
    };
  },
  async update(id, data) {
    const { customerNumber, content, status } = data;
    await db.query(
      'UPDATE sms_logs SET customerNumber = ?, content = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [customerNumber, content, status, id]
    );
    return { id, customerNumber, content, status };
  },
  async delete(id) {
    await db.query('DELETE FROM sms_logs WHERE id = ?', [id]);
    return true;
  },
  
  // Auto-message for new orders
  async sendOrderConfirmation(orderData) {
    const { id, name, phone } = orderData;
    const message = `${name} অর্ডারের জন্য ধন্যবাদ । অর্ডার নম্বর - ${id}, কল করা হবে - ${phone}`;
    
    return await this.create({
      customerNumber: phone,
      content: message,
      status: 'Sent',
      orderId: id,
      customerName: name
    });
  },
  
  // Get SMS logs by order ID
  async getByOrderId(orderId) {
    const [rows] = await db.query('SELECT * FROM sms_logs WHERE orderId = ? ORDER BY created_at DESC', [orderId]);
    return rows;
  }
};

module.exports = SMS; 