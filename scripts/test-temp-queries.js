const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
const ADO_PAT = process.env.ADO_PAT;

// The temporary query IDs from the user's URLs
const tempQueries = [
  {
    project: 'Byte LOS',
    tempQueryId: '4d29bc56-ad8d-43fb-9de8-f5032de8149c',
    url: 'https://cmgfidev.visualstudio.com/Byte%20LOS/_queries/query/?tempQueryId=4d29bc56-ad8d-43fb-9de8-f5032de8149c'
  },
  {
    project: 'BYTE',
    tempQueryId: 'ba574226-2715-4616-a2f6-33e01fcdb319',
    url: 'https://cmgfidev.visualstudio.com/BYTE/_queries/query/?tempQueryId=ba574226-2715-4616-a2f6-33e01fcdb319'
  },
  {
    project: 'Product Masters',
    tempQueryId: '9cf4112e-b407-450f-915f-74182da51ce1',
    url: 'https://cmgfidev.visualstudio.com/Product%20Masters/_queries/query/?tempQueryId=9cf4112e-b407-450f-915f-74182da51ce1'
  }
];

async function testTempQuery(project, tempQueryId, url) {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  console.log(`\n${'='.repeat(70)}`);
  console.log(`PROJECT: ${project}`);
  console.log(`Temp Query ID: ${tempQueryId}`);
  console.log(`URL: ${url}`);
  console.log('='.repeat(70));

  try {
    // Try to execute the temp query
    const queryUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/wiql/${tempQueryId}?api-version=7.0`;

    console.log(`\nAttempting to fetch temp query...`);
    console.log(queryUrl);

    const response = await axios.get(queryUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const workItems = response.data.workItems || [];
    console.log(`✅ SUCCESS! Found ${workItems.length} work items`);

    if (workItems.length > 0) {
      console.log(`First 5 IDs: ${workItems.slice(0, 5).map(w => w.id).join(', ')}`);
    }

    return workItems.length;

  } catch (error) {
    console.error(`❌ FAILED:`, error.response?.status, error.response?.statusText);
    console.error(`Error:`, error.response?.data?.message || error.message);

    if (error.response?.status === 404) {
      console.log('\n⚠️ Temporary queries expire after a period of inactivity.');
      console.log('You need to save these queries in ADO to make them permanent:');
      console.log('1. Open the query URL in your browser');
      console.log('2. Click "Save query" or "Save As"');
      console.log('3. Give it a name');
      console.log('4. Copy the new permanent query ID from the URL');
    }

    return 0;
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('TESTING TEMPORARY QUERY IDs FROM USER');
  console.log('='.repeat(70));

  let totalCount = 0;
  const counts = [];

  for (const query of tempQueries) {
    const count = await testTempQuery(query.project, query.tempQueryId, query.url);
    totalCount += count;
    counts.push({ project: query.project, count });
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('SUMMARY');
  console.log('='.repeat(70));
  counts.forEach(c => {
    console.log(`${c.project}: ${c.count} tickets`);
  });
  console.log(`TOTAL: ${totalCount} tickets`);
  console.log('='.repeat(70));
}

main().catch(console.error);
