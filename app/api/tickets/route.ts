import { NextResponse } from 'next/server';
import { getAllTickets, getTicketStats, initializeDatabase, getLastImport } from '@/lib/db';

export async function GET() {
  try {
    // Ensure database is initialized
    await initializeDatabase();

    const [tickets, stats, lastImport] = await Promise.all([
      getAllTickets(),
      getTicketStats(),
      getLastImport()
    ]);

    return NextResponse.json({
      success: true,
      tickets,
      stats,
      lastImport
    });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stack
      },
      { status: 500 }
    );
  }
}
