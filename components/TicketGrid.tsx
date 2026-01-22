'use client';

import { type Ticket, type Priority, type Status } from '@/lib/data-client';
import { useState, useMemo } from 'react';
import { TicketLink } from './TicketLink';

interface TicketGridProps {
  tickets: Ticket[];
}

export default function TicketGrid({ tickets: initialTickets }: TicketGridProps) {
  const tickets = initialTickets;
  const [sortField, setSortField] = useState<keyof Ticket | 'sme'>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique assignees
  const assignees = useMemo(() => {
    const unique = [...new Set(tickets.map(t => t.assignee).filter(Boolean))].sort();
    return ['All', ...unique];
  }, [tickets]);

  // SME mapping - For this context, SME (Subject Matter Expert) is the assigned developer
  const getSME = (ticket: Ticket): string => {
    return ticket.assignee || 'Unassigned';
  };

  // Filter tickets
  let filteredTickets = tickets.filter(ticket => {
    const matchesPriority = filterPriority === 'All' || ticket.priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
    const matchesAssignee = filterAssignee === 'All' || ticket.assignee === filterAssignee;
    const matchesSearch = searchTerm === '' ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.state && ticket.state.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesPriority && matchesStatus && matchesAssignee && matchesSearch;
  });

  // Sort tickets
  filteredTickets = [...filteredTickets].sort((a, b) => {
    // Special handling for priority - use custom order
    if (sortField === 'priority') {
      const priorityOrder = ['Critical', 'High', 'Medium', 'Low'];
      const aIdx = priorityOrder.indexOf(a.priority);
      const bIdx = priorityOrder.indexOf(b.priority);
      return sortDirection === 'asc' ? aIdx - bIdx : bIdx - aIdx;
    }

    let aValue: string;
    let bValue: string;

    if (sortField === 'sme') {
      aValue = getSME(a);
      bValue = getSME(b);
    } else {
      aValue = String(a[sortField] || '');
      bValue = String(b[sortField] || '');
    }

    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handleSort = (field: keyof Ticket | 'sme') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Ticket Grid</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets..."
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Assignee</label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {assignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | 'All')}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Status | 'All')}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Ready for Review">Ready for Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      </div>

      {/* Ticket Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  ID
                  {sortField === 'id' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4 min-w-[300px]">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Title
                  {sortField === 'title' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Priority
                  {sortField === 'priority' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Status
                  {sortField === 'status' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Assigned
                  {sortField === 'assignee' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('sme')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  SME
                  {sortField === 'sme' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('createdDate')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Created
                  {sortField === 'createdDate' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-semibold text-gray-300">ADO State</span>
              </th>
              <th className="text-left py-3 px-4 min-w-[300px]">
                <span className="text-sm font-semibold text-gray-300">🤖 AI Recommendation</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <TicketLink ticketId={ticket.id} className="font-mono text-sm" />
                </td>
                <td className="py-4 px-4">
                  <div className="max-w-md">
                    <div className="font-medium text-white mb-1">{ticket.title}</div>
                    {ticket.workItemType && (
                      <span className="text-xs text-gray-500">{ticket.workItemType}</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-sm px-2 py-1 rounded ${
                    ticket.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                    ticket.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                    ticket.status === 'Ready for Review' ? 'bg-teal-500/20 text-teal-400' :
                    ticket.status === 'Blocked' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-300">{ticket.assignee}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-blue-400">{getSME(ticket)}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-400">
                    {new Date(ticket.createdDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs text-amber-400">{ticket.state}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="max-w-sm">
                    <span className={`text-xs leading-relaxed ${
                      ticket.aiRecommendation?.includes('🚨') ? 'text-rose-400' :
                      ticket.aiRecommendation?.includes('⚠️') ? 'text-amber-400' :
                      ticket.aiRecommendation?.includes('✅') ? 'text-green-400' :
                      ticket.aiRecommendation?.includes('⏸️') ? 'text-purple-400' :
                      ticket.aiRecommendation?.includes('🔴') ? 'text-red-400' :
                      ticket.aiRecommendation?.includes('🧪') ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {ticket.aiRecommendation || 'No recommendation'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No tickets match your filters
          </div>
        )}
      </div>
    </div>
  );
}
