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
}

// Placeholder data for demonstration
export const tickets: Ticket[] = [
  {
    id: 'OPS-2401',
    title: 'Database Performance Optimization',
    description: 'Optimize query performance for reporting dashboards experiencing slow load times',
    priority: 'Critical',
    status: 'In Progress',
    category: 'Performance',
    assignee: 'Sarah Chen',
    createdDate: '2026-01-05',
    targetDate: '2026-02-15',
    estimatedEffort: '3 weeks',
    dependencies: ['OPS-2398'],
    tags: ['database', 'performance', 'reporting']
  },
  {
    id: 'OPS-2402',
    title: 'Implement Multi-Factor Authentication',
    description: 'Deploy MFA across all production systems to enhance security posture',
    priority: 'Critical',
    status: 'Ready for Review',
    category: 'Security',
    assignee: 'Marcus Johnson',
    createdDate: '2026-01-08',
    targetDate: '2026-02-20',
    estimatedEffort: '4 weeks',
    tags: ['security', 'authentication', 'compliance']
  },
  {
    id: 'OPS-2403',
    title: 'Auto-Scaling Implementation for API Servers',
    description: 'Implement auto-scaling policies to handle traffic spikes more efficiently',
    priority: 'High',
    status: 'In Progress',
    category: 'Infrastructure',
    assignee: 'Jennifer Wu',
    createdDate: '2026-01-10',
    targetDate: '2026-03-01',
    estimatedEffort: '2 weeks',
    tags: ['infrastructure', 'scalability', 'api']
  },
  {
    id: 'OPS-2404',
    title: 'Backup Recovery Testing',
    description: 'Conduct comprehensive disaster recovery drills for all critical systems',
    priority: 'High',
    status: 'New',
    category: 'Infrastructure',
    assignee: 'David Martinez',
    createdDate: '2026-01-12',
    targetDate: '2026-02-28',
    estimatedEffort: '2 weeks',
    tags: ['backup', 'disaster-recovery', 'testing']
  },
  {
    id: 'OPS-2405',
    title: 'API Rate Limiting Enhancement',
    description: 'Improve rate limiting logic to prevent abuse while maintaining user experience',
    priority: 'Medium',
    status: 'In Progress',
    category: 'Security',
    assignee: 'Emily Rodriguez',
    createdDate: '2026-01-14',
    targetDate: '2026-03-10',
    estimatedEffort: '1 week',
    tags: ['api', 'security', 'rate-limiting']
  },
  {
    id: 'OPS-2406',
    title: 'Monitoring Dashboard Consolidation',
    description: 'Consolidate multiple monitoring tools into unified observability platform',
    priority: 'Medium',
    status: 'New',
    category: 'Infrastructure',
    assignee: 'Alex Thompson',
    createdDate: '2026-01-16',
    targetDate: '2026-03-15',
    estimatedEffort: '3 weeks',
    dependencies: ['OPS-2401'],
    tags: ['monitoring', 'observability', 'infrastructure']
  },
  {
    id: 'OPS-2407',
    title: 'CI/CD Pipeline Optimization',
    description: 'Reduce build times and improve deployment reliability in CI/CD pipeline',
    priority: 'High',
    status: 'Blocked',
    category: 'Infrastructure',
    assignee: 'Michael Brown',
    createdDate: '2026-01-18',
    targetDate: '2026-02-25',
    estimatedEffort: '2 weeks',
    tags: ['ci-cd', 'deployment', 'automation']
  },
  {
    id: 'OPS-2408',
    title: 'Cost Optimization Analysis',
    description: 'Analyze cloud infrastructure costs and identify optimization opportunities',
    priority: 'Medium',
    status: 'In Progress',
    category: 'Infrastructure',
    assignee: 'Lisa Anderson',
    createdDate: '2026-01-20',
    targetDate: '2026-03-05',
    estimatedEffort: '2 weeks',
    tags: ['cost', 'optimization', 'cloud']
  },
  {
    id: 'OPS-2409',
    title: 'Security Audit Remediation',
    description: 'Address findings from Q4 2025 security audit',
    priority: 'Critical',
    status: 'In Progress',
    category: 'Security',
    assignee: 'Robert Kim',
    createdDate: '2026-01-22',
    targetDate: '2026-02-18',
    estimatedEffort: '3 weeks',
    tags: ['security', 'audit', 'compliance']
  },
  {
    id: 'OPS-2410',
    title: 'Documentation Update - Operations Runbooks',
    description: 'Update operational runbooks with current procedures and contact information',
    priority: 'Low',
    status: 'New',
    category: 'Documentation',
    assignee: 'Amanda Garcia',
    createdDate: '2026-01-24',
    targetDate: '2026-03-20',
    estimatedEffort: '1 week',
    tags: ['documentation', 'runbooks', 'knowledge-base']
  },
  {
    id: 'OPS-2411',
    title: 'Load Balancer Configuration Review',
    description: 'Review and optimize load balancer configurations across all environments',
    priority: 'High',
    status: 'New',
    category: 'Infrastructure',
    assignee: 'Chris Lee',
    createdDate: '2026-01-26',
    targetDate: '2026-02-22',
    estimatedEffort: '1 week',
    tags: ['load-balancer', 'infrastructure', 'performance']
  },
  {
    id: 'OPS-2412',
    title: 'Log Aggregation System Upgrade',
    description: 'Upgrade log aggregation system to handle increased volume and retention requirements',
    priority: 'Medium',
    status: 'Ready for Review',
    category: 'Infrastructure',
    assignee: 'Nancy Wilson',
    createdDate: '2026-01-28',
    targetDate: '2026-03-08',
    estimatedEffort: '2 weeks',
    tags: ['logging', 'infrastructure', 'monitoring']
  },
  {
    id: 'OPS-2413',
    title: 'Certificate Management Automation',
    description: 'Automate SSL/TLS certificate renewal and deployment processes',
    priority: 'High',
    status: 'In Progress',
    category: 'Security',
    assignee: 'Kevin Zhang',
    createdDate: '2026-01-30',
    targetDate: '2026-02-28',
    estimatedEffort: '1 week',
    tags: ['security', 'automation', 'certificates']
  },
  {
    id: 'OPS-2414',
    title: 'Container Orchestration Upgrade',
    description: 'Upgrade Kubernetes clusters to latest stable version with security patches',
    priority: 'Critical',
    status: 'New',
    category: 'Infrastructure',
    assignee: 'Patricia Moore',
    createdDate: '2026-02-01',
    targetDate: '2026-02-20',
    estimatedEffort: '2 weeks',
    tags: ['kubernetes', 'infrastructure', 'security']
  },
  {
    id: 'OPS-2415',
    title: 'Network Segmentation Implementation',
    description: 'Implement network segmentation to improve security and reduce blast radius',
    priority: 'High',
    status: 'New',
    category: 'Security',
    assignee: 'James Taylor',
    createdDate: '2026-02-03',
    targetDate: '2026-03-15',
    estimatedEffort: '4 weeks',
    tags: ['network', 'security', 'infrastructure']
  }
];

