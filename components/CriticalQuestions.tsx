'use client';

import { type Ticket, type TicketStats } from '@/lib/data-client';
import { TicketLink } from './TicketLink';

interface CriticalQuestionsProps {
  tickets: Ticket[];
  stats: TicketStats;
}

export default function CriticalQuestions({ tickets, stats }: CriticalQuestionsProps) {
  // High priority items (Critical + High)
  const highPriorityCount = (stats.byPriority.Critical || 0) + (stats.byPriority.High || 0);
  const highPriorityTickets = tickets.filter(t => t.priority === 'Critical' || t.priority === 'High');

  // Workload by assignee
  const assigneeWorkload = stats.byAssignee || {};
  const topAssignees = Object.entries(assigneeWorkload)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Items by status
  const newTickets = tickets.filter(t => t.status === 'New');
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress');
  const readyForReviewTickets = tickets.filter(t => t.status === 'Ready for Review');
  const blockedTickets = tickets.filter(t => t.status === 'Blocked');

  // Items by ADO state (more granular)
  const getTicketsByState = (state: string) => tickets.filter(t => t.state === state);
  const inQATickets = getTicketsByState('In QA');
  const inDevTickets = getTicketsByState('In Dev');
  const bsaInProgressTickets = getTicketsByState('BSA in Progress');
  const onHoldTickets = getTicketsByState('On Hold');
  const prioritizedBacklogTickets = getTicketsByState('Prioritized Backlog');

  // Unique assignees
  const uniqueAssignees = new Set(tickets.map(t => t.assignee).filter(a => a !== 'Unassigned')).size;
  const avgTicketsPerPerson = uniqueAssignees > 0 ? Math.round(tickets.length / uniqueAssignees) : 0;

  // Unassigned items
  const unassignedTickets = tickets.filter(t => !t.assignee || t.assignee === 'Unassigned');

  const questions = [
    {
      id: 1,
      question: 'What are our highest-risk items that could impact delivery?',
      icon: '🔴',
      color: 'border-rose-500',
      answer: {
        summary: highPriorityCount > 0
          ? `We have ${highPriorityCount} high-priority items (${stats.byPriority.Critical} Critical, ${stats.byPriority.High} High) requiring attention.`
          : 'No critical or high priority items currently flagged.',
        details: highPriorityTickets.length > 0
          ? [
              ...highPriorityTickets.slice(0, 4).map(t =>
                `${t.id}: ${t.title.substring(0, 60)}... [${t.priority}] - ${t.assignee}`
              ),
              highPriorityTickets.length > 4 ? `...and ${highPriorityTickets.length - 4} more high-priority items` : ''
            ].filter(Boolean)
          : [
              'No critical or high priority items',
              `${stats.byPriority.Medium} medium priority items to monitor`,
              `${stats.byPriority.Low} low priority items`,
            ],
        recommendation: highPriorityCount > 10
          ? `Review ${highPriorityCount} high-priority items. Consider resource reallocation to address critical items first. Daily standups recommended for high-priority items.`
          : highPriorityCount > 0
          ? `${highPriorityCount} high-priority items are manageable. Ensure assignees have capacity to complete these first.`
          : 'No critical items. Focus on maintaining momentum and monitoring medium priority items.'
      }
    },
    {
      id: 2,
      question: 'Are we properly resourced to meet our commitments?',
      icon: '👥',
      color: 'border-blue-500',
      answer: {
        summary: `${inProgressTickets.length} items in progress across ${uniqueAssignees} active team members (avg ${avgTicketsPerPerson} tickets/person).`,
        details: [
          `Top loaded: ${topAssignees[0]?.[0]} (${topAssignees[0]?.[1]} tickets), ${topAssignees[1]?.[0]} (${topAssignees[1]?.[1]} tickets)`,
          `${unassignedTickets.length} unassigned items need assignment`,
          `${newTickets.length} new items in backlog (${prioritizedBacklogTickets.length} prioritized)`,
          `${readyForReviewTickets.length} items ready for review/release`
        ],
        recommendation: avgTicketsPerPerson > 12
          ? 'Team capacity at HIGH utilization. Recommend resource allocation review and consider deferring lower priority work.'
          : avgTicketsPerPerson > 8
          ? 'Team capacity at MODERATE utilization. Monitor workload and ensure blockers are resolved quickly.'
          : 'Team capacity appears manageable. Focus on velocity and quality.'
      }
    },
    {
      id: 3,
      question: 'What items are blocked and need escalation?',
      icon: '🚫',
      color: 'border-amber-500',
      answer: {
        summary: blockedTickets.length > 0
          ? `${blockedTickets.length} items blocked. ${onHoldTickets.length} items on hold require review.`
          : 'No currently blocked items. Good project flow!',
        details: blockedTickets.length > 0
          ? [
              ...blockedTickets.slice(0, 3).map(t => `${t.id}: ${t.title.substring(0, 60)}... [${t.assignee}]`),
              blockedTickets.length > 3 ? `...and ${blockedTickets.length - 3} more blocked items` : '',
              onHoldTickets.length > 0 ? `${onHoldTickets.length} items on hold - review priorities` : 'No items on hold'
            ].filter(Boolean)
          : [
              'No blocked items - excellent project health',
              `${onHoldTickets.length} items on hold may need review`,
              `${inQATickets.length} items in QA testing`,
              `${inDevTickets.length} items in active development`
            ],
        recommendation: blockedTickets.length > 0
          ? `URGENT: Review ${blockedTickets.length} blocked items. Schedule blocker resolution meeting. Identify owners and next steps for each.`
          : onHoldTickets.length > 5
          ? `Review ${onHoldTickets.length} on-hold items to determine if they should be resumed or deprioritized.`
          : 'Continue monitoring. Proactively identify dependencies before they become blockers.'
      }
    },
    {
      id: 4,
      question: 'What is our development pipeline status?',
      icon: '🔄',
      color: 'border-purple-500',
      answer: {
        summary: `Pipeline: ${bsaInProgressTickets.length} in BSA → ${inDevTickets.length} in Dev → ${inQATickets.length} in QA → ${readyForReviewTickets.length} Ready for Release`,
        details: [
          `${bsaInProgressTickets.length} items being analyzed (BSA in Progress)`,
          `${inDevTickets.length} items in active development`,
          `${inQATickets.length} items in QA testing`,
          `${readyForReviewTickets.length} items ready for release`,
          `${newTickets.length} items in backlog queue`
        ],
        recommendation: inQATickets.length > inDevTickets.length
          ? 'QA queue is building. Ensure QA resources can handle volume. Consider prioritizing QA to move items to release.'
          : inDevTickets.length > 5
          ? `${inDevTickets.length} items in development. Ensure clear priorities and avoid context switching.`
          : 'Pipeline looks healthy. Continue current cadence.'
      }
    },
    {
      id: 5,
      question: 'What can we release in the next Wednesday deployment?',
      icon: '🚀',
      color: 'border-teal-500',
      answer: {
        summary: `${readyForReviewTickets.length} items ready for release, plus ${inQATickets.length} in QA that could complete by Wednesday.`,
        details: readyForReviewTickets.length > 0
          ? [
              ...readyForReviewTickets.slice(0, 4).map(t =>
                `${t.id}: ${t.title.substring(0, 55)}... [${t.state}]`
              ),
              readyForReviewTickets.length > 4 ? `...and ${readyForReviewTickets.length - 4} more ready items` : ''
            ].filter(Boolean)
          : [
              'No items currently marked ready for release',
              `${inQATickets.length} items in QA could be ready soon`,
              'Focus on completing QA for candidate items',
              'Review prioritized backlog for quick wins'
            ],
        recommendation: readyForReviewTickets.length >= 5
          ? `Strong release candidate pool (${readyForReviewTickets.length} items). Prepare release notes and coordinate with stakeholders.`
          : readyForReviewTickets.length > 0
          ? `${readyForReviewTickets.length} items ready. Consider accelerating ${inQATickets.length} QA items to increase release scope.`
          : 'Focus on completing in-flight items. Prioritize QA completion for next release cycle.'
      }
    },
    {
      id: 6,
      question: 'How can we demonstrate progress to leadership?',
      icon: '🎯',
      color: 'border-emerald-500',
      answer: {
        summary: `${stats.total} active backlog items with ${readyForReviewTickets.length} ready for release. Team velocity: ${inProgressTickets.length} items in active work.`,
        details: [
          `${readyForReviewTickets.length} items completed and ready for deployment`,
          `${inProgressTickets.length} items actively being worked (${inDevTickets.length} dev, ${inQATickets.length} QA)`,
          `${highPriorityCount} high-priority items being addressed`,
          `${uniqueAssignees} team members actively contributing`,
          `Wednesday releases maintaining consistent delivery cadence`
        ],
        recommendation: readyForReviewTickets.length > 0
          ? `Prepare executive summary highlighting ${readyForReviewTickets.length} items ready for release. Include impact statements and stakeholder benefits.`
          : 'Track completion velocity. Document in-progress work and expected completion dates. Schedule demos for near-complete items.'
      }
    }
  ];

  // Calculate risk level
  const getRiskLevel = () => {
    const riskScore =
      (blockedTickets.length * 3) +
      (onHoldTickets.length * 1) +
      (highPriorityCount * 1);

    if (riskScore > 20) return { level: 'High', color: 'text-rose-400' };
    if (riskScore > 10) return { level: 'Medium-High', color: 'text-amber-400' };
    if (riskScore > 5) return { level: 'Medium', color: 'text-yellow-400' };
    return { level: 'Low', color: 'text-teal-400' };
  };

  const riskLevel = getRiskLevel();

  // Calculate velocity metric
  const getVelocityStatus = () => {
    const inProgress = inProgressTickets.length;
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
                      Recommendation
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
                {blockedTickets.length} blocked, {onHoldTickets.length} on hold
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
                {inProgressTickets.length} in progress, {readyForReviewTickets.length} ready
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Release Pipeline
          </h4>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🚀</div>
            <div>
              <div className="text-2xl font-bold text-teal-400">
                {readyForReviewTickets.length} Ready
              </div>
              <div className="text-xs text-gray-500">
                {inQATickets.length} in QA, {inDevTickets.length} in dev
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
