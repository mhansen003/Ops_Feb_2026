import { NextResponse } from 'next/server';
import { getAllTickets, getTicketStats, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    // Ensure database is initialized
    await initializeDatabase();

    const [tickets, stats] = await Promise.all([
      getAllTickets(),
      getTicketStats()
    ]);

    return NextResponse.json({
      success: true,
      tickets,
      stats
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
