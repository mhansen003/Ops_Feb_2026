import axios from 'axios';

const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
const ADO_PAT = process.env.ADO_PAT!;

interface ADOWorkItem {
  id: number;
  rev: number;
  fields: {
    'System.Id': number;
    'System.Title': string;
    'System.Description'?: string;
    'System.WorkItemType': string;
    'System.State': string;
    'System.AssignedTo'?: {
      displayName: string;
    };
    'System.CreatedDate': string;
    'Microsoft.VSTS.Scheduling.TargetDate'?: string;
    'Microsoft.VSTS.Scheduling.StoryPoints'?: number;
    'System.Tags'?: string;
    'System.Priority'?: number;
    [key: string]: any;
  };
  url: string;
}

export interface ADOQuery {
  project: string;
  queryId: string;
  key: 'byteLos' | 'byte' | 'productMasters';
}

export interface ProjectSelection {
  byteLos: boolean;
  byte: boolean;
  productMasters: boolean;
}

const allQueries: ADOQuery[] = [
  {
    key: 'byteLos',
    project: 'Byte LOS',
    queryId: '94e0457e-f611-4750-9515-0da963fd5feb' // Byte Active Work Items
  },
  {
    key: 'byte',
    project: 'BYTE',
    queryId: 'b9dd35a8-581a-46e9-b961-b1de1446fa39' // BYTE Dev backlog 1.13.26
  },
  {
    key: 'productMasters',
    project: 'Product Masters',
    queryId: '06c11dac-3527-4f60-b6ed-3eee4243ba1f' // Operations Backlog All 1.14.26
  }
];

async function fetchQueryResults(project: string, queryId: string) {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  try {
    // First, get the query results (work item IDs)
    const queryUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/wiql/${queryId}?api-version=7.0`;

    console.log(`Fetching query results from: ${queryUrl}`);

    const queryResponse = await axios.get(queryUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const workItemRefs = queryResponse.data.workItems || [];

    if (workItemRefs.length === 0) {
      console.log(`No work items found for query ${queryId} in project ${project}`);
      return [];
    }

    const workItemIds = workItemRefs.map((ref: any) => ref.id);
    console.log(`Found ${workItemIds.length} work items in ${project}`);

    // Fetch work item details in batches of 200 (ADO API limit)
    const batchSize = 200;
    const workItems: ADOWorkItem[] = [];

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
    }

    return workItems;
  } catch (error: any) {
    console.error(`Error fetching from ${project}:`, error.response?.data || error.message);
    throw error;
  }
}

function mapPriority(priority?: number): string {
  if (!priority) return 'Medium';
  if (priority === 1) return 'Critical';
  if (priority === 2) return 'High';
  if (priority === 3) return 'Medium';
  return 'Low';
}

function mapStatus(state: string): string {
  const stateLower = state.toLowerCase();
  if (stateLower.includes('new') || stateLower.includes('proposed')) return 'New';
  if (stateLower.includes('active') || stateLower.includes('in progress') || stateLower.includes('committed')) return 'In Progress';
  if (stateLower.includes('blocked') || stateLower.includes('impediment')) return 'Blocked';
  if (stateLower.includes('review') || stateLower.includes('resolved')) return 'Ready for Review';
  if (stateLower.includes('done') || stateLower.includes('closed') || stateLower.includes('completed')) return 'Completed';
  return state;
}

function mapCategory(workItemType: string): string {
  const typeLower = workItemType.toLowerCase();
  if (typeLower.includes('bug')) return 'Bug Fix';
  if (typeLower.includes('feature') || typeLower.includes('user story')) return 'Feature';
  if (typeLower.includes('task')) return 'Infrastructure';
  if (typeLower.includes('epic')) return 'Feature';
  return 'Infrastructure';
}

function parseEstimatedEffort(storyPoints?: number): string {
  if (!storyPoints) return 'Not estimated';
  if (storyPoints <= 2) return '1 week';
  if (storyPoints <= 5) return '2 weeks';
  if (storyPoints <= 8) return '3 weeks';
  return '4+ weeks';
}

export async function fetchAllADOTickets(selection?: ProjectSelection) {
  const allWorkItems: ADOWorkItem[] = [];
  const errors: string[] = [];

  // If no selection provided, select all
  const effectiveSelection = selection || {
    byteLos: true,
    byte: true,
    productMasters: true
  };

  // Filter queries based on selection
  const queries = allQueries.filter(q => effectiveSelection[q.key]);

  console.log(`Fetching from ${queries.length} selected projects:`, queries.map(q => q.project));

  for (const query of queries) {
    try {
      const workItems = await fetchQueryResults(query.project, query.queryId);
      allWorkItems.push(...workItems);
    } catch (error: any) {
      errors.push(`${query.project}: ${error.message}`);
    }
  }

  // Deduplicate by work item ID
  const uniqueWorkItems = new Map<number, ADOWorkItem>();
  for (const item of allWorkItems) {
    const existingItem = uniqueWorkItems.get(item.id);
    if (!existingItem || item.rev > existingItem.rev) {
      uniqueWorkItems.set(item.id, item);
    }
  }

  // Transform to our ticket format
  const tickets = Array.from(uniqueWorkItems.values()).map(item => {
    const fields = item.fields;
    const tags = fields['System.Tags']?.split(';').map((t: string) => t.trim()).filter(Boolean) || [];

    return {
      id: `WI-${fields['System.Id']}`,
      title: fields['System.Title'] || 'Untitled',
      description: fields['System.Description'] || '',
      priority: mapPriority(fields['System.Priority']),
      status: mapStatus(fields['System.State']),
      category: mapCategory(fields['System.WorkItemType']),
      assignee: fields['System.AssignedTo']?.displayName || 'Unassigned',
      created_date: fields['System.CreatedDate'],
      target_date: fields['Microsoft.VSTS.Scheduling.TargetDate'] || fields['System.CreatedDate'],
      estimated_effort: parseEstimatedEffort(fields['Microsoft.VSTS.Scheduling.StoryPoints']),
      dependencies: null,
      tags: tags,
      project: item.url.includes('Byte%20LOS') ? 'Byte LOS' :
               item.url.includes('BYTE/') ? 'BYTE' :
               item.url.includes('Product%20Masters') ? 'Product Masters' : 'Unknown',
      work_item_type: fields['System.WorkItemType'],
      state: fields['System.State']
    };
  });

  return {
    tickets,
    stats: {
      total: tickets.length,
      byProject: queries.map(q => q.project).reduce((acc, project) => {
        acc[project] = tickets.filter(t => t.project === project).length;
        return acc;
      }, {} as Record<string, number>),
      errors: errors.length > 0 ? errors : null
    }
  };
}
