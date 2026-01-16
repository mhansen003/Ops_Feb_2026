'use client';

import { type Ticket, type TicketStats } from '@/lib/data-client';

interface TakeawaysProps {
  tickets: Ticket[];
  stats: TicketStats;
}

export default function Takeaways({ tickets, stats }: TakeawaysProps) {
  // Calculate real insights from data
  const today = new Date();

  // Overdue tickets
  const overdueTickets = tickets.filter(t => new Date(t.targetDate) < today);

  // Blocked tickets
  const blockedTickets = tickets.filter(t => t.status === 'Blocked');

  // High priority items (Critical + High)
  const highPriorityCount = (stats.byPriority.Critical || 0) + (stats.byPriority.High || 0);

  // Team capacity metrics
  const uniqueAssignees = new Set(tickets.map(t => t.assignee).filter(a => a !== 'Unassigned')).size;
  const avgTicketsPerPerson = uniqueAssignees > 0 ? Math.round(tickets.length / uniqueAssignees) : 0;

  // Calculate on-track percentage
  const completedCount = stats.byStatus.Completed || 0;
  const inProgressCount = stats.byStatus['In Progress'] || 0;
  const readyForReviewCount = stats.byStatus['Ready for Review'] || 0;
  const onTrackCount = inProgressCount + readyForReviewCount + completedCount;
  const onTrackPercentage = stats.total > 0 ? Math.round((onTrackCount / stats.total) * 100) : 0;

  // Security items analysis
  const securityCount = stats.byCategory?.Security || 0;
  const securityInProgress = tickets.filter(t => t.category === 'Security' && t.status === 'In Progress').length;
  const securityCritical = tickets.filter(t => t.category === 'Security' && (t.priority === 'Critical' || t.priority === 'High')).length;

  // Get upcoming deadlines grouped by timeframe
  const getUpcomingTickets = (daysStart: number, daysEnd: number) => {
    return tickets.filter(t => {
      const dueDate = new Date(t.targetDate);
      const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= daysStart && daysUntil <= daysEnd;
    }).sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    });
  };

  const keyTakeaways = [
    {
      title: 'Strong Security Focus',
      icon: '🔒',
      color: 'from-purple-500 to-pink-500',
      description: 'Security initiatives represent a significant portion of our backlog, demonstrating commitment to compliance and risk mitigation.',
      metrics: [
        { label: 'Security Tickets', value: String(securityCount) },
        { label: 'High Priority Security', value: String(securityCritical) },
        { label: 'In Progress', value: String(securityInProgress) }
      ]
    },
    {
      title: 'Infrastructure Modernization',
      icon: '🏗️',
      color: 'from-blue-500 to-cyan-500',
      description: 'Ongoing infrastructure improvements position us for better scalability and reliability.',
      metrics: [
        { label: 'Infrastructure Items', value: String(stats.byCategory.Infrastructure || 0) },
        { label: 'In Progress', value: String(tickets.filter(t => t.category === 'Infrastructure' && t.status === 'In Progress').length) },
        { label: 'Team Members', value: String(uniqueAssignees) }
      ]
    },
    {
      title: 'Performance Optimization',
      icon: '⚡',
      color: 'from-amber-500 to-orange-500',
      description: 'Database and system optimizations will significantly improve user experience and reduce operational costs.',
      metrics: [
        { label: 'Performance Tickets', value: String(stats.byCategory.Performance || 0) },
        { label: 'Feature Requests', value: String(stats.byCategory.Feature || 0) },
        { label: 'Bug Fixes', value: String(stats.byCategory['Bug Fix'] || 0) }
      ]
    }
  ];

  // Build next steps timeline from real data
  const week1Tickets = getUpcomingTickets(0, 7);
  const week2Tickets = getUpcomingTickets(8, 14);
  const week3Tickets = getUpcomingTickets(15, 28);

  // Include overdue items in week 1
  const urgentTickets = [...overdueTickets, ...week1Tickets.filter(t => t.priority === 'Critical' || t.priority === 'High')].slice(0, 4);

  const mapStatusToDisplay = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'urgent';
    if (status === 'In Progress') return 'in-progress';
    if (status === 'Ready for Review') return 'review';
    if (status === 'Blocked') return 'urgent';
    return 'planned';
  };

  const nextSteps = [
    {
      phase: 'Week 1 (Immediate)',
      priority: 'Critical' as const,
      color: 'border-rose-500',
      actions: urgentTickets.length > 0 ? urgentTickets.map(t => {
        const isOverdue = new Date(t.targetDate) < today;
        return {
          task: `${t.id}: ${t.title.substring(0, 60)}${t.title.length > 60 ? '...' : ''}`,
          owner: t.assignee,
          status: mapStatusToDisplay(t.status, isOverdue)
        };
      }) : [
        { task: 'No urgent items this week', owner: 'Team', status: 'planned' as const }
      ]
    },
    {
      phase: 'Week 2 (Next 7-14 days)',
      priority: 'High' as const,
      color: 'border-amber-500',
      actions: week2Tickets.slice(0, 4).length > 0 ? week2Tickets.slice(0, 4).map(t => ({
        task: `${t.id}: ${t.title.substring(0, 60)}${t.title.length > 60 ? '...' : ''}`,
        owner: t.assignee,
        status: mapStatusToDisplay(t.status, false)
      })) : [
        { task: 'No scheduled items for this period', owner: 'Team', status: 'planned' as const }
      ]
    },
    {
      phase: 'Week 3-4 (15-28 days)',
      priority: 'Medium' as const,
      color: 'border-blue-500',
      actions: week3Tickets.slice(0, 4).length > 0 ? week3Tickets.slice(0, 4).map(t => ({
        task: `${t.id}: ${t.title.substring(0, 60)}${t.title.length > 60 ? '...' : ''}`,
        owner: t.assignee,
        status: mapStatusToDisplay(t.status, false)
      })) : [
        { task: 'No scheduled items for this period', owner: 'Team', status: 'planned' as const }
      ]
    }
  ];

  // Build risk assessment from real data
  const risks = [];

  if (blockedTickets.length > 0) {
    risks.push({
      risk: `${blockedTickets.length} Blocked Item${blockedTickets.length > 1 ? 's' : ''} Preventing Progress`,
      impact: blockedTickets.length >= 3 ? 'High' as const : 'Medium' as const,
      mitigation: `Immediate escalation required. Top blocked items: ${blockedTickets.slice(0, 2).map(t => t.id).join(', ')}. Schedule blocker resolution meeting within 48 hours.`,
      owner: 'Engineering Leadership'
    });
  }

  if (overdueTickets.length > 0) {
    risks.push({
      risk: `${overdueTickets.length} Overdue Item${overdueTickets.length > 1 ? 's' : ''} Past Target Date`,
      impact: overdueTickets.length >= 5 ? 'High' as const : 'Medium' as const,
      mitigation: overdueTickets.length >= 5
        ? `Critical: ${overdueTickets.length} overdue items. Recommend daily standup focused on clearing backlog. Consider resource reallocation.`
        : `Review ${overdueTickets.length} overdue item(s). Adjust timelines or prioritize completion.`,
      owner: 'Project Management'
    });
  }

  if (avgTicketsPerPerson > 15) {
    risks.push({
      risk: 'Team Capacity at High Utilization',
      impact: 'Medium' as const,
      mitigation: `Team averaging ${avgTicketsPerPerson} tickets/person. Evaluate contractor support. Consider deferring lower priority work.`,
      owner: 'Resource Planning'
    });
  }

  if (securityCritical > 0 && securityInProgress < securityCritical) {
    risks.push({
      risk: `${securityCritical} High Priority Security Items Need Attention`,
      impact: 'High' as const,
      mitigation: `Security items require immediate focus. Only ${securityInProgress} currently in progress. Ensure compliance deadlines are met.`,
      owner: 'Security Team'
    });
  }

  // Add placeholder if no risks
  if (risks.length === 0) {
    risks.push({
      risk: 'No Major Risks Identified',
      impact: 'Low' as const,
      mitigation: 'Team is on track with no critical blockers. Continue monitoring for emerging risks and maintain clear communication.',
      owner: 'Project Management'
    });
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="card bg-gradient-to-br from-blue-500/10 via-transparent to-teal-500/10 border-2 border-blue-500/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">📋</span>
          <h2 className="text-3xl font-bold gradient-text">Executive Summary</h2>
        </div>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 leading-relaxed">
            The Operations team is managing {stats.total} active items across {Object.keys(stats.byProject || {}).length} projects,
            focused on <strong className="text-white">security compliance</strong> ({securityCount} items),{' '}
            <strong className="text-white">infrastructure modernization</strong> ({stats.byCategory.Infrastructure || 0} items), and{' '}
            <strong className="text-white">feature development</strong> ({stats.byCategory.Feature || 0} items).{' '}
            {highPriorityCount > 0 && `${highPriorityCount} high-priority items are being actively managed. `}
            Current risk level is{' '}
            <strong className={
              overdueTickets.length + blockedTickets.length > 10 ? 'text-rose-400' :
              overdueTickets.length + blockedTickets.length > 5 ? 'text-amber-400' :
              'text-teal-400'
            }>
              {overdueTickets.length + blockedTickets.length > 10 ? 'High' :
               overdueTickets.length + blockedTickets.length > 5 ? 'Medium' :
               'Low'}
            </strong>{' '}
            {overdueTickets.length > 0 && `with ${overdueTickets.length} overdue item(s) `}
            {blockedTickets.length > 0 && `and ${blockedTickets.length} blocked item(s) `}
            requiring immediate attention.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Team velocity is <strong className={onTrackPercentage >= 70 ? 'text-teal-400' : 'text-amber-400'}>
              {onTrackPercentage >= 70 ? 'on track' : 'moderate'}
            </strong> with {inProgressCount} items in progress and {readyForReviewCount} ready for review.{' '}
            {uniqueAssignees} team members are actively engaged, averaging {avgTicketsPerPerson} tickets per person.{' '}
            {stats.byCategory.Feature && stats.byCategory.Feature > 0 && `${stats.byCategory.Feature} feature requests and `}
            {stats.byCategory['Bug Fix'] && stats.byCategory['Bug Fix'] > 0 && `${stats.byCategory['Bug Fix']} bug fixes are in the current sprint.`}
          </p>
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="card">
        <h3 className="text-2xl font-bold mb-6">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {keyTakeaways.map((takeaway, index) => (
            <div key={index} className="relative">
              <div className="h-full p-6 bg-gray-800/30 rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
                <div className={`text-4xl mb-3 bg-gradient-to-r ${takeaway.color} bg-clip-text`}>
                  {takeaway.icon}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{takeaway.title}</h4>
                <p className="text-sm text-gray-400 mb-4">{takeaway.description}</p>
                <div className="space-y-2">
                  {takeaway.metrics.map((metric, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{metric.label}</span>
                      <span className="font-semibold text-teal-400">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps Timeline */}
      <div className="card">
        <h3 className="text-2xl font-bold mb-6">Action Plan & Timeline</h3>
        <div className="space-y-6">
          {nextSteps.map((step, index) => (
            <div key={index} className={`p-6 bg-gray-800/30 rounded-xl border-l-4 ${step.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-white">{step.phase}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  step.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                  step.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {step.priority} Priority
                </span>
              </div>
              <div className="space-y-3">
                {step.actions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      action.status === 'urgent' ? 'bg-rose-500' :
                      action.status === 'in-progress' ? 'bg-blue-500' :
                      action.status === 'review' ? 'bg-teal-500' :
                      action.status === 'scheduled' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{action.task}</div>
                      <div className="text-xs text-gray-500 mt-1">Owner: {action.owner}</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      action.status === 'urgent' ? 'bg-rose-500/20 text-rose-400' :
                      action.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                      action.status === 'review' ? 'bg-teal-500/20 text-teal-400' :
                      action.status === 'scheduled' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {action.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk & Mitigation */}
      <div className="card">
        <h3 className="text-2xl font-bold mb-6">Risk Assessment & Mitigation</h3>
        <div className="space-y-4">
          {risks.map((item, index) => (
            <div key={index} className="p-5 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  ⚠️ {item.risk}
                </h4>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.impact === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {item.impact} Impact
                </span>
              </div>
              <div className="mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mitigation Strategy</span>
                <p className="text-sm text-gray-300 mt-1">{item.mitigation}</p>
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Owner:</span> {item.owner}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card bg-gradient-to-br from-teal-500/10 via-transparent to-blue-500/10 border-2 border-teal-500/30">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>💡</span> Leadership Recommendations
        </h3>
        <div className="space-y-4">
          {blockedTickets.length > 0 && (
            <RecommendationItem
              priority="Immediate"
              color="text-rose-400"
              text={`Unblock ${blockedTickets.length} item(s) preventing progress: ${blockedTickets.slice(0, 2).map(t => t.id).join(', ')}${blockedTickets.length > 2 ? `, and ${blockedTickets.length - 2} more` : ''}. Schedule resolution meeting within 48 hours.`}
            />
          )}
          {overdueTickets.length > 0 && (
            <RecommendationItem
              priority="This Week"
              color="text-amber-400"
              text={`Address ${overdueTickets.length} overdue item(s). ${overdueTickets.length > 5 ? 'Consider daily standup focused on clearing backlog and resource reallocation.' : 'Review priorities and adjust timelines as needed.'}`}
            />
          )}
          {avgTicketsPerPerson > 15 && (
            <RecommendationItem
              priority="Resource Planning"
              color="text-amber-400"
              text={`Team capacity at high utilization (${avgTicketsPerPerson} tickets/person average). Evaluate contractor support and consider deferring lower priority work.`}
            />
          )}
          {readyForReviewCount > 0 && (
            <RecommendationItem
              priority="This Week"
              color="text-blue-400"
              text={`${readyForReviewCount} item(s) ready for review. Schedule demos for completed work and prepare for deployment.`}
            />
          )}
          {securityCount > 5 && (
            <RecommendationItem
              priority="Compliance"
              color="text-purple-400"
              text={`Strong security focus with ${securityCount} items. ${securityInProgress > 0 ? `${securityInProgress} actively in progress.` : 'Consider prioritizing security items for compliance deadlines.'} Prepare executive summary of security posture improvements.`}
            />
          )}
          {blockedTickets.length === 0 && overdueTickets.length === 0 && avgTicketsPerPerson <= 15 && (
            <RecommendationItem
              priority="On Track"
              color="text-teal-400"
              text="Team is performing well with no major blockers. Continue current velocity and monitor for emerging risks. Schedule regular stakeholder updates to showcase progress."
            />
          )}
        </div>
      </div>

      {/* Success Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SuccessMetric
          icon="✅"
          value={`${onTrackPercentage}%`}
          label="On-Track Items"
          color={onTrackPercentage >= 70 ? 'text-teal-400' : onTrackPercentage >= 50 ? 'text-amber-400' : 'text-rose-400'}
        />
        <SuccessMetric
          icon="🎯"
          value={String(highPriorityCount)}
          label="High Priority Items"
          color="text-blue-400"
        />
        <SuccessMetric
          icon="👥"
          value={String(uniqueAssignees)}
          label="Active Team Members"
          color="text-purple-400"
        />
        <SuccessMetric
          icon="📈"
          value={String(stats.byCategory.Feature || 0)}
          label="Feature Requests"
          color="text-teal-400"
        />
      </div>
    </div>
  );
}

interface RecommendationItemProps {
  priority: string;
  color: string;
  text: string;
}

function RecommendationItem({ priority, color, text }: RecommendationItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
      <div className={`px-3 py-1 rounded-lg font-semibold text-xs ${color} bg-gray-800 whitespace-nowrap`}>
        {priority}
      </div>
      <p className="text-sm text-gray-300 flex-1">{text}</p>
    </div>
  );
}

interface SuccessMetricProps {
  icon: string;
  value: string;
  label: string;
  color: string;
}

function SuccessMetric({ icon, value, label, color }: SuccessMetricProps) {
  return (
    <div className="card text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}
