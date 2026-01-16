const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkCategories() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('='.repeat(70));
  console.log('CHECKING CATEGORY DATA');
  console.log('='.repeat(70));

  // Check current categories
  const byCategory = await sql`
    SELECT category, COUNT(*) as count
    FROM tickets
    GROUP BY category
    ORDER BY count DESC
  `;

  console.log('\n📊 CURRENT CATEGORIES:');
  byCategory.forEach(c => {
    console.log(`   ${c.category}: ${c.count} tickets`);
  });

  // Check work item types
  const byType = await sql`
    SELECT work_item_type, COUNT(*) as count
    FROM tickets
    GROUP BY work_item_type
    ORDER BY count DESC
  `;

  console.log('\n📊 WORK ITEM TYPES:');
  byType.forEach(t => {
    console.log(`   ${t.work_item_type}: ${t.count} tickets`);
  });

  // Sample tickets with their categories
  const samples = await sql`
    SELECT work_item_type, category, COUNT(*) as count
    FROM tickets
    GROUP BY work_item_type, category
    ORDER BY count DESC
    LIMIT 10
  `;

  console.log('\n📝 WORK ITEM TYPE → CATEGORY MAPPING:');
  samples.forEach(s => {
    console.log(`   ${s.work_item_type} → ${s.category} (${s.count} tickets)`);
  });

  console.log('\n' + '='.repeat(70));
}

checkCategories().catch(console.error);
