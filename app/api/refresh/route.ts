import { NextResponse } from 'next/server';
import { fetchAllADOTickets } from '@/lib/ado';
import { clearTickets, insertTickets, initializeDatabase } from '@/lib/db';

export const maxDuration = 60; // Allow up to 60 seconds for this operation

export async function POST() {
  try {
    console.log('Starting data refresh...');

    // Ensure database is initialized
    await initializeDatabase();

    // Fetch data from ADO
    console.log('Fetching ADO data...');
    const { tickets, stats } = await fetchAllADOTickets();

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
