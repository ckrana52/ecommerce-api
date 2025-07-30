require('dotenv').config();
const db = require('./db');

async function testInvoiceString() {
  try {
    console.log('Testing invoice string functionality...');
    
    // Test 1: Check if settings table exists and has correct structure
    const [tables] = await db.query('SHOW TABLES LIKE "settings"');
    console.log('Settings table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      const [structure] = await db.query('DESCRIBE settings');
      console.log('Table structure:', structure);
    }
    
    // Test 2: Try to insert a test invoice string
    const testData = {
      group: 'general',
      key: 'invoice_string',
      value: 'TestInvoiceString123',
      description: 'Test invoice string'
    };
    
    console.log('Inserting test data:', testData);
    
    const [result] = await db.query(
      'INSERT INTO settings (`group`, `key`, value, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE value=VALUES(value), description=VALUES(description)',
      [testData.group, testData.key, testData.value, testData.description]
    );
    
    console.log('Insert result:', result);
    
    // Test 3: Retrieve the inserted data
    const [rows] = await db.query('SELECT * FROM settings WHERE `key` = ?', ['invoice_string']);
    console.log('Retrieved data:', rows);
    
    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testInvoiceString(); 