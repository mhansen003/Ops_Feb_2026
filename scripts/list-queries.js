const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
const ADO_PAT = process.env.ADO_PAT;

if (!ADO_PAT) {
  console.error('ERROR: ADO_PAT environment variable not set!');
  console.error('Make sure .env.local contains: ADO_PAT=your-token');
  process.exit(1);
}

const projects = ['Byte LOS', 'BYTE', 'Product Masters'];

async function listQueries(project) {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PROJECT: ${project}`);
  console.log('='.repeat(60));

  try {
    // List all queries in the project
    const url = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/queries?$depth=2&api-version=7.0`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const allQueries = [];

    function extractQueries(items, path = '') {
      for (const item of items) {
        if (item.isFolder && item.hasChildren && item.children) {
          extractQueries(item.children, `${path}${item.name}/`);
        } else if (!item.isFolder) {
          allQueries.push({
            id: item.id,
            name: item.name,
            path: `${path}${item.name}`,
            isPublic: item.isPublic
          });
        }
      }
    }

    if (response.data.value) {
      extractQueries(response.data.value);
    }

    if (allQueries.length === 0) {
      console.log('❌ No saved queries found in this project');
    } else {
      console.log(`✅ Found ${allQueries.length} saved queries:\n`);
      allQueries.forEach((q, i) => {
        console.log(`${i + 1}. ${q.path}`);
        console.log(`   ID: ${q.id}`);
        console.log(`   Public: ${q.isPublic ? 'Yes' : 'No (Personal)'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.log(`❌ Error listing queries:`, error.response?.status, error.response?.statusText);
    console.log(`   Message:`, error.response?.data?.message || error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('LISTING ALL SAVED QUERIES IN ADO PROJECTS');
  console.log('='.repeat(60));

  for (const project of projects) {
    await listQueries(project);
  }

  console.log('\n' + '='.repeat(60));
  console.log('If no queries are listed above, you need to:');
  console.log('1. Open each query URL in ADO web interface');
  console.log('2. Click "Save query" or "Save As"');
  console.log('3. Give it a name (e.g., "Ops Backlog")');
  console.log('4. Copy the new query ID from the URL after saving');
  console.log('='.repeat(60));
}

main().catch(console.error);
