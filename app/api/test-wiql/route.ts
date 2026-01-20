import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION || 'cmgfidev';
  const ADO_PAT = process.env.ADO_PAT!;
  const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

  try {
    const project = 'Byte LOS';
    const wiqlQuery = {
      query: "SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State] FROM WorkItems WHERE [System.TeamProject] = '" + project + "' ORDER BY [System.Id] DESC"
    };

    const queryUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(project)}/_apis/wit/wiql?api-version=7.0`;

    console.log(`[TEST] Fetching from project: "${project}"`);
    console.log(`[TEST] Query URL: ${queryUrl}`);
    console.log(`[TEST] WIQL: ${wiqlQuery.query}`);

    const queryResponse = await axios.post(queryUrl, wiqlQuery, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json({
      success: true,
      project,
      url: queryUrl,
      wiql: wiqlQuery.query,
      statusCode: queryResponse.status,
      responseData: queryResponse.data,
      workItemCount: queryResponse.data.workItems?.length || 0,
      responseKeys: Object.keys(queryResponse.data),
      hasWorkItems: !!queryResponse.data.workItems
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      response: error.response?.data,
      statusCode: error.response?.status
    }, { status: 500 });
  }
}
