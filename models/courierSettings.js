const db = require('../db');

const CourierSettings = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM courier_settings ORDER BY courier_name');
    return rows;
  },

  async getByCourier(courierName) {
    const [rows] = await db.query('SELECT * FROM courier_settings WHERE courier_name = ?', [courierName]);
    return rows[0];
  },

  async create(data) {
    const { 
      courier_name, 
      is_active, 
      api_key, 
      secret_key, 
      base_url, 
      merchant_id, 
      client_id, 
      client_secret, 
      username, 
      password, 
      user_id, 
      merchant_code, 
      api_version 
    } = data;
    
    const [result] = await db.query(
      `INSERT INTO courier_settings (
        courier_name, is_active, api_key, secret_key, base_url, merchant_id, 
        client_id, client_secret, username, password, user_id, merchant_code, api_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [courier_name, is_active, api_key, secret_key, base_url, merchant_id, 
       client_id, client_secret, username, password, user_id, merchant_code, api_version]
    );
    
    return { id: result.insertId, courier_name, is_active, ...data };
  },

  async update(courierName, data) {
    const { 
      is_active, 
      api_key, 
      secret_key, 
      base_url, 
      merchant_id, 
      client_id, 
      client_secret, 
      username, 
      password, 
      user_id, 
      merchant_code, 
      api_version 
    } = data;
    
    await db.query(
      `UPDATE courier_settings SET 
        is_active = ?, api_key = ?, secret_key = ?, base_url = ?, merchant_id = ?,
        client_id = ?, client_secret = ?, username = ?, password = ?, user_id = ?, 
        merchant_code = ?, api_version = ?, updated_at = CURRENT_TIMESTAMP
       WHERE courier_name = ?`,
      [is_active, api_key, secret_key, base_url, merchant_id, 
       client_id, client_secret, username, password, user_id, 
       merchant_code, api_version, courierName]
    );
    
    return { courier_name: courierName, is_active, ...data };
  },

  async updateStatus(courierName, isActive) {
    await db.query(
      'UPDATE courier_settings SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE courier_name = ?',
      [isActive, courierName]
    );
    return { courier_name: courierName, is_active: isActive };
  },

  async delete(courierName) {
    await db.query('DELETE FROM courier_settings WHERE courier_name = ?', [courierName]);
    return true;
  },

  async initializeDefaults() {
    const defaultCouriers = [
      { courier_name: 'steadfast', is_active: false },
      { courier_name: 'pathao', is_active: false },
      { courier_name: 'redx', is_active: false },
      { courier_name: 'ecourier', is_active: false },
      { courier_name: 'paperfly', is_active: false },
      { courier_name: 'parceldex', is_active: false },
      { courier_name: 'bahok', is_active: false }
    ];

    for (const courier of defaultCouriers) {
      const existing = await this.getByCourier(courier.courier_name);
      if (!existing) {
        await this.create(courier);
      }
    }
  }
};

module.exports = CourierSettings; 