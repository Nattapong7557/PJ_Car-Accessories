const { pool } = require('./config/db');

async function updateBadges() {
  try {
    const { rows } = await pool.query('SELECT id FROM parts');
    const badges = ['new', 'sale', 'hot', null];
    
    for (const row of rows) {
      const randomBadge = badges[Math.floor(Math.random() * badges.length)];
      await pool.query('UPDATE parts SET badge = $1 WHERE id = $2', [randomBadge, row.id]);
    }
    
    console.log('Successfully updated badges randomly!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating badges:', error);
    process.exit(1);
  }
}

updateBadges();
