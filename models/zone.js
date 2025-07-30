const db = require('../db');

const Zone = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT z.*, c.name as city_name 
      FROM zones z 
      LEFT JOIN cities c ON z.city_id = c.id 
      ORDER BY z.name ASC
    `);
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query(`
      SELECT z.*, c.name as city_name 
      FROM zones z 
      LEFT JOIN cities c ON z.city_id = c.id 
      WHERE z.id = ?
    `, [id]);
    return rows[0];
  },
  async create(data) {
    const { name, city_id, delivery_charge = 0, status = 'active' } = data;
    const [result] = await db.query(
      'INSERT INTO zones (name, city_id, delivery_charge, status) VALUES (?, ?, ?, ?)', 
      [name, city_id, delivery_charge, status]
    );
    return { id: result.insertId, name, city_id, delivery_charge, status };
  },
  async update(id, data) {
    const { name, city_id, delivery_charge, status } = data;
    await db.query(
      'UPDATE zones SET name = ?, city_id = ?, delivery_charge = ?, status = ? WHERE id = ?', 
      [name, city_id, delivery_charge, status, id]
    );
    return { id, name, city_id, delivery_charge, status };
  },
  async delete(id) {
    await db.query('DELETE FROM zones WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Zone; 