import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {}
  };

  // Check 1: Environment variables
  diagnostics.checks.envVars = {
    ADO_ORGANIZATION: process.env.ADO_ORGANIZATION ? '✅ Set' : '❌ Missing',
    ADO_PAT: process.env.ADO_PAT ? `✅ Set (${process.env.ADO_PAT?.length} chars)` : '❌ Missing',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'
  };

  // Check 2: Try to reach ADO API with a simple test
  if (process.env.ADO_PAT && process.env.ADO_ORGANIZATION) {
    try {
      const ADO_ORGANIZATION = process.env.ADO_ORGANIZATION;
      const ADO_PAT = process.env.ADO_PAT;
      const auth = Buffer.from(`:${ADO_PAT}`).toString('base64');

      // Test with the Byte LOS query
      const testProject = 'Byte LOS';
      const testQueryId = '94e0457e-f611-4750-9515-0da963fd5feb';
      const queryUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(testProject)}/_apis/wit/wiql/${testQueryId}?api-version=7.0`;

      console.log(`[DIAGNOSTIC] Testing ADO connection...`);
      console.log(`[DIAGNOSTIC] URL: ${queryUrl}`);
      console.log(`[DIAGNOSTIC] Auth header length: ${auth.length}`);

      const response = await axios.get(queryUrl, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      diagnostics.checks.adoConnection = {
        status: '✅ Success',
        statusCode: response.status,
        workItemCount: response.data.workItems?.length || 0,
        responseKeys: Object.keys(response.data),
        hasWorkItems: !!response.data.workItems,
        hasColumns: !!response.data.columns,
        queryType: response.data.queryType,
        asOf: response.data.asOf,
        // Include first 500 chars of response for debugging
        responsePreview: JSON.stringify(response.data).substring(0, 500)
      };

      // If we got work items, try to fetch details for the first one
      if (response.data.workItems && response.data.workItems.length > 0) {
        const firstWorkItemId = response.data.workItems[0].id;
        const detailsUrl = `https://dev.azure.com/${ADO_ORGANIZATION}/${encodeURIComponent(testProject)}/_apis/wit/workitems/${firstWorkItemId}?api-version=7.0`;

        try {
          const detailsResponse = await axios.get(detailsUrl, {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          });

          diagnostics.checks.workItemDetails = {
            status: '✅ Can fetch work item details',
            workItemId: firstWorkItemId,
            title: detailsResponse.data.fields?.['System.Title']
          };
        } catch (detailsError: any) {
          diagnostics.checks.workItemDetails = {
            status: '❌ Failed to fetch work item details',
            error: detailsError.message,
            statusCode: detailsError.response?.status
          };
        }
      }

    } catch (error: any) {
      diagnostics.checks.adoConnection = {
        status: '❌ Failed',
        error: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        code: error.code
      };
    }
  } else {
    diagnostics.checks.adoConnection = {
      status: '⚠️ Skipped (missing credentials)'
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
