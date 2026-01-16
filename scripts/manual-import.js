const { neon } = require('@neondatabase/serverless');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
const ADO_PAT = process.env.ADO_PAT;

const allQueries = [
  {
    key: 'byteLos',
    project: 'Byte LOS',
    queryId: '94e0457e-f611-4750-9515-0da963fd5feb'
  },
  {
    key: 'byte',
    project: 'BYTE',
    queryId: 'b9dd35a8-581a-46e9-b961-b1de1446fa39'
  },
  {
    key: 'productMasters',
    project: 'Product Masters',
    queryId: '06c11dac-3527-4f60-b6ed-3eee4243ba1f'
  }
];

function mapPriority(priority) {
  if (!priority) return 'Medium';
  if (priority === 1) return 'Critical';
  if (priority === 2) return 'High';
  if (priority === 3) return 'Medium';
  return 'Low';
}

function mapStatus(state) {
  const stateLower = state.toLowerCase();
  if (stateLower.includes('new') || stateLower.includes('proposed')) return 'New';
  if (stateLower.includes('active') || stateLower.includes('in progress') || stateLower.includes('committed')) return 'In Progress';
  if (stateLower.includes('blocked') || stateLower.includes('impediment')) return 'Blocked';
  if (stateLower.includes('review') || stateLower.includes('resolved')) return 'Ready for Review';
  if (stateLower.includes('done') || stateLower.includes('closed') || stateLower.includes('completed')) return 'Completed';
  return state;
}

function mapCategory(workItemType) {
  const typeLower = workItemType.toLowerCase();
  if (typeLower.includes('bug')) return 'Bug Fix';
  if (typeLower.includes('feature') || typeLower.includes('user story')) return 'Feature';
  if (typeLower.includes('task')) return 'Infrastructure';
  if (typeLower.includes('epic')) return 'Feature';
  return 'Infrastructure';
}

function parseEstimatedEffort(storyPoints) {
  if (!storyPoints) return 'Not estimated';
  if (storyPoints <= 2) return '1 week';
  if (storyPoints <= 5) return '2 weeks';
  if (storyPoints <= 8) return '3 weeks';
  return '4+ weeks';
}

async function fetchQueryResults(project, queryId) {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  try {
    const queryUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/wiql/${queryId}?api-version=7.0`;

    console.log(`Fetching from ${project}...`);

    const queryResponse = await axios.get(queryUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const workItemRefs = queryResponse.data.workItems || [];

    if (workItemRefs.length === 0) {
      console.log(`⚠️ No work items found for ${project}`);
      return [];
    }

    const workItemIds = workItemRefs.map(ref => ref.id);
    console.log(`  Found ${workItemIds.length} work items`);

    // Fetch work item details in batches
    const batchSize = 200;
    const workItems = [];

    for (let i = 0; i < workItemIds.length; i += batchSize) {
      const batch = workItemIds.slice(i, i + batchSize);
      const idsParam = batch.join(',');

      const detailsUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/workitems?ids=${idsParam}&api-version=7.0`;

      const detailsResponse = await axios.get(detailsUrl, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      workItems.push(...(detailsResponse.data.value || []));
      console.log(`  Fetched details for ${workItems.length}/${workItemIds.length} items`);
    }

    return workItems;
  } catch (error) {
    console.error(`❌ Error fetching from ${project}:`, error.message);
    return [];
  }
}

async function importData() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('='.repeat(60));
  console.log('MANUAL DATA IMPORT FROM ADO');
  console.log('='.repeat(60));

  // Fetch all work items
  const allWorkItems = [];
  for (const query of allQueries) {
    const items = await fetchQueryResults(query.project, query.queryId);
    allWorkItems.push(...items);
  }

  console.log(`\n✅ Total work items fetched: ${allWorkItems.length}`);

  // Deduplicate
  const uniqueWorkItems = new Map();
  for (const item of allWorkItems) {
    const existingItem = uniqueWorkItems.get(item.id);
    if (!existingItem || item.rev > existingItem.rev) {
      uniqueWorkItems.set(item.id, item);
    }
  }

  console.log(`📊 Unique work items after deduplication: ${uniqueWorkItems.size}`);

  // Transform to ticket format
  let tickets = Array.from(uniqueWorkItems.values())
    .filter(item => item.id) // Filter out items without valid IDs
    .map(item => {
      const fields = item.fields;
      const tags = fields['System.Tags']?.split(';').map(t => t.trim()).filter(Boolean) || [];

      return {
        id: `WI-${item.id}`,
        title: fields['System.Title'] || 'Untitled',
        description: fields['System.Description'] || '',
        priority: mapPriority(fields['System.Priority']),
        status: mapStatus(fields['System.State']),
        category: mapCategory(fields['System.WorkItemType']),
        assignee: fields['System.AssignedTo']?.displayName || 'Unassigned',
        created_date: fields['System.CreatedDate'],
        target_date: fields['Microsoft.VSTS.Scheduling.TargetDate'] || fields['System.CreatedDate'],
        estimated_effort: parseEstimatedEffort(fields['Microsoft.VSTS.Scheduling.StoryPoints']),
        tags: tags,
        project: fields['System.TeamProject'] || 'Unknown',
        work_item_type: fields['System.WorkItemType'],
        state: fields['System.State']
      };
    });

  // Filter out completed items by default (set to true to include them)
  const includeCompleted = false;

  if (!includeCompleted) {
    const excludedStates = ['done', 'closed', 'completed', 'cancelled', 'removed', 'retired'];
    const beforeCount = tickets.length;

    tickets = tickets.filter(ticket => {
      const stateLower = ticket.state.toLowerCase();
      return !excludedStates.some(excluded => stateLower.includes(excluded));
    });

    const filteredCount = beforeCount - tickets.length;
    console.log(`\n🔍 Filtered out ${filteredCount} completed/cancelled items`);
    console.log(`📊 Active items remaining: ${tickets.length}`);
  }

  console.log(`\n🗄️ Clearing existing tickets...`);
  await sql`DELETE FROM tickets`;

  console.log(`💾 Inserting ${tickets.length} tickets into database...`);

  for (const ticket of tickets) {
    await sql`
      INSERT INTO tickets (
        id, title, description, priority, status, category, assignee,
        created_date, target_date, estimated_effort, dependencies, tags,
        project, work_item_type, state
      ) VALUES (
        ${ticket.id}, ${ticket.title}, ${ticket.description}, ${ticket.priority},
        ${ticket.status}, ${ticket.category}, ${ticket.assignee},
        ${ticket.created_date}, ${ticket.target_date}, ${ticket.estimated_effort},
        ${ticket.dependencies}, ${ticket.tags}, ${ticket.project},
        ${ticket.work_item_type}, ${ticket.state}
      )
    `;
  }

  console.log(`📝 Logging import...`);
  await sql`
    INSERT INTO import_log (ticket_count, projects)
    VALUES (${tickets.length}, ${['Byte LOS', 'BYTE', 'Product Masters']})
  `;

  console.log(`\n✅ Import completed successfully!`);
  console.log(`   Total tickets imported: ${tickets.length}`);

  const byProject = {};
  tickets.forEach(t => {
    byProject[t.project] = (byProject[t.project] || 0) + 1;
  });

  console.log(`\n📊 Breakdown by project:`);
  Object.entries(byProject).forEach(([project, count]) => {
    console.log(`   ${project}: ${count} tickets`);
  });

  console.log('\n' + '='.repeat(60));
}

importData().catch(console.error);
