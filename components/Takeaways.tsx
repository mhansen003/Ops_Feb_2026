'use client';

import { getStatistics } from '@/lib/data';

export default function Takeaways() {
  const stats = getStatistics();

  const keyTakeaways = [
    {
      title: 'Strong Security Focus',
      icon: '🔒',
      color: 'from-purple-500 to-pink-500',
      description: 'Security initiatives represent a significant portion of our backlog, demonstrating commitment to compliance and risk mitigation.',
      metrics: [
        { label: 'Security Tickets', value: stats.byCategory.Security },
        { label: 'Critical Security', value: '3' },
        { label: 'Completion Rate', value: '45%' }
      ]
    },
    {
      title: 'Infrastructure Modernization',
      icon: '🏗️',
      color: 'from-blue-500 to-cyan-500',
      description: 'Ongoing infrastructure improvements position us for better scalability and reliability.',
      metrics: [
        { label: 'Infrastructure Items', value: stats.byCategory.Infrastructure },
        { label: 'Auto-scaling Ready', value: 'Q1' },
        { label: 'Cost Optimization', value: '15%' }
      ]
    },
    {
      title: 'Performance Optimization',
      icon: '⚡',
      color: 'from-amber-500 to-orange-500',
      description: 'Database and system optimizations will significantly improve user experience and reduce operational costs.',
      metrics: [
        { label: 'Performance Tickets', value: stats.byCategory.Performance },
        { label: 'Expected Improvement', value: '60%' },
        { label: 'Systems Impacted', value: '12+' }
      ]
    }
  ];

  const nextSteps = [
    {
      phase: 'Week 1 (Feb 3-7)',
      priority: 'Critical',
      color: 'border-rose-500',
      actions: [
        { task: 'Unblock CI/CD Pipeline Optimization (OPS-2407)', owner: 'Michael Brown', status: 'urgent' },
        { task: 'Complete Database Performance work (OPS-2401)', owner: 'Sarah Chen', status: 'in-progress' },
        { task: 'Deploy Multi-Factor Authentication (OPS-2402)', owner: 'Marcus Johnson', status: 'review' },
        { task: 'Resource allocation review meeting', owner: 'Leadership', status: 'scheduled' }
      ]
    },
    {
      phase: 'Week 2 (Feb 10-14)',
      priority: 'High',
      color: 'border-amber-500',
      actions: [
        { task: 'Complete Security Audit Remediation (OPS-2409)', owner: 'Robert Kim', status: 'in-progress' },
        { task: 'Deploy Container Orchestration Upgrade (OPS-2414)', owner: 'Patricia Moore', status: 'planned' },
        { task: 'Certificate Management Automation (OPS-2413)', owner: 'Kevin Zhang', status: 'in-progress' },
        { task: 'Mid-month progress review with stakeholders', owner: 'Leadership', status: 'scheduled' }
      ]
    },
    {
      phase: 'Week 3-4 (Feb 17-28)',
      priority: 'Medium',
      color: 'border-blue-500',
      actions: [
        { task: 'Backup Recovery Testing (OPS-2404)', owner: 'David Martinez', status: 'planned' },
        { task: 'Load Balancer Configuration Review (OPS-2411)', owner: 'Chris Lee', status: 'planned' },
        { task: 'Log Aggregation System Upgrade (OPS-2412)', owner: 'Nancy Wilson', status: 'review' },
        { task: 'Month-end demos and executive summary', owner: 'Leadership', status: 'scheduled' }
      ]
    }
  ];

  const risks = [
    {
      risk: 'Blocked CI/CD Pipeline',
      impact: 'High',
      mitigation: 'Immediate escalation and resource allocation. Target resolution by Feb 5.',
      owner: 'Engineering Leadership'
    },
    {
      risk: 'Multiple Critical Items with Feb Deadlines',
      impact: 'Medium',
      mitigation: 'Daily standups for critical items. Consider extending 1-2 lower-priority items to March.',
      owner: 'Project Management'
    },
    {
      risk: 'Team Capacity Constraints',
      impact: 'Medium',
      mitigation: 'Evaluate contractor support for infrastructure tasks. Defer documentation to March.',
      owner: 'Resource Planning'
    }
  ];

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
            The Operations team is executing a balanced February sprint focused on <strong className="text-white">security
            compliance</strong>, <strong className="text-white">infrastructure modernization</strong>, and{' '}
            <strong className="text-white">performance optimization</strong>. With {stats.total} total items in backlog,{' '}
            {stats.byPriority.Critical} critical priorities are being actively managed. Current risk level is{' '}
            <strong className="text-amber-400">Medium-High</strong> due to {stats.byStatus.Blocked} blocked item(s) requiring
            immediate attention.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Team velocity is <strong className="text-teal-400">on track</strong> with {stats.byStatus['In Progress']} items
            in progress and {stats.byStatus['Ready for Review']} ready for review. Key wins expected this month include
            MFA deployment, 60% database performance improvement, and cost-optimized auto-scaling implementation.
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
          <RecommendationItem
            priority="Immediate"
            color="text-rose-400"
            text="Unblock CI/CD pipeline (OPS-2407) - assign dedicated resources by Feb 5"
          />
          <RecommendationItem
            priority="This Week"
            color="text-amber-400"
            text="Conduct resource allocation review - team capacity at 95% with critical items pending"
          />
          <RecommendationItem
            priority="Mid-Month"
            color="text-blue-400"
            text="Schedule stakeholder demo for completed security and performance improvements"
          />
          <RecommendationItem
            priority="Month-End"
            color="text-teal-400"
            text="Prepare executive summary quantifying: security posture improvement, performance gains (60% faster dashboards), and infrastructure cost savings"
          />
          <RecommendationItem
            priority="Planning"
            color="text-purple-400"
            text="Evaluate contractor support for March sprint - defer non-critical documentation to Q2"
          />
        </div>
      </div>

      {/* Success Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SuccessMetric
          icon="✅"
          value="75%"
          label="On-Track Items"
          color="text-teal-400"
        />
        <SuccessMetric
          icon="🎯"
          value="4"
          label="Critical Deliverables"
          color="text-blue-400"
        />
        <SuccessMetric
          icon="👥"
          value="95%"
          label="Team Utilization"
          color="text-amber-400"
        />
        <SuccessMetric
          icon="📈"
          value="High"
          label="Business Impact"
          color="text-purple-400"
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
