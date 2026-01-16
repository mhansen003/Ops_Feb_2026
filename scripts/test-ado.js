const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
const ADO_PAT = process.env.ADO_PAT;

if (!ADO_PAT) {
  console.error('ERROR: ADO_PAT environment variable not set!');
  console.error('Make sure .env.local contains: ADO_PAT=your-token');
  process.exit(1);
}

const queries = [
  {
    project: 'Byte LOS',
    queryId: '94e0457e-f611-4750-9515-0da963fd5feb',
    name: 'Byte Active Work Items'
  },
  {
    project: 'BYTE',
    queryId: 'b9dd35a8-581a-46e9-b961-b1de1446fa39',
    name: 'BYTE Dev backlog 1.13.26'
  },
  {
    project: 'Product Masters',
    queryId: '06c11dac-3527-4f60-b6ed-3eee4243ba1f',
    name: 'Operations Backlog All 1.14.26'
  }
];

async function testQuery(project, queryId, name) {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  console.log(`\n========================================`);
  console.log(`Testing: ${project}`);
  console.log(`Query: ${name}`);
  console.log(`Query ID: ${queryId}`);
  console.log(`========================================`);

  try {
    // Try the WIQL endpoint (for saved queries)
    const wiqlUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/wiql/${queryId}?api-version=7.0`;
    console.log(`\nAttempting WIQL endpoint:`);
    console.log(wiqlUrl);

    const response = await axios.get(wiqlUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ SUCCESS! Found ${response.data.workItems?.length || 0} work items`);
    if (response.data.workItems?.length > 0) {
      console.log(`First 3 work item IDs:`, response.data.workItems.slice(0, 3).map(w => w.id));
    }
    return true;
  } catch (error) {
    console.log(`❌ FAILED:`, error.response?.status, error.response?.statusText);
    console.log(`Error details:`, error.response?.data?.message || error.message);

    // Try alternative: Get the query definition first
    console.log(`\n⚠️ Trying to get query definition instead...`);
    try {
      const queryDefUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/queries/${queryId}?api-version=7.0`;
      console.log(queryDefUrl);

      const defResponse = await axios.get(queryDefUrl, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Query exists! Name: "${defResponse.data.name}"`);
      console.log(`Query Type: ${defResponse.data.queryType}`);
      console.log(`Is Public: ${defResponse.data.isPublic}`);
      console.log(`Path: ${defResponse.data.path}`);

      return false; // Query exists but WIQL failed
    } catch (defError) {
      console.log(`❌ Query definition also failed:`, defError.response?.status, defError.response?.statusText);
      return false;
    }
  }
}

async function testAllQueries() {
  console.log('===========================================');
  console.log('Testing ADO Query Access');
  console.log('===========================================');
  console.log(`Organization: ${ADO_ORGANIZATION}`);
  console.log(`PAT Length: ${ADO_PAT.length} characters`);

  let successCount = 0;

  for (const query of queries) {
    const success = await testQuery(query.project, query.queryId, query.name);
    if (success) successCount++;
  }

  console.log(`\n===========================================`);
  console.log(`SUMMARY: ${successCount}/${queries.length} queries accessible`);
  console.log(`===========================================`);
}

testAllQueries().catch(console.error);
