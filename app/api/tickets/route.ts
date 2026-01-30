import { NextResponse } from 'next/server';
import { backlogTickets } from '@/lib/backlog-data';

export async function GET() {
  try {
    // Calculate statistics from static data
    const stats = {
      total: backlogTickets.length,
      byPriority: {
        High: backlogTickets.filter(t => t.priority === 'High').length,
        Medium: backlogTickets.filter(t => t.priority === 'Medium').length,
        Low: backlogTickets.filter(t => t.priority === 'Low').length,
      },
      byStatus: {
        New: backlogTickets.filter(t => t.status === 'New').length,
        'In Progress': backlogTickets.filter(t => t.status === 'In Progress').length,
        Blocked: backlogTickets.filter(t => t.status === 'Blocked').length,
        'Ready for Review': backlogTickets.filter(t => t.status === 'Ready for Review').length,
        Completed: backlogTickets.filter(t => t.status === 'Completed').length,
      },
      byAssignee: backlogTickets.reduce((acc, ticket) => {
        const assignee = ticket.assignee || 'Unassigned';
        acc[assignee] = (acc[assignee] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Transform to match expected format
    const tickets = backlogTickets.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      priority_level: t.priorityLevel,
      stack_rank: t.stackRank,
      status: t.status,
      category: t.category,
      assignee: t.assignee,
      created_date: t.createdDate,
      target_date: t.createdDate,
      estimated_effort: '',
      tags: t.tags,
      work_item_type: t.workItemType,
      state: t.state,
      requestor: t.requestor,
      explanation: t.explanation,
    }));

    return NextResponse.json({
      success: true,
      tickets,
      stats,
      lastImport: null
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
