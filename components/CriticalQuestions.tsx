'use client';

import { type Ticket, type TicketStats } from '@/lib/data-client';

interface CriticalQuestionsProps {
  tickets: Ticket[];
  stats: TicketStats;
}

export default function CriticalQuestions({ tickets, stats }: CriticalQuestionsProps) {
  // Calculate real insights from data
  const today = new Date();

  // High priority items (Critical + High)
  const highPriorityCount = (stats.byPriority.Critical || 0) + (stats.byPriority.High || 0);

  // Overdue tickets
  const overdueTickets = tickets.filter(t => new Date(t.targetDate) < today);

  // Upcoming due items (next 14 days)
  const upcomingDue = tickets.filter(t => {
    const dueDate = new Date(t.targetDate);
    const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 14;
  });

  // Top assignees by workload
  const assigneeWorkload = tickets.reduce((acc, ticket) => {
    acc[ticket.assignee] = (acc[ticket.assignee] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topAssignees = Object.entries(assigneeWorkload)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Blocked items details
  const blockedTickets = tickets.filter(t => t.status === 'Blocked');

  // Security items
  const securityCount = stats.byCategory?.Security || 0;

  // Calculate team capacity metrics
  const uniqueAssignees = new Set(tickets.map(t => t.assignee).filter(a => a !== 'Unassigned')).size;
  const avgTicketsPerPerson = uniqueAssignees > 0 ? Math.round(tickets.length / uniqueAssignees) : 0;

  const questions = [
    {
      id: 1,
      question: 'What are our highest-risk items that could impact production?',
      icon: '🔴',
      color: 'border-rose-500',
      answer: {
        summary: highPriorityCount > 0
          ? `We have ${highPriorityCount} high-priority items requiring immediate attention, with ${overdueTickets.length} already overdue.`
          : `No critical priority items currently. ${overdueTickets.length} items are overdue and need review.`,
        details: overdueTickets.length > 0
          ? [
              ...overdueTickets.slice(0, 4).map(t => {
                const daysOverdue = Math.floor((today.getTime() - new Date(t.targetDate).getTime()) / (1000 * 60 * 60 * 24));
                return `${t.id}: ${t.title.substring(0, 70)} (${daysOverdue} days overdue)`;
              }),
              overdueTickets.length > 4 ? `...and ${overdueTickets.length - 4} more overdue items` : ''
            ].filter(Boolean)
          : [
              'No overdue items - team is on track',
              `${upcomingDue.length} items due in next 14 days`,
              `Focus on ${stats.byCategory.Security || 0} security items`,
              'Monitor blocked items for resolution'
            ],
        recommendation: overdueTickets.length > 3
          ? `Immediate action required: ${overdueTickets.length} overdue items. Recommend daily standup focused on clearing overdue backlog. Consider resource reallocation.`
          : overdueTickets.length > 0
          ? `Address ${overdueTickets.length} overdue item(s). Review priorities and adjust timelines as needed.`
          : 'Team is on track. Continue monitoring upcoming deadlines and blocked items.'
      }
    },
    {
      id: 2,
      question: 'Are we properly resourced to meet our commitments?',
      icon: '👥',
      color: 'border-blue-500',
      answer: {
        summary: `${stats.byStatus['In Progress'] || 0} items currently in progress across ${uniqueAssignees} active team members (avg ${avgTicketsPerPerson} tickets/person).`,
        details: [
          `${blockedTickets.length} blocked items need immediate resolution`,
          `Top loaded: ${topAssignees[0]?.[0]} (${topAssignees[0]?.[1]} tickets), ${topAssignees[1]?.[0]} (${topAssignees[1]?.[1]} tickets)`,
          `${stats.byStatus.New || 0} new items need assignment and sizing`,
          `${upcomingDue.length} items due within next 14 days`
        ],
        recommendation: avgTicketsPerPerson > 15
          ? 'Team capacity at HIGH utilization. Recommend resource allocation review and consider deferring lower priority work.'
          : avgTicketsPerPerson > 10
          ? 'Team capacity at MODERATE utilization. Monitor workload and unblock items quickly.'
          : 'Team capacity appears manageable. Focus on velocity and quality.'
      }
    },
    {
      id: 3,
      question: 'What dependencies could derail our timeline?',
      icon: '🔗',
      color: 'border-amber-500',
      answer: {
        summary: blockedTickets.length > 0
          ? `${blockedTickets.length} blocked items require immediate attention to prevent timeline delays.`
          : 'No currently blocked items. Monitor cross-project dependencies.',
        details: blockedTickets.length > 0
          ? [
              ...blockedTickets.slice(0, 3).map(t => `${t.id}: ${t.title.substring(0, 70)} [${t.project}]`),
              blockedTickets.length > 3 ? `...and ${blockedTickets.length - 3} more blocked items` : '',
              'Unblock these items to maintain velocity'
            ].filter(Boolean)
          : [
              'No blocked items - good project flow',
              `Security items (${securityCount}) may have compliance dependencies`,
              `${stats.byProject?.['Byte LOS'] || 0} Byte LOS + ${stats.byProject?.BYTE || 0} BYTE + ${stats.byProject?.['Product Masters'] || 0} Product Masters items require cross-team coordination`,
              'Monitor for emerging dependencies'
            ],
        recommendation: blockedTickets.length > 0
          ? `URGENT: Unblock ${blockedTickets.length} item(s) immediately. Create dependency graph and identify critical path. Schedule blocker resolution meeting.`
          : 'Maintain clear communication across projects. Proactively identify and document dependencies before they become blockers.'
      }
    },
    {
      id: 4,
      question: 'How is our security posture evolving?',
      icon: '🔒',
      color: 'border-purple-500',
      answer: {
        summary: `${securityCount} security-focused initiatives in progress, representing ${Math.round((securityCount / stats.total) * 100)}% of active backlog.`,
        details: securityCount > 0
          ? [
              `${securityCount} security items across all projects`,
              `${tickets.filter(t => t.category === 'Security' && t.status === 'In Progress').length} actively being worked`,
              `${tickets.filter(t => t.category === 'Security' && (t.priority === 'Critical' || t.priority === 'High')).length} high-priority security items`,
              'Permissions, access controls, and compliance work in flight'
            ]
          : [
              'Limited security-specific work items',
              'Consider security audit and compliance review',
              'Ensure security best practices in all development',
              'Schedule security planning session'
            ],
        recommendation: securityCount > 10
          ? 'Strong security focus. Ensure items complete before next audit cycle. Consider dedicated security team capacity.'
          : securityCount > 5
          ? 'Moderate security focus. Monitor progress and ensure timely completion of compliance items.'
          : 'Low security focus. Recommend security posture review and identify any missing compliance work.'
      }
    },
    {
      id: 5,
      question: 'What technical debt should we address vs defer?',
      icon: '⚖️',
      color: 'border-teal-500',
      answer: {
        summary: `Balancing ${stats.byCategory.Infrastructure || 0} infrastructure items with ${stats.byCategory.Feature || 0} feature requests and ${stats.byCategory['Bug Fix'] || 0} bug fixes.`,
        details: [
          `MUST DO: ${overdueTickets.length} overdue items need immediate attention`,
          `MUST DO: ${securityCount} security/compliance items`,
          `SHOULD DO: ${stats.byCategory.Infrastructure || 0} infrastructure improvements`,
          `CAN DEFER: ${stats.byCategory.Documentation || 0} documentation updates without immediate impact`
        ],
        recommendation: overdueTickets.length > 5
          ? 'Focus on clearing overdue backlog first. Defer non-critical infrastructure work to next sprint.'
          : 'Balanced approach: Address must-do security/compliance, improve infrastructure, defer low-impact documentation to future sprints.'
      }
    },
    {
      id: 6,
      question: 'What wins can we demonstrate to leadership?',
      icon: '🎯',
      color: 'border-emerald-500',
      answer: {
        summary: `${stats.total} active initiatives across ${Object.keys(stats.byProject || {}).length} projects with ${stats.byCategory.Feature || 0} new features in progress.`,
        details: [
          `${securityCount} security improvements enhancing compliance posture`,
          `${stats.byCategory.Performance || 0} performance optimizations in flight`,
          `${stats.byCategory.Feature || 0} new features delivering business value`,
          `${stats.byStatus['Ready for Review'] || 0} items ready for review/deployment`,
          `Active work across ${uniqueAssignees} team members showing broad engagement`
        ],
        recommendation: stats.byStatus['Ready for Review'] > 0
          ? `Prepare executive summary highlighting: ${securityCount} security enhancements, ${stats.byCategory.Feature} features, and ${stats.byStatus['Ready for Review']} items ready to deploy. Schedule demo for completed work.`
          : 'As items complete, document quantifiable improvements (performance gains, security enhancements, user impact). Schedule regular demos to showcase progress.'
      }
    }
  ];

  // Calculate risk level
  const getRiskLevel = () => {
    const riskScore =
      (overdueTickets.length * 3) +
      (blockedTickets.length * 2) +
      (highPriorityCount * 1);

    if (riskScore > 20) return { level: 'High', color: 'text-rose-400' };
    if (riskScore > 10) return { level: 'Medium-High', color: 'text-amber-400' };
    if (riskScore > 5) return { level: 'Medium', color: 'text-yellow-400' };
    return { level: 'Low', color: 'text-teal-400' };
  };

  const riskLevel = getRiskLevel();

  // Calculate velocity metric
  const getVelocityStatus = () => {
    const inProgress = stats.byStatus['In Progress'] || 0;
    const blocked = blockedTickets.length;
    const ratio = blocked > 0 ? inProgress / blocked : inProgress;

    if (ratio > 10) return { status: 'Excellent', color: 'text-teal-400' };
    if (ratio > 5) return { status: 'On Track', color: 'text-blue-400' };
    if (ratio > 2) return { status: 'Moderate', color: 'text-amber-400' };
    return { status: 'At Risk', color: 'text-rose-400' };
  };

  const velocity = getVelocityStatus();

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">Critical Questions</h2>
        <p className="text-gray-400 mb-6">
          Data-driven strategic analysis for operations leadership review
        </p>

        <div className="space-y-6">
          {questions.map((item) => (
            <div
              key={item.id}
              className={`p-6 bg-gray-800/30 rounded-xl border-l-4 ${item.color} hover:bg-gray-800/50 transition-all`}
            >
              {/* Question */}
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {item.question}
                  </h3>

                  {/* Summary */}
                  <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-blue-400 font-medium">{item.answer.summary}</p>
                  </div>

                  {/* Details */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Key Points
                    </h4>
                    <ul className="space-y-2">
                      {item.answer.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-teal-400 mt-1">▸</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation */}
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-lg border border-blue-500/30">
                    <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-2">
                      💡 Recommendation
                    </h4>
                    <p className="text-sm text-gray-300">{item.answer.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Risk Level
          </h4>
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <div className={`text-2xl font-bold ${riskLevel.color}`}>{riskLevel.level}</div>
              <div className="text-xs text-gray-500">
                {overdueTickets.length} overdue, {blockedTickets.length} blocked
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Team Velocity
          </h4>
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <div>
              <div className={`text-2xl font-bold ${velocity.color}`}>{velocity.status}</div>
              <div className="text-xs text-gray-500">
                {stats.byStatus['In Progress'] || 0} in progress, {stats.byStatus['Ready for Review'] || 0} ready
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Priority Focus
          </h4>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎯</div>
            <div>
              <div className="text-2xl font-bold text-teal-400">
                {Object.keys(stats.byCategory || {}).sort((a, b) =>
                  (stats.byCategory[b] || 0) - (stats.byCategory[a] || 0)
                )[0] || 'Balanced'}
              </div>
              <div className="text-xs text-gray-500">
                {stats.byCategory.Security || 0} security, {stats.byCategory.Feature || 0} features
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
