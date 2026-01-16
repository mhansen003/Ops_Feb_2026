const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
const ADO_PAT = process.env.ADO_PAT;

async function debugWorkItem() {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  // Fetch just one work item from Byte LOS
  const project = 'Byte LOS';
  const queryId = '94e0457e-f611-4750-9515-0da963fd5feb';

  console.log('='.repeat(60));
  console.log('DEBUGGING WORK ITEM STRUCTURE');
  console.log('='.repeat(60));

  try {
    // Get the query results
    const queryUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/wiql/${queryId}?api-version=7.0`;

    const queryResponse = await axios.get(queryUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const firstWorkItemId = queryResponse.data.workItems[0].id;
    console.log(`\nFirst work item ID from query: ${firstWorkItemId}`);

    // Get work item details
    const detailsUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/workitems/${firstWorkItemId}?api-version=7.0`;

    const detailsResponse = await axios.get(detailsUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const workItem = detailsResponse.data;

    console.log(`\n📋 Work Item Structure:`);
    console.log(`ID: ${workItem.id}`);
    console.log(`Rev: ${workItem.rev}`);
    console.log(`URL: ${workItem.url}`);
    console.log(`\nTop-level keys:`, Object.keys(workItem));

    console.log(`\n📝 Fields object exists: ${!!workItem.fields}`);
    if (workItem.fields) {
      console.log(`Field keys (first 20):`, Object.keys(workItem.fields).slice(0, 20));
      console.log(`\nSystem.Id: ${workItem.fields['System.Id']}`);
      console.log(`System.Title: ${workItem.fields['System.Title']}`);
      console.log(`System.WorkItemType: ${workItem.fields['System.WorkItemType']}`);
      console.log(`System.State: ${workItem.fields['System.State']}`);
    }

    console.log(`\n🔍 Full work item structure (first 1000 chars):`);
    console.log(JSON.stringify(workItem, null, 2).substring(0, 1000));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
}

debugWorkItem().catch(console.error);
