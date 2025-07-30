const db = require('../db');

const Page = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM pages');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM pages WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { title, slug, content, status } = data;
    const [result] = await db.query(
      'INSERT INTO pages (title, slug, content, status) VALUES (?, ?, ?, ?)',
      [title, slug, content, status || 'active']
    );
    return { id: result.insertId, title, slug, content, status: status || 'active' };
  },
  async update(id, data) {
    const { title, slug, content, status } = data;
    await db.query(
      'UPDATE pages SET title = ?, slug = ?, content = ?, status = ? WHERE id = ?',
      [title, slug, content, status, id]
    );
    return { id, title, slug, content, status };
  },
  async delete(id) {
    await db.query('DELETE FROM pages WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Page; 