import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface DBTicket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  assignee: string;
  created_date: string;
  target_date: string;
  estimated_effort: string;
  dependencies: string | null;
  tags: string[];
  project: string;
  work_item_type: string;
  state: string;
  created_at: Date;
  updated_at: Date;
}

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT,
        status TEXT,
        category TEXT,
        assignee TEXT,
        created_date TIMESTAMP,
        target_date TIMESTAMP,
        estimated_effort TEXT,
        dependencies TEXT,
        tags TEXT[],
        project TEXT,
        work_item_type TEXT,
        state TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_tickets_created_date ON tickets(created_date)
    `;

    console.log('Database initialized successfully');
  } catch (error: any) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export async function clearTickets() {
  try {
    await sql`DELETE FROM tickets`;
    console.log('Tickets cleared successfully');
  } catch (error: any) {
    console.error('Error clearing tickets:', error);
    // If table doesn't exist, that's fine
    if (!error.message?.includes('does not exist')) {
      throw error;
    }
  }
}

export async function insertTickets(tickets: Omit<DBTicket, 'created_at' | 'updated_at'>[]) {
  if (tickets.length === 0) return;

  for (const ticket of tickets) {
    await sql`
      INSERT INTO tickets (
        id, title, description, priority, status, category, assignee,
        created_date, target_date, estimated_effort, dependencies, tags,
        project, work_item_type, state
      ) VALUES (
        ${ticket.id},
        ${ticket.title},
        ${ticket.description},
        ${ticket.priority},
        ${ticket.status},
        ${ticket.category},
        ${ticket.assignee},
        ${ticket.created_date},
        ${ticket.target_date},
        ${ticket.estimated_effort},
        ${ticket.dependencies},
        ${ticket.tags},
        ${ticket.project},
        ${ticket.work_item_type},
        ${ticket.state}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        category = EXCLUDED.category,
        assignee = EXCLUDED.assignee,
        created_date = EXCLUDED.created_date,
        target_date = EXCLUDED.target_date,
        estimated_effort = EXCLUDED.estimated_effort,
        dependencies = EXCLUDED.dependencies,
        tags = EXCLUDED.tags,
        project = EXCLUDED.project,
        work_item_type = EXCLUDED.work_item_type,
        state = EXCLUDED.state,
        updated_at = NOW()
    `;
  }
}

export async function getAllTickets(): Promise<DBTicket[]> {
  try {
    const tickets = await sql`
      SELECT * FROM tickets
      ORDER BY created_date DESC
    `;
    return tickets as DBTicket[];
  } catch (error: any) {
    console.error('Error getting all tickets:', error);
    // If table doesn't exist, return empty array
    if (error.message?.includes('does not exist')) {
      return [];
    }
    throw error;
  }
}

export async function getTicketStats() {
  try {
    const stats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE priority = 'Critical') as critical,
        COUNT(*) FILTER (WHERE priority = 'High') as high,
        COUNT(*) FILTER (WHERE priority = 'Medium') as medium,
        COUNT(*) FILTER (WHERE priority = 'Low') as low,
        COUNT(*) FILTER (WHERE status = 'New') as new,
        COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'Blocked') as blocked,
        COUNT(*) FILTER (WHERE status = 'Ready for Review') as ready_for_review,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed
      FROM tickets
    `;
    return stats[0];
  } catch (error: any) {
    console.error('Error getting ticket stats:', error);
    // If table doesn't exist, return zero stats
    if (error.message?.includes('does not exist')) {
      return {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        new: 0,
        in_progress: 0,
        blocked: 0,
        ready_for_review: 0,
        completed: 0
      };
    }
    throw error;
  }
}

export { sql };
