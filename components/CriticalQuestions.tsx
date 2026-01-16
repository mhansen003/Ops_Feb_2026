'use client';

import { type Ticket, type TicketStats } from '@/lib/data-client';

interface CriticalQuestionsProps {
  tickets: Ticket[];
  stats: TicketStats;
}

export default function CriticalQuestions({ tickets, stats }: CriticalQuestionsProps) {

  const questions = [
    {
      id: 1,
      question: 'What are our highest-risk items that could impact production?',
      icon: '🔴',
      color: 'border-rose-500',
      answer: {
        summary: `We have ${stats.byPriority.Critical} critical priority items requiring immediate attention.`,
        details: [
          'Database Performance Optimization (OPS-2401) - Impacts reporting dashboards',
          'Multi-Factor Authentication (OPS-2402) - Security compliance requirement',
          'Security Audit Remediation (OPS-2409) - Must address Q4 2025 findings',
          'Container Orchestration Upgrade (OPS-2414) - Security patches needed'
        ],
        recommendation: 'Recommend daily standup focused on critical items until completion. Consider adding dedicated resources to OPS-2401 due to production impact.'
      }
    },
    {
      id: 2,
      question: 'Are we properly resourced to meet our February commitments?',
      icon: '👥',
      color: 'border-blue-500',
      answer: {
        summary: `${stats.byStatus['In Progress']} items currently in progress across ${new Set(tickets.map(t => t.assignee)).size} team members.`,
        details: [
          `${stats.byStatus.Blocked} blocked items need immediate resolution`,
          'Peak load: Sarah Chen and Marcus Johnson have 2 critical items each',
          'New items (${stats.byStatus.New}) need assignment and sizing',
          '4 items targeting Feb 28 or earlier - tight timeline'
        ],
        recommendation: 'Recommend resource allocation review. Consider pair programming on critical items. May need to defer lower priority work to March.'
      }
    },
    {
      id: 3,
      question: 'What dependencies could derail our timeline?',
      icon: '🔗',
      color: 'border-amber-500',
      answer: {
        summary: 'Multiple items have cross-dependencies that could create bottlenecks.',
        details: [
          'OPS-2406 (Monitoring Consolidation) depends on OPS-2401 completion',
          'CI/CD Pipeline Optimization (OPS-2407) is currently BLOCKED',
          'Security items must complete before infrastructure changes',
          'Database changes impact multiple downstream systems'
        ],
        recommendation: 'Create dependency graph and identify critical path. Unblock OPS-2407 immediately. Consider parallel tracks for independent work streams.'
      }
    },
    {
      id: 4,
      question: 'How is our security posture evolving?',
      icon: '🔒',
      color: 'border-purple-500',
      answer: {
        summary: `${stats.byCategory.Security} security-focused initiatives in progress.`,
        details: [
          'Multi-Factor Authentication deployment (90% complete)',
          'Security Audit Remediation addressing Q4 findings',
          'Certificate Management Automation reducing manual errors',
          'Network Segmentation planning in early stages'
        ],
        recommendation: 'Strong security focus. Ensure MFA completes before security audit follow-up. Schedule security review meeting for week of Feb 10.'
      }
    },
    {
      id: 5,
      question: 'What technical debt should we address vs defer?',
      icon: '⚖️',
      color: 'border-teal-500',
      answer: {
        summary: 'Infrastructure improvements balanced against immediate operational needs.',
        details: [
          'MUST DO: Database optimization (production impact)',
          'MUST DO: Security patches and compliance items',
          'SHOULD DO: Monitoring consolidation (improves visibility)',
          'CAN DEFER: Documentation updates to March without risk'
        ],
        recommendation: 'Focus February on must-do items. Re-evaluate should-do items weekly based on progress. Plan March sprint for deferred technical debt.'
      }
    },
    {
      id: 6,
      question: 'What wins can we demonstrate to leadership?',
      icon: '🎯',
      color: 'border-emerald-500',
      answer: {
        summary: 'Multiple high-impact deliverables expected this month.',
        details: [
          'MFA deployment improving security compliance',
          'Database optimization expected to improve dashboard load times by 60%',
          'Auto-scaling implementation reducing infrastructure costs',
          'Log aggregation upgrade providing better incident response'
        ],
        recommendation: 'Prepare executive summary highlighting: security improvements, performance gains (quantify metrics), and cost optimizations. Schedule demo for successful completions.'
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">Critical Questions</h2>
        <p className="text-gray-400 mb-6">
          Strategic analysis for operations leadership review
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
              <div className="text-2xl font-bold text-amber-400">Medium-High</div>
              <div className="text-xs text-gray-500">
                {stats.byPriority.Critical} critical, {stats.byStatus.Blocked} blocked
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
              <div className="text-2xl font-bold text-blue-400">On Track</div>
              <div className="text-xs text-gray-500">
                {stats.byStatus['In Progress']} in progress, {stats.byStatus['Ready for Review']} ready for review
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
              <div className="text-2xl font-bold text-teal-400">Security & Perf</div>
              <div className="text-xs text-gray-500">
                {stats.byCategory.Security} security, {stats.byCategory.Performance} performance
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
