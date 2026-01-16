export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'New' | 'In Progress' | 'Blocked' | 'Ready for Review' | 'Completed';
export type Category = 'Infrastructure' | 'Security' | 'Performance' | 'Feature' | 'Bug Fix' | 'Documentation';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: Category;
  assignee: string;
  createdDate: string;
  targetDate: string;
  estimatedEffort: string;
  dependencies?: string[];
  tags: string[];
  project?: string;
}

export interface TicketStats {
  total: number;
  byPriority: {
    Critical: number;
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
  byCategory: {
    Infrastructure: number;
    Security: number;
    Performance: number;
    Feature: number;
    'Bug Fix': number;
    Documentation: number;
  };
}

export async function fetchTickets(): Promise<{ tickets: Ticket[]; stats: TicketStats }> {
  const response = await fetch('/api/tickets', {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }

  const data = await response.json();

  // Transform database tickets to client format
  const tickets: Ticket[] = data.tickets.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    priority: t.priority as Priority,
    status: t.status as Status,
    category: t.category as Category,
    assignee: t.assignee || 'Unassigned',
    createdDate: new Date(t.created_date).toISOString().split('T')[0],
    targetDate: new Date(t.target_date).toISOString().split('T')[0],
    estimatedEffort: t.estimated_effort || 'Not estimated',
    tags: t.tags || [],
    project: t.project
  }));

  // Calculate statistics
  const stats: TicketStats = {
    total: tickets.length,
    byPriority: {
      Critical: tickets.filter(t => t.priority === 'Critical').length,
      High: tickets.filter(t => t.priority === 'High').length,
      Medium: tickets.filter(t => t.priority === 'Medium').length,
      Low: tickets.filter(t => t.priority === 'Low').length,
    },
    byStatus: {
      New: tickets.filter(t => t.status === 'New').length,
      'In Progress': tickets.filter(t => t.status === 'In Progress').length,
      Blocked: tickets.filter(t => t.status === 'Blocked').length,
      'Ready for Review': tickets.filter(t => t.status === 'Ready for Review').length,
      Completed: tickets.filter(t => t.status === 'Completed').length,
    },
    byCategory: {
      Infrastructure: tickets.filter(t => t.category === 'Infrastructure').length,
      Security: tickets.filter(t => t.category === 'Security').length,
      Performance: tickets.filter(t => t.category === 'Performance').length,
      Feature: tickets.filter(t => t.category === 'Feature').length,
      'Bug Fix': tickets.filter(t => t.category === 'Bug Fix').length,
      Documentation: tickets.filter(t => t.category === 'Documentation').length,
    },
  };

  return { tickets, stats };
}

export interface ProjectSelection {
  byteLos: boolean;
  byte: boolean;
  productMasters: boolean;
}

export async function refreshData(selection: ProjectSelection): Promise<{ success: boolean; message: string; stats?: any }> {
  const response = await fetch('/api/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ selection }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to refresh data');
  }

  return data;
}
