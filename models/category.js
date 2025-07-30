const db = require('../db');

const Category = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM categories');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { name, description, image } = data;
    const [result] = await db.query(
      'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
      [name, description, image]
    );
    return { id: result.insertId, name, description, image };
  },
  async update(id, data) {
    const { name, description, image } = data;
    await db.query(
      'UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?',
      [name, description, image, id]
    );
    return { id, name, description, image };
  },
  async delete(id) {
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Category; 