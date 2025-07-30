require('dotenv').config();
const db = require('./db');

async function fixSettingsTable() {
  try {
    console.log('Fixing settings table structure...');
    
    // First, let's see the current structure
    const [currentStructure] = await db.query('DESCRIBE settings');
    console.log('Current table structure:', currentStructure);
    
    // Change value column from DOUBLE to TEXT
    await db.query('ALTER TABLE settings MODIFY COLUMN `value` TEXT');
    console.log('✅ Successfully changed value column to TEXT');
    
    // Verify the change
    const [newStructure] = await db.query('DESCRIBE settings');
    console.log('New table structure:', newStructure);
    
    console.log('✅ Settings table fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing settings table:', error);
    process.exit(1);
  }
}

fixSettingsTable(); 