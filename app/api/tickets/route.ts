import { NextResponse } from 'next/server';
import { getAllTickets, getTicketStats } from '@/lib/db';

export async function GET() {
  try {
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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
