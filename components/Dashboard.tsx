'use client';

import { type Ticket, type TicketStats } from '@/lib/data-client';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  tickets: Ticket[];
  stats: TicketStats;
}

export default function Dashboard({ tickets, stats }: DashboardProps) {

  const priorityData = [
    { name: 'Critical', value: stats.byPriority.Critical, color: '#f43f5e' },
    { name: 'High', value: stats.byPriority.High, color: '#f59e0b' },
    { name: 'Medium', value: stats.byPriority.Medium, color: '#3b82f6' },
    { name: 'Low', value: stats.byPriority.Low, color: '#14b8a6' },
  ];

  const categoryData = Object.entries(stats.byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#f43f5e', '#a855f7', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tickets"
          value={stats.total}
          icon="🎫"
          gradient="from-blue-500 to-teal-500"
        />
        <MetricCard
          title="Critical Priority"
          value={stats.byPriority.Critical}
          icon="🔴"
          gradient="from-rose-500 to-pink-500"
        />
        <MetricCard
          title="In Progress"
          value={stats.byStatus['In Progress']}
          icon="⚡"
          gradient="from-amber-500 to-orange-500"
        />
        <MetricCard
          title="Blocked"
          value={stats.byStatus.Blocked}
          icon="🚫"
          gradient="from-purple-500 to-indigo-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2234',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Overview */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2234',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card lg:col-span-2">
          <h3 className="text-xl font-semibold mb-6">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#cbd5e1" />
              <YAxis dataKey="name" type="category" stroke="#cbd5e1" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2234',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High Priority Items */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Critical & High Priority Items</h3>
        <div className="space-y-3">
          {tickets
            .filter(t => t.priority === 'Critical' || t.priority === 'High')
            .sort((a, b) => {
              if (a.priority === 'Critical' && b.priority !== 'Critical') return -1;
              if (a.priority !== 'Critical' && b.priority === 'Critical') return 1;
              return 0;
            })
            .map(ticket => (
              <div
                key={ticket.id}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-400">{ticket.id}</span>
                      <span className={`badge ${
                        ticket.priority === 'Critical' ? 'badge-critical' : 'badge-high'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-500">{ticket.category}</span>
                    </div>
                    <h4 className="font-semibold text-white mb-1">{ticket.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>👤 {ticket.assignee}</span>
                      <span>📅 Target: {new Date(ticket.targetDate).toLocaleDateString()}</span>
                      <span>⏱️ {ticket.estimatedEffort}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'Blocked' ? 'bg-red-500/20 text-red-400' :
                    ticket.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                    ticket.status === 'Ready for Review' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ticket.status}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  gradient: string;
}

function MetricCard({ title, value, icon, gradient }: MetricCardProps) {
  return (
    <div className="card group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
        <div className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {value}
        </div>
      </div>
      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
    </div>
  );
}
