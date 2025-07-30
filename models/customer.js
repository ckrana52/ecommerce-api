const db = require('../db');

const Customer = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM customers ORDER BY id DESC');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { name, email, phone, address } = data;
    const [result] = await db.query(
      'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address]
    );
    return { id: result.insertId, name, email, phone, address };
  },
  async update(id, data) {
    const { name, email, phone, address } = data;
    await db.query(
      'UPDATE customers SET name=?, email=?, phone=?, address=? WHERE id=?',
      [name, email, phone, address, id]
    );
    return { id, name, email, phone, address };
  },
  async delete(id) {
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Customer; 