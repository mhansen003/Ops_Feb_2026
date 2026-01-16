const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
const ADO_PAT = process.env.ADO_PAT;

const queries = [
  {
    key: 'byteLos',
    project: 'Byte LOS',
    queryId: '94e0457e-f611-4750-9515-0da963fd5feb',
    name: 'Byte Active Work Items'
  },
  {
    key: 'byte',
    project: 'BYTE',
    queryId: 'b9dd35a8-581a-46e9-b961-b1de1446fa39',
    name: 'BYTE Dev backlog 1.13.26'
  },
  {
    key: 'productMasters',
    project: 'Product Masters',
    queryId: '06c11dac-3527-4f60-b6ed-3eee4243ba1f',
    name: 'Operations Backlog All 1.14.26'
  }
];

async function inspectQuery(project, queryId, name) {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  console.log(`\n${'='.repeat(70)}`);
  console.log(`PROJECT: ${project}`);
  console.log(`QUERY: ${name}`);
  console.log(`ID: ${queryId}`);
  console.log('='.repeat(70));

  try {
    // Get the query definition first
    const queryDefUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/queries/${queryId}?api-version=7.0`;

    const defResponse = await axios.get(queryDefUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`\n📋 Query Definition:`);
    console.log(`   Name: ${defResponse.data.name}`);
    console.log(`   Query Type: ${defResponse.data.queryType}`);
    console.log(`   Is Public: ${defResponse.data.isPublic}`);
    console.log(`   Path: ${defResponse.data.path}`);
    console.log(`   Created: ${new Date(defResponse.data.createdDate).toLocaleDateString()}`);
    console.log(`   Last Modified: ${new Date(defResponse.data.lastModifiedDate).toLocaleDateString()}`);

    if (defResponse.data.wiql) {
      console.log(`\n📝 WIQL Query:`);
      console.log(defResponse.data.wiql);
    }

    // Execute the query to get results
    const queryUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/wiql/${queryId}?api-version=7.0`;

    const queryResponse = await axios.get(queryUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const workItemRefs = queryResponse.data.workItems || [];
    console.log(`\n✅ Query Results: ${workItemRefs.length} work items`);

    // Show first 5 work item IDs
    if (workItemRefs.length > 0) {
      console.log(`   First 5 IDs: ${workItemRefs.slice(0, 5).map(w => w.id).join(', ')}`);
      console.log(`   Last 5 IDs: ${workItemRefs.slice(-5).map(w => w.id).join(', ')}`);
    }

    // Get details for first work item to see what states/types we're getting
    if (workItemRefs.length > 0) {
      const firstId = workItemRefs[0].id;
      const detailsUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/workitems/${firstId}?api-version=7.0`;

      const detailsResponse = await axios.get(detailsUrl, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`\n🔍 Sample Work Item (${firstId}):`);
      console.log(`   Title: ${detailsResponse.data.fields['System.Title']}`);
      console.log(`   Type: ${detailsResponse.data.fields['System.WorkItemType']}`);
      console.log(`   State: ${detailsResponse.data.fields['System.State']}`);
      console.log(`   Created: ${new Date(detailsResponse.data.fields['System.CreatedDate']).toLocaleDateString()}`);
      if (detailsResponse.data.fields['System.AssignedTo']) {
        console.log(`   Assigned To: ${detailsResponse.data.fields['System.AssignedTo'].displayName}`);
      }
    }

  } catch (error) {
    console.error(`❌ Error:`, error.response?.data?.message || error.message);
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('INSPECTING ADO QUERY DEFINITIONS AND RESULTS');
  console.log('='.repeat(70));

  for (const query of queries) {
    await inspectQuery(query.project, query.queryId, query.name);
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log('If the queries are returning more items than expected, check:');
  console.log('1. The WIQL query filters (State, Type, Date ranges)');
  console.log('2. Whether the query includes completed/closed items');
  console.log('3. Whether the query has been modified since creation');
  console.log('='.repeat(70));
}

main().catch(console.error);
