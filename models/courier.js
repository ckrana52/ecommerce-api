const db = require('../db');

const Courier = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM couriers ORDER BY name');
    return rows;
  },
  
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM couriers WHERE id = ?', [id]);
    return rows[0];
  },
  
  async getByName(name) {
    const [rows] = await db.query('SELECT * FROM couriers WHERE name = ?', [name]);
    return rows[0];
  },
  
  async create(data) {
    const { name, api_url, api_key, status } = data;
    const [result] = await db.query(
      'INSERT INTO couriers (name, api_url, api_key, status) VALUES (?, ?, ?, ?)',
      [name, api_url, api_key, status || 'active']
    );
    return { id: result.insertId, name, api_url, api_key, status: status || 'active' };
  },
  
  async update(id, data) {
    const { name, api_url, api_key, status } = data;
    await db.query(
      'UPDATE couriers SET name = ?, api_url = ?, api_key = ?, status = ? WHERE id = ?',
      [name, api_url, api_key, status, id]
    );
    return { id, name, api_url, api_key, status };
  },
  
  async updateByName(name, data) {
    const { api_url, api_key, status } = data;
    await db.query(
      'UPDATE couriers SET api_url = ?, api_key = ?, status = ? WHERE name = ?',
      [api_url, api_key, status, name]
    );
    return { name, api_url, api_key, status };
  },
  
  async updateStatus(name, status) {
    await db.query(
      'UPDATE couriers SET status = ? WHERE name = ?',
      [status, name]
    );
    return { name, status };
  },
  
  async delete(id) {
    await db.query('DELETE FROM couriers WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Courier; 