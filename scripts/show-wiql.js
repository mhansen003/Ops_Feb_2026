const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
const ADO_PAT = process.env.ADO_PAT;

async function showWIQL(project, queryId, name) {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  console.log(`\n${'='.repeat(70)}`);
  console.log(`${project} - ${name}`);
  console.log('='.repeat(70));

  try {
    const queryDefUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/queries/${queryId}?$expand=all&api-version=7.0`;

    const response = await axios.get(queryDefUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\nFull response keys:', Object.keys(response.data));
    console.log('\nFull data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function main() {
  await showWIQL('Byte LOS', '94e0457e-f611-4750-9515-0da963fd5feb', 'Byte Active Work Items');
  await showWIQL('BYTE', 'b9dd35a8-581a-46e9-b961-b1de1446fa39', 'BYTE Dev backlog 1.13.26');
  await showWIQL('Product Masters', '06c11dac-3527-4f60-b6ed-3eee4243ba1f', 'Operations Backlog All 1.14.26');
}

main().catch(console.error);
