const db = require('../db');

const Settings = {
  async getAll(group = null) {
    try {
      if (group) {
        const [rows] = await db.query('SELECT * FROM settings WHERE `group` = ? ORDER BY `key`', [group]);
        return rows;
      }
      const [rows] = await db.query('SELECT * FROM settings ORDER BY `group`, `key`');
      return rows;
    } catch (error) {
      console.error('Error in Settings.getAll:', error);
      throw error;
    }
  },

  async getByKey(key) {
    try {
      const [rows] = await db.query('SELECT * FROM settings WHERE `key` = ?', [key]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Settings.getByKey:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const { group = 'general', key, value, description } = data;
      console.log('Settings.create input:', { group, key, value, description });
      
      // Simple insert without timestamp functions
      const [result] = await db.query(
        'INSERT INTO settings (`group`, `key`, `value`, `description`) VALUES (?, ?, ?, ?)',
        [group, key, value, description]
      );
      
      console.log('Insert result:', result);
      
      // Return the created setting
      const [newSetting] = await db.query('SELECT * FROM settings WHERE id = ?', [result.insertId]);
      return newSetting[0];
    } catch (error) {
      console.error('Error in Settings.create:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const { value, description } = data;
      console.log('Settings.update input:', { id, value, description });
      
      // Simple update query
      const [result] = await db.query(
        'UPDATE settings SET `value` = ?, `description` = ? WHERE id = ?',
        [value, description, id]
      );
      
      console.log('Update result:', result);
      
      // Return updated setting
      const [updated] = await db.query('SELECT * FROM settings WHERE id = ?', [id]);
      return updated[0];
    } catch (error) {
      console.error('Error in Settings.update:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM settings WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Settings.delete:', error);
      throw error;
    }
  },

  // Simple upsert using basic logic instead of MySQL ON DUPLICATE KEY
  async upsert(data) {
    try {
      const { group = 'general', key, value, description } = data;
      console.log('Settings.upsert input:', { group, key, value, description });
      
      // Check if record exists
      const existing = await this.getByKey(key);
      
      if (existing) {
        // Update existing record
        console.log('Updating existing setting:', existing.id);
        return await this.update(existing.id, { value, description });
      } else {
        // Create new record
        console.log('Creating new setting');
        return await this.create({ group, key, value, description });
      }
    } catch (error) {
      console.error('Error in Settings.upsert:', error);
      throw error;
    }
  }
};

module.exports = Settings;