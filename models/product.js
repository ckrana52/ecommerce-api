// ✅ UPDATED Product Model (Node.js backend)
const db = require('../db');

const Product = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM products');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },
  async create(data) {
    const { name, sku, code, description, price, purchase_price, sale_price, category_id, image, images, stock, categories, sizeList, colorList, weightList, variants } = data;
    const [result] = await db.query(
      'INSERT INTO products (name, sku, code, description, price, purchase_price, sale_price, category_id, image, images, stock, categories, sizeList, colorList, weightList, variants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, sku, code, description, price, purchase_price, sale_price, category_id, image, images, stock, categories, JSON.stringify(sizeList||[]), JSON.stringify(colorList||[]), JSON.stringify(weightList||[]), JSON.stringify(variants || [])]
    );
    return { id: result.insertId, name, sku, code, description, price, purchase_price, sale_price, category_id, image, images, stock, categories, sizeList, colorList, weightList, variants };
  },
  async update(id, data) {
    const { name, sku, code, description, price, purchase_price, sale_price, category_id, image, images, stock, categories, sizeList, colorList, weightList, variants } = data;
    await db.query(
      'UPDATE products SET name = ?, sku = ?, code = ?, description = ?, price = ?, purchase_price = ?, sale_price = ?, category_id = ?, image = ?, images = ?, stock = ?, categories = ?, sizeList = ?, colorList = ?, weightList = ?, variants = ? WHERE id = ?',
      [name, sku, code, description, price, purchase_price, sale_price, category_id, image, images, stock, categories, JSON.stringify(sizeList||[]), JSON.stringify(colorList||[]), JSON.stringify(weightList||[]), JSON.stringify(variants || []), id]
    );
    return { id, name, sku, code, description, price, purchase_price, sale_price, category_id, image, images, stock, categories, sizeList, colorList, weightList, variants };
  },
  async delete(id) {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Product; 
