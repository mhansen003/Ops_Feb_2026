const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function analyzeImported() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('='.repeat(70));
  console.log('ANALYZING IMPORTED DATA');
  console.log('='.repeat(70));

  // Total by project
  const byProject = await sql`
    SELECT project, COUNT(*) as count
    FROM tickets
    GROUP BY project
    ORDER BY count DESC
  `;

  console.log('\n📊 TOTAL BY PROJECT:');
  byProject.forEach(p => {
    console.log(`   ${p.project}: ${p.count} tickets`);
  });

  // By status (our normalized status)
  const byStatus = await sql`
    SELECT status, COUNT(*) as count
    FROM tickets
    GROUP BY status
    ORDER BY count DESC
  `;

  console.log('\n📊 BY STATUS (normalized):');
  byStatus.forEach(s => {
    console.log(`   ${s.status}: ${s.count} tickets`);
  });

  // By original ADO state
  const byState = await sql`
    SELECT state, COUNT(*) as count
    FROM tickets
    GROUP BY state
    ORDER BY count DESC
    LIMIT 20
  `;

  console.log('\n📊 BY ADO STATE (original):');
  byState.forEach(s => {
    console.log(`   ${s.state}: ${s.count} tickets`);
  });

  // By work item type
  const byType = await sql`
    SELECT work_item_type, COUNT(*) as count
    FROM tickets
    GROUP BY work_item_type
    ORDER BY count DESC
  `;

  console.log('\n📊 BY WORK ITEM TYPE:');
  byType.forEach(t => {
    console.log(`   ${t.work_item_type}: ${t.count} tickets`);
  });

  // Completed/Done items
  const completed = await sql`
    SELECT
      state,
      COUNT(*) as count
    FROM tickets
    WHERE
      state ILIKE '%done%' OR
      state ILIKE '%closed%' OR
      state ILIKE '%completed%' OR
      state ILIKE '%removed%'
    GROUP BY state
    ORDER BY count DESC
  `;

  console.log('\n⚠️ POTENTIALLY COMPLETED ITEMS:');
  if (completed.length > 0) {
    let totalCompleted = 0;
    completed.forEach(c => {
      console.log(`   ${c.state}: ${c.count} tickets`);
      totalCompleted += parseInt(c.count);
    });
    console.log(`   --- TOTAL COMPLETED: ${totalCompleted} ---`);
  } else {
    console.log('   None found');
  }

  // Active/Open items
  const active = await sql`
    SELECT COUNT(*) as count
    FROM tickets
    WHERE
      state NOT ILIKE '%done%' AND
      state NOT ILIKE '%closed%' AND
      state NOT ILIKE '%completed%' AND
      state NOT ILIKE '%removed%'
  `;

  console.log(`\n✅ TRULY ACTIVE ITEMS (excluding completed states): ${active[0].count}`);

  // Sample of completed items
  const sampleCompleted = await sql`
    SELECT id, title, state, project, created_date
    FROM tickets
    WHERE state ILIKE '%done%'
    ORDER BY created_date DESC
    LIMIT 5
  `;

  console.log('\n📝 SAMPLE OF "DONE" ITEMS:');
  sampleCompleted.forEach(t => {
    const date = new Date(t.created_date).toLocaleDateString();
    console.log(`   ${t.id}: ${t.title.substring(0, 50)}... [${t.project}] - Created: ${date}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('RECOMMENDATION:');
  console.log('If the queries are supposed to show only active work,');
  console.log('we should filter out Done/Closed/Completed items.');
  console.log('='.repeat(70));
}

analyzeImported().catch(console.error);
