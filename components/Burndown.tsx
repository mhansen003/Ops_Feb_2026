'use client';

import { useState, useMemo } from 'react';
import { type Ticket, type TicketStats } from '@/lib/data-client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
  Bar,
  BarChart,
  Cell,
} from 'recharts';
import { TicketLink } from './TicketLink';

interface BurndownProps {
  tickets: Ticket[];
  stats: TicketStats;
}

// Estimate work points by priority
const PRIORITY_POINTS: Record<string, number> = {
  Critical: 8,
  High: 5,
  Medium: 3,
  Low: 1,
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Critical: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50' },
  High: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  Medium: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  Low: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/50' },
};

const STATUS_COLORS: Record<string, string> = {
  'New': '#6b7280',
  'In Progress': '#3b82f6',
  'Blocked': '#ef4444',
  'Ready for Review': '#14b8a6',
  'Completed': '#22c55e',
};

export default function Burndown({ tickets, stats }: BurndownProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'cards'>('chart');
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);

  // Open tickets (not completed)
  const openTickets = useMemo(() => {
    let filtered = tickets.filter(t => t.status !== 'Completed');

    if (priorityFilter.length > 0) {
      filtered = filtered.filter(t => priorityFilter.includes(t.priority));
    }

    // Sort by priority weight (Critical first)
    const priorityOrder = ['Critical', 'High', 'Medium', 'Low'];
    return filtered.sort((a, b) => {
      const aIdx = priorityOrder.indexOf(a.priority);
      const bIdx = priorityOrder.indexOf(b.priority);
      if (aIdx !== bIdx) return aIdx - bIdx;
      // Secondary sort by created date (oldest first)
      return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    });
  }, [tickets, priorityFilter]);

  // Calculate work points
  const workStats = useMemo(() => {
    const stats = {
      totalOpen: openTickets.length,
      totalPoints: 0,
      byPriority: {} as Record<string, { count: number; points: number }>,
      byStatus: {} as Record<string, number>,
    };

    openTickets.forEach(t => {
      const points = PRIORITY_POINTS[t.priority] || 1;
      stats.totalPoints += points;

      if (!stats.byPriority[t.priority]) {
        stats.byPriority[t.priority] = { count: 0, points: 0 };
      }
      stats.byPriority[t.priority].count++;
      stats.byPriority[t.priority].points += points;

      stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
    });

    return stats;
  }, [openTickets]);

  // Burndown data simulation - projects remaining items to 0
  const burndownData = useMemo(() => {
    const total = stats.total;
    const completed = stats.byStatus['Completed'] || 0;
    const remaining = total - completed;

    // Calculate velocity (assume we complete ~5-8 tickets per week based on current progress)
    const completionRate = completed > 0 ? completed / 4 : 5; // tickets per week
    const weeksToComplete = Math.ceil(remaining / Math.max(completionRate, 3));
    const totalWeeks = Math.min(Math.max(weeksToComplete + 2, 8), 16); // 8-16 week projection

    const data = [];

    for (let week = 0; week <= totalWeeks; week++) {
      const weekLabel = week === 0 ? 'Now' : `Week ${week}`;

      // Actual/projected remaining (decreasing curve)
      let projectedRemaining;
      if (week === 0) {
        projectedRemaining = remaining;
      } else {
        // Simulate completion with slight variance - accelerating as we focus
        const baseCompletion = completionRate * (1 + (week * 0.05)); // slight acceleration
        projectedRemaining = Math.max(0, remaining - (baseCompletion * week));
      }

      // Ideal line (straight from current remaining to 0)
      const idealRemaining = Math.max(0, remaining - (remaining / totalWeeks) * week);

      // Completed (inverse of remaining)
      const projectedCompleted = total - projectedRemaining;

      data.push({
        week: weekLabel,
        remaining: Math.round(projectedRemaining),
        completed: Math.round(projectedCompleted),
        ideal: Math.round(idealRemaining),
      });

      // Stop if we've reached 0
      if (projectedRemaining <= 0) break;
    }

    return data;
  }, [stats]);

  // Priority distribution for chart
  const priorityChartData = useMemo(() => {
    return ['Critical', 'High', 'Medium', 'Low'].map(priority => ({
      name: priority,
      count: workStats.byPriority[priority]?.count || 0,
      points: workStats.byPriority[priority]?.points || 0,
      color: priority === 'Critical' ? '#f43f5e' :
             priority === 'High' ? '#f59e0b' :
             priority === 'Medium' ? '#3b82f6' : '#14b8a6',
    }));
  }, [workStats]);

  // Status distribution
  const statusChartData = useMemo(() => {
    return Object.entries(workStats.byStatus).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#6b7280',
    }));
  }, [workStats]);

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilter(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  // Calculate velocity metrics
  const completedCount = stats.byStatus['Completed'] || 0;
  const inProgressCount = stats.byStatus['In Progress'] || 0;
  const readyForReviewCount = stats.byStatus['Ready for Review'] || 0;
  const blockedCount = stats.byStatus['Blocked'] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-teal-500/10 border-teal-500/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <span className="text-3xl">📉</span>
              Ticket Burndown
            </h2>
            <p className="text-gray-400">Track progress and estimate completion</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'chart' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              📊 Charts
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'cards' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              🎫 Cards
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xs text-gray-400">Open Tickets</span>
          </div>
          <div className="text-3xl font-bold text-white">{workStats.totalOpen}</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xs text-gray-400">Work Points</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">{workStats.totalPoints}</div>
          <div className="text-xs text-gray-500 mt-1">Weighted by priority</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-xs text-gray-400">Completed</span>
          </div>
          <div className="text-3xl font-bold text-teal-400">{completedCount}</div>
          <div className="text-xs text-gray-500 mt-1">{Math.round((completedCount / stats.total) * 100)}% complete</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🚀</span>
            <span className="text-xs text-gray-400">Ready for Release</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">{readyForReviewCount}</div>
          <div className="text-xs text-gray-500 mt-1">+{inProgressCount} in progress</div>
        </div>
      </div>

      {/* Priority Breakdown - Clickable Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['Critical', 'High', 'Medium', 'Low'].map(priority => {
          const data = workStats.byPriority[priority] || { count: 0, points: 0 };
          const colors = PRIORITY_COLORS[priority];
          const isFiltered = priorityFilter.includes(priority);

          return (
            <button
              key={priority}
              onClick={() => togglePriorityFilter(priority)}
              className={`${colors.bg} rounded-xl p-4 border-2 ${
                isFiltered ? colors.border : 'border-transparent'
              } hover:border-white/20 transition-all text-left`}
            >
              <div className={`text-xs ${colors.text} font-semibold mb-1`}>{priority}</div>
              <div className="text-2xl font-bold text-white">{data.count}</div>
              <div className="text-xs text-gray-400">{data.points} points</div>
            </button>
          );
        })}
      </div>

      {viewMode === 'chart' ? (
        <>
          {/* Burndown Chart */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-6">Burndown Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={burndownData}>
                <defs>
                  <linearGradient id="remainingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2234',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ideal"
                  stroke="#6b7280"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  name="Ideal"
                />
                <Area
                  type="monotone"
                  dataKey="remaining"
                  stroke="#ef4444"
                  fill="url(#remainingGrad)"
                  name="Remaining"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#22c55e"
                  fill="url(#completedGrad)"
                  name="Completed"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Priority & Status Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-6">Work Points by Priority</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a2234',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#ffffff',
                    }}
                  />
                  <Bar dataKey="points" name="Work Points" radius={[8, 8, 0, 0]}>
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-6">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#cbd5e1" />
                  <YAxis dataKey="name" type="category" stroke="#cbd5e1" width={120} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a2234',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#ffffff',
                    }}
                  />
                  <Bar dataKey="value" name="Tickets" radius={[0, 8, 8, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        /* Cards View */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Open Tickets by Priority</h3>
              <p className="text-sm text-gray-400">
                {priorityFilter.length > 0
                  ? `Filtered: ${priorityFilter.join(', ')}`
                  : 'Click priority cards above to filter'}
              </p>
            </div>
            <div className="text-sm text-gray-400">{openTickets.length} tickets</div>
          </div>

          {/* Ticket Cards Grid */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {openTickets.slice(0, 50).map(ticket => {
              const colors = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.Low;

              return (
                <div
                  key={ticket.id}
                  className={`${colors.bg} rounded-lg p-4 border ${colors.border} hover:bg-white/5 transition-colors`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <TicketLink ticketId={ticket.id} className="text-sm font-mono shrink-0" showIcon />
                        <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          ticket.status === 'Blocked' ? 'bg-red-500/20 text-red-400' :
                          ticket.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                          ticket.status === 'Ready for Review' ? 'bg-teal-500/20 text-teal-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-white mb-2" title={ticket.title}>
                        {ticket.title.length > 80 ? ticket.title.substring(0, 80) + '...' : ticket.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                        <span>👤 {ticket.assignee}</span>
                        <span>📅 {new Date(ticket.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        {ticket.state && <span className="text-amber-400">ADO: {ticket.state}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-lg font-bold ${colors.text}`}>
                        {PRIORITY_POINTS[ticket.priority] || 1}
                      </div>
                      <div className="text-xs text-gray-500">pts</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {openTickets.length > 50 && (
              <div className="text-center py-4 text-sm text-gray-500">
                Showing 50 of {openTickets.length} tickets
              </div>
            )}

            {openTickets.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl mb-4 block">✅</span>
                <p>No open tickets matching the filter!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
