const db = require('../db');

const User = {
  async create({ name, email, password, role = 'customer' }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return { id: result.insertId, name, email, role };
  },
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },
  async getAll() {
    const [rows] = await db.query('SELECT id, name, email, role FROM users');
    return rows;
  }
};

module.exports = User; 