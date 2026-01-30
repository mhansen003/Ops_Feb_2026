export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'New' | 'In Progress' | 'Blocked' | 'Ready for Review' | 'Completed';
export type Category = 'Infrastructure' | 'Security' | 'Performance' | 'Feature' | 'Bug Fix' | 'Documentation';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  priorityLevel?: string; // Original level (2-High, 3-Medium, etc.)
  stackRank?: number; // Overall stack rank 1-57
  status: Status;
  category: Category;
  assignee: string;
  createdDate: string;
  tags: string[];
  workItemType?: string;
  state?: string;
  requestor?: string;
  explanation?: string; // Lauren/Kelly's notes (Column H)
}

export interface TicketStats {
  total: number;
  byPriority: {
    High: number;
    Medium: number;
    Low: number;
  };
  byStatus: {
    New: number;
    'In Progress': number;
    Blocked: number;
    'Ready for Review': number;
    Completed: number;
  };
  byAssignee: Record<string, number>;
}

export async function fetchTickets(): Promise<{ tickets: Ticket[]; stats: TicketStats }> {
  const response = await fetch('/api/tickets', {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }

  const data = await response.json();

  // Transform tickets to client format
  const tickets: Ticket[] = data.tickets.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    priority: t.priority as Priority,
    priorityLevel: t.priority_level,
    stackRank: t.stack_rank,
    status: t.status as Status,
    category: t.category as Category,
    assignee: t.assignee || 'Unassigned',
    createdDate: t.created_date,
    tags: t.tags || [],
    workItemType: t.work_item_type,
    state: t.state,
    requestor: t.requestor,
    explanation: t.explanation,
  }));

  // Use stats from API (already calculated server-side)
  const stats: TicketStats = {
    total: data.stats.total,
    byPriority: data.stats.byPriority,
    byStatus: data.stats.byStatus,
    byAssignee: data.stats.byAssignee,
  };

  return { tickets, stats };
}

