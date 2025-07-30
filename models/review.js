const db = require('../db');

const Review = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM reviews');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { product_id, user_id, name, rating, comment } = data;
    const [result] = await db.query(
      'INSERT INTO reviews (product_id, user_id, name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [product_id, user_id, name, rating, comment]
    );
    return { id: result.insertId, product_id, user_id, name, rating, comment };
  },
  async update(id, data) {
    const { rating, comment } = data;
    await db.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, id]
    );
    return { id, rating, comment };
  },
  async delete(id) {
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Review; 