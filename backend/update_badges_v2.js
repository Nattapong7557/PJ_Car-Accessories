const { pool } = require('./config/db');

async function updateBadges() {
  try {
    const { rows: products } = await pool.query('SELECT id, stock FROM parts');
    
    // 1. Reset all badges first to make sure we have a clean slate in memory
    const badgeAssignments = new Map();
    
    // We only want to consider items with stock > 0 for bestsellers (optional, but good practice).
    // Let's just sort by stock ascending
    let sortedByStock = [...products].sort((a, b) => a.stock - b.stock);
    
    // Pick top 12 items with lowest stock as "hot" (bestseller)
    const hotCount = Math.min(12, Math.floor(products.length * 0.15));
    const hotProducts = sortedByStock.slice(0, hotCount);
    
    hotProducts.forEach(p => badgeAssignments.set(p.id, 'hot'));
    
    // Filter out the ones already assigned 'hot'
    let remainingProducts = products.filter(p => !badgeAssignments.has(p.id));
    
    // 2. Pick 5-6 items randomly as 'new'
    const newCount = Math.floor(Math.random() * 2) + 5; // 5 or 6
    // Shuffle remaining products
    remainingProducts = remainingProducts.sort(() => 0.5 - Math.random());
    
    const newProducts = remainingProducts.slice(0, newCount);
    newProducts.forEach(p => badgeAssignments.set(p.id, 'new'));
    
    // Filter out the ones assigned 'new'
    remainingProducts = remainingProducts.filter(p => !badgeAssignments.has(p.id));
    
    // 3. For the rest, split ~40% 'sale' (promotion) and ~60% null (general)
    remainingProducts.forEach(p => {
      if (Math.random() < 0.4) {
        badgeAssignments.set(p.id, 'sale');
      } else {
        badgeAssignments.set(p.id, null);
      }
    });
    
    // 4. Update the database
    for (const p of products) {
      const badge = badgeAssignments.get(p.id);
      await pool.query('UPDATE parts SET badge = $1 WHERE id = $2', [badge, p.id]);
    }
    
    console.log('Successfully updated badges with advanced rules!');
    
    // Print stats
    const stats = { hot: 0, new: 0, sale: 0, null: 0 };
    for (const badge of badgeAssignments.values()) {
      stats[badge === null ? 'null' : badge]++;
    }
    console.log('Stats:', stats);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating badges:', error);
    process.exit(1);
  }
}

updateBadges();
