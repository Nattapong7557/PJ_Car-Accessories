const { pool } = require('./config/db');

async function fixPrices() {
  try {
    const res = await pool.query(`
      UPDATE parts 
      SET price = COALESCE(original_price, price), original_price = NULL 
      WHERE (badge IS NULL OR badge = 'new') AND original_price IS NOT NULL
      RETURNING id, badge, price
    `);
    
    console.log(`Updated ${res.rowCount} products to remove discounts.`);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixPrices();