// Calculate statistics from tickets
export const getStatistics = () => {
  const total = tickets.length;
  const byPriority = {
    Critical: tickets.filter(t => t.priority === 'Critical').length,
    High: tickets.filter(t => t.priority === 'High').length,
    Medium: tickets.filter(t => t.priority === 'Medium').length,
    Low: tickets.filter(t => t.priority === 'Low').length,
  };
  const byStatus = {
    New: tickets.filter(t => t.status === 'New').length,
    'In Progress': tickets.filter(t => t.status === 'In Progress').length,
    Blocked: tickets.filter(t => t.status === 'Blocked').length,
    'Ready for Review': tickets.filter(t => t.status === 'Ready for Review').length,
    Completed: tickets.filter(t => t.status === 'Completed').length,
  };
  const byCategory = {
    Infrastructure: tickets.filter(t => t.category === 'Infrastructure').length,
    Security: tickets.filter(t => t.category === 'Security').length,
    Performance: tickets.filter(t => t.category === 'Performance').length,
    Feature: tickets.filter(t => t.category === 'Feature').length,
    'Bug Fix': tickets.filter(t => t.category === 'Bug Fix').length,
    Documentation: tickets.filter(t => t.category === 'Documentation').length,
  };

  return {
    total,
    byPriority,
    byStatus,
    byCategory,
  };
};
