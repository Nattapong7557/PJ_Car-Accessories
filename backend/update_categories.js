// Script to analyze product image paths and update categories in the database
const { pool } = require('./config/db');

async function main() {
  try {
    // 1. Get all products with their image paths
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.image, p.category
      FROM parts p
      WHERE p.is_active = true
      ORDER BY p.id
    `);

    console.log(`\nTotal products: ${rows.length}\n`);

    // 2. Map image folder paths to category slugs matching the frontend checkboxes
    const folderToCategoryMap = {
      'car bumper': 'bumper',
      'car headlights': 'headlight',
      'car hood': 'hood',
      'car seat': 'seat',
      'front_grille': 'grille',
      'front grille': 'grille',
      'wheel': 'wheel',
      'spoiler': 'spoiler',
      'exhaust': 'exhaust-tip',
      'steering': 'steering',
      'front lip': 'front-lip',
      'front-lip': 'front-lip',
      'mirror cover': 'mirror-cover',
      'mirror-cover': 'mirror-cover',
      'bodykit': 'spoiler',
    };

    // 3. Determine category for each product based on image path
    const updates = [];
    const unmapped = [];

    for (const row of rows) {
      const imagePath = (row.image || '').toLowerCase().replace(/\\/g, '/');
      let matchedCategory = null;

      for (const [folder, category] of Object.entries(folderToCategoryMap)) {
        if (imagePath.includes(folder.toLowerCase())) {
          matchedCategory = category;
          break;
        }
      }

      if (matchedCategory) {
        updates.push({ id: row.id, name: row.name, oldCategory: row.category, newCategory: matchedCategory, image: row.image });
      } else {
        unmapped.push({ id: row.id, name: row.name, image: row.image, category: row.category });
      }
    }

    // 4. Show summary
    const categoryCounts = {};
    for (const u of updates) {
      categoryCounts[u.newCategory] = (categoryCounts[u.newCategory] || 0) + 1;
    }

    console.log('Category mapping summary:');
    console.log('========================');
    for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${cat}: ${count} products`);
    }

    if (unmapped.length > 0) {
      console.log(`\nUnmapped products (${unmapped.length}):`);
      for (const u of unmapped) {
        console.log(`  ID ${u.id}: ${u.image}`);
      }
    }

    // 5. Execute updates
    console.log('\nUpdating categories...');
    let updated = 0;
    for (const u of updates) {
      await pool.query('UPDATE parts SET category = $1, updated_at = NOW() WHERE id = $2', [u.newCategory, u.id]);
      updated++;
    }

    console.log(`✅ Updated ${updated} products successfully!`);

    // 6. Verify
    const { rows: verify } = await pool.query(`
      SELECT category, COUNT(*)::int as count
      FROM parts
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC
    `);
    console.log('\nFinal category distribution:');
    for (const r of verify) {
      console.log(`  ${r.category}: ${r.count}`);
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
