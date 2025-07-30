const db = require('../db');

const Slider = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM sliders');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM sliders WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { title, image, link, status } = data;
    const [result] = await db.query(
      'INSERT INTO sliders (title, image, link, status) VALUES (?, ?, ?, ?)',
      [title, image, link, status || 'active']
    );
    return { id: result.insertId, title, image, link, status: status || 'active' };
  },
  async update(id, data) {
    const { title, image, link, status } = data;
    await db.query(
      'UPDATE sliders SET title = ?, image = ?, link = ?, status = ? WHERE id = ?',
      [title, image, link, status, id]
    );
    return { id, title, image, link, status };
  },
  async delete(id) {
    await db.query('DELETE FROM sliders WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Slider; 