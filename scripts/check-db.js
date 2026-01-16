const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('='.repeat(60));
  console.log('CHECKING DATABASE CONTENTS');
  console.log('='.repeat(60));

  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('\n📋 Tables found:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Check tickets count
    const ticketCount = await sql`SELECT COUNT(*) as count FROM tickets`;
    console.log(`\n🎫 Tickets in database: ${ticketCount[0].count}`);

    if (ticketCount[0].count > 0) {
      // Show sample tickets
      const sampleTickets = await sql`
        SELECT id, title, project, status, created_date
        FROM tickets
        LIMIT 5
      `;

      console.log('\n📝 Sample tickets:');
      sampleTickets.forEach(t => {
        console.log(`  ${t.id}: ${t.title.substring(0, 50)}... [${t.project}]`);
      });

      // Show breakdown by project
      const byProject = await sql`
        SELECT project, COUNT(*) as count
        FROM tickets
        GROUP BY project
        ORDER BY count DESC
      `;

      console.log('\n📊 Tickets by project:');
      byProject.forEach(p => {
        console.log(`  ${p.project}: ${p.count} tickets`);
      });
    }

    // Check import log
    const importLog = await sql`
      SELECT * FROM import_log
      ORDER BY imported_at DESC
      LIMIT 3
    `;

    console.log(`\n📅 Recent imports: ${importLog.length}`);
    importLog.forEach(log => {
      console.log(`  ${new Date(log.imported_at).toLocaleString()}: ${log.ticket_count} tickets from [${log.projects.join(', ')}]`);
    });

  } catch (error) {
    console.error('\n❌ Error checking database:', error.message);
  }

  console.log('\n' + '='.repeat(60));
}

checkDatabase().catch(console.error);
