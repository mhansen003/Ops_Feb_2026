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
  includeCompleted?: boolean;
}

const allQueries: ADOQuery[] = [
  {
    key: 'byteLos',
    project: process.env.ADO_PROJECT_1 || 'Byte LOS',
    queryId: '' // Not used with direct WIQL
  },
  {
    key: 'byte',
    project: process.env.ADO_PROJECT_2 || 'BYTE',
    queryId: '' // Not used with direct WIQL
  },
  {
    key: 'productMasters',
    project: process.env.ADO_PROJECT_3 || 'Product Masters',
    queryId: '' // Not used with direct WIQL
  }
];

async function fetchQueryResults(project: string, queryId: string) {
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  try {
    // Use direct WIQL query instead of saved query ID
    const wiqlQuery = {
      query: "SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '" + project + "' ORDER BY [System.Id] DESC"
    };

    const queryUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/wiql?api-version=7.0`;

    console.log(`[ADO] Fetching from project: "${project}"`);
    console.log(`[ADO] Query URL: ${queryUrl}`);
    console.log(`[ADO] WIQL Query: ${wiqlQuery.query}`);
    console.log(`[ADO] Organization: ${ADO_ORGANIZATION}`);
    console.log(`[ADO] PAT length: ${ADO_PAT?.length || 0}`);

    const queryResponse = await axios.post(queryUrl, wiqlQuery, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[ADO] Response status: ${queryResponse.status}`);
    console.log(`[ADO] Response data keys:`, Object.keys(queryResponse.data));
    console.log(`[ADO] Work items array length:`, queryResponse.data.workItems?.length || 0);
    console.log(`[ADO] Full response:`, JSON.stringify(queryResponse.data).substring(0, 1000));

    const workItemRefs = queryResponse.data.workItems || [];

    if (workItemRefs.length === 0) {
      console.log(`⚠️ No work items found for query ${queryId} in project ${project}`);
      console.log(`Response keys:`, Object.keys(queryResponse.data));
      console.log(`Full response:`, JSON.stringify(queryResponse.data));
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

function mapCategory(workItemType: string, title: string, tags: string[]): string {
  const typeLower = workItemType.toLowerCase();
  const titleLower = title.toLowerCase();
  const tagsLower = tags.map(t => t.toLowerCase()).join(' ');
  const combined = `${typeLower} ${titleLower} ${tagsLower}`;

  // Check for security-related items
  if (combined.includes('security') || combined.includes('permission') ||
      combined.includes('access') || combined.includes('auth') ||
      typeLower.includes('security')) {
    return 'Security';
  }

  // Check for bugs
  if (combined.includes('bug') || combined.includes('fix') ||
      combined.includes('defect') || combined.includes('issue')) {
    return 'Bug Fix';
  }

  // Check for performance items
  if (combined.includes('performance') || combined.includes('optimization') ||
      combined.includes('speed') || combined.includes('slow')) {
    return 'Performance';
  }

  // Check for documentation
  if (combined.includes('documentation') || combined.includes('readme') ||
      combined.includes('docs') || combined.includes('guide')) {
    return 'Documentation';
  }

  // Feature-related work
  if (typeLower.includes('feature') || typeLower.includes('user story') ||
      typeLower.includes('epic') || titleLower.includes('new feature')) {
    return 'Feature';
  }

  // Infrastructure/Tasks
  if (typeLower.includes('task') || typeLower.includes('request')) {
    return 'Infrastructure';
  }

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
  let tickets = Array.from(uniqueWorkItems.values())
    .filter(item => item.id) // Filter out items without valid IDs
    .map(item => {
      const fields = item.fields;
      const tags = fields['System.Tags']?.split(';').map((t: string) => t.trim()).filter(Boolean) || [];

      const title = fields['System.Title'] || 'Untitled';
      const workItemType = fields['System.WorkItemType'];

      return {
        id: `WI-${item.id}`,
        title: title,
        description: fields['System.Description'] || '',
        priority: mapPriority(fields['System.Priority']),
        status: mapStatus(fields['System.State']),
        category: mapCategory(workItemType, title, tags),
        assignee: fields['System.AssignedTo']?.displayName || 'Unassigned',
        created_date: fields['System.CreatedDate'],
        target_date: fields['Microsoft.VSTS.Scheduling.TargetDate'] || fields['System.CreatedDate'],
        estimated_effort: parseEstimatedEffort(fields['Microsoft.VSTS.Scheduling.StoryPoints']),
        dependencies: null,
        tags: tags,
        project: fields['System.TeamProject'] || 'Unknown',
        work_item_type: workItemType,
        state: fields['System.State']
      };
    });

  // Filter out completed items unless explicitly requested
  if (!effectiveSelection.includeCompleted) {
    const excludedStates = ['done', 'closed', 'completed', 'cancelled', 'removed', 'retired'];
    const beforeCount = tickets.length;

    tickets = tickets.filter(ticket => {
      const stateLower = ticket.state.toLowerCase();
      return !excludedStates.some(excluded => stateLower.includes(excluded));
    });

    const filteredCount = beforeCount - tickets.length;
    console.log(`Filtered out ${filteredCount} completed/cancelled items (${tickets.length} active items remaining)`);
  }

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
