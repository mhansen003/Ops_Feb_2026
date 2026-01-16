const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkDuplicates() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('='.repeat(70));
  console.log('CHECKING FOR DUPLICATE TICKETS');
  console.log('='.repeat(70));

  // Check for duplicate IDs
  const duplicateIds = await sql`
    SELECT id, COUNT(*) as count
    FROM tickets
    GROUP BY id
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `;

  console.log(`\n📊 Duplicate IDs: ${duplicateIds.length}`);
  if (duplicateIds.length > 0) {
    console.log('\n⚠️ Found duplicate ticket IDs:');
    duplicateIds.forEach(dup => {
      console.log(`   ${dup.id}: ${dup.count} occurrences`);
    });
  } else {
    console.log('✅ No duplicate IDs found!');
  }

  // Check for duplicate titles (potential duplicates)
  const duplicateTitles = await sql`
    SELECT title, COUNT(*) as count, array_agg(id) as ticket_ids
    FROM tickets
    GROUP BY title
    HAVING COUNT(*) > 1
    ORDER BY count DESC
    LIMIT 20
  `;

  console.log(`\n📊 Duplicate Titles: ${duplicateTitles.length}`);
  if (duplicateTitles.length > 0) {
    console.log('\n⚠️  Found tickets with duplicate titles (may be legitimate):');
    duplicateTitles.slice(0, 10).forEach(dup => {
      console.log(`   "${dup.title.substring(0, 60)}..." (${dup.count} occurrences)`);
      console.log(`      IDs: ${dup.ticket_ids.join(', ')}`);
    });
  } else {
    console.log('✅ No duplicate titles found!');
  }

  // Check total unique tickets
  const totalCount = await sql`SELECT COUNT(*) as count FROM tickets`;
  const uniqueCount = await sql`SELECT COUNT(DISTINCT id) as count FROM tickets`;

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total tickets: ${totalCount[0].count}`);
  console.log(`   Unique IDs: ${uniqueCount[0].count}`);
  console.log(`   Duplicates: ${totalCount[0].count - uniqueCount[0].count}`);

  // If there are duplicates, offer to remove them
  if (duplicateIds.length > 0) {
    console.log(`\n💡 RECOMMENDATION:`);
    console.log(`   Found ${duplicateIds.length} duplicate IDs.`);
    console.log(`   The deduplication logic in lib/ado.ts should prevent this.`);
    console.log(`   Run a fresh import to resolve duplicates.`);
  }

  console.log('\n' + '='.repeat(70));
}

checkDuplicates().catch(console.error);
