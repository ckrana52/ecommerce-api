const db = require('../db');

const City = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM cities ORDER BY name ASC');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM cities WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { name, delivery_charge = 0, status = 'active' } = data;
    const [result] = await db.query(
      'INSERT INTO cities (name, delivery_charge, status) VALUES (?, ?, ?)', 
      [name, delivery_charge, status]
    );
    return { id: result.insertId, name, delivery_charge, status };
  },
  async update(id, data) {
    const { name, delivery_charge, status } = data;
    await db.query(
      'UPDATE cities SET name = ?, delivery_charge = ?, status = ? WHERE id = ?', 
      [name, delivery_charge, status, id]
    );
    return { id, name, delivery_charge, status };
  },
  async delete(id) {
    await db.query('DELETE FROM cities WHERE id = ?', [id]);
    return true;
  }
};

module.exports = City; 