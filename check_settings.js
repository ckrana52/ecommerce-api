require('dotenv').config();
const db = require('./db');

async function checkSettings() {
  try {
    console.log('Checking settings table...');
    
    // Check table structure
    const [structure] = await db.query('DESCRIBE settings');
    console.log('Table structure:', structure);
    
    // Check all data in settings table
    const [allData] = await db.query('SELECT * FROM settings');
    console.log('All settings data:', allData);
    
    // Check specifically for invoice_string
    const [invoiceData] = await db.query('SELECT * FROM settings WHERE `key` = ?', ['invoice_string']);
    console.log('Invoice string data:', invoiceData);
    
    // Check if there are any existing records with the same key
    const [duplicates] = await db.query('SELECT COUNT(*) as count FROM settings WHERE `key` = ?', ['invoice_string']);
    console.log('Number of invoice_string records:', duplicates[0].count);
    
    // Try to delete any existing invoice_string records
    if (invoiceData.length > 0) {
      console.log('Deleting existing invoice_string records...');
      await db.query('DELETE FROM settings WHERE `key` = ?', ['invoice_string']);
      console.log('✅ Deleted existing records');
    }
    
    console.log('✅ Settings table check completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking settings:', error);
    process.exit(1);
  }
}

checkSettings(); 