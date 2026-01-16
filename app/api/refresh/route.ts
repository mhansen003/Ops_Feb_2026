import { NextResponse } from 'next/server';
import { fetchAllADOTickets } from '@/lib/ado';
import { clearTickets, insertTickets, initializeDatabase } from '@/lib/db';

export const maxDuration = 60; // Allow up to 60 seconds for this operation

interface ProjectSelection {
  byteLos: boolean;
  byte: boolean;
  productMasters: boolean;
}

export async function POST(request: Request) {
  try {
    console.log('Starting data refresh...');

    // Parse request body
    const body = await request.json();
    const selection: ProjectSelection = body.selection || {
      byteLos: true,
      byte: true,
      productMasters: true
    };

    console.log('Project selection:', selection);

    // Ensure database is initialized
    await initializeDatabase();

    // Fetch data from ADO with selection
    console.log('Fetching ADO data...');
    const { tickets, stats } = await fetchAllADOTickets(selection);

    console.log(`Fetched ${tickets.length} tickets from ADO`);

    // Clear existing data
    console.log('Clearing existing tickets...');
    await clearTickets();

    // Insert new data
    console.log('Inserting new tickets...');
    await insertTickets(tickets);

    console.log('Data refresh completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Data refreshed successfully',
      stats: {
        ticketsImported: tickets.length,
        ...stats
      }
    });
  } catch (error: any) {
    console.error('Data refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.response?.data || null
      },
      { status: 500 }
    );
  }
}
