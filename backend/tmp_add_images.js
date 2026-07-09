const { connectDB, pool } = require('./config/db');
(async () => {
  try {
    await connectDB();
    await pool.query('ALTER TABLE parts ADD COLUMN IF NOT EXISTS images JSONB');
    console.log('✅ parts.images column ensured');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    try { await pool.end(); } catch {};
  }
})();
