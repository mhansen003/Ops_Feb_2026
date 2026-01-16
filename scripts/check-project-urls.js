const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
const ADO_PAT = process.env.ADO_PAT;

async function checkUrls() {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  // Get one work item from each project
  const testItems = [
    { project: 'Byte LOS', id: 17017 },
    { project: 'BYTE', id: 76441 },
    { project: 'Product Masters', id: 91216 }
  ];

  for (const test of testItems) {
    const url = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(test.project)}/_apis/wit/workitems/${test.id}?api-version=7.0`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`\n${test.project}:`);
    console.log(`  URL: ${response.data.url}`);
    console.log(`  Contains 'Byte%20LOS': ${response.data.url.includes('Byte%20LOS')}`);
    console.log(`  Contains 'BYTE/': ${response.data.url.includes('BYTE/')}`);
    console.log(`  Contains 'Product%20Masters': ${response.data.url.includes('Product%20Masters')}`);
    console.log(`  TeamProject field: ${response.data.fields['System.TeamProject']}`);
  }
}

checkUrls().catch(console.error);
