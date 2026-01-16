'use client';

import { tickets, type Ticket, type Priority, type Status } from '@/lib/data';
import { useState } from 'react';

export default function TicketGrid() {
  const [sortField, setSortField] = useState<keyof Ticket>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tickets
  let filteredTickets = tickets.filter(ticket => {
    const matchesPriority = filterPriority === 'All' || ticket.priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesPriority && matchesStatus && matchesSearch;
  });

  // Sort tickets
  filteredTickets = [...filteredTickets].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const handleSort = (field: keyof Ticket) => {
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets..."
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              <th className="text-left py-3 px-4">
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
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Category
                  {sortField === 'category' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Assignee
                  {sortField === 'assignee' && (
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
                <button
                  onClick={() => handleSort('targetDate')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Target
                  {sortField === 'targetDate' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-semibold text-gray-300">Effort</span>
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
                  <span className="font-mono text-sm text-gray-400">{ticket.id}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="max-w-xs">
                    <div className="font-medium text-white mb-1">{ticket.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{ticket.description}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-300">{ticket.status}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-400">{ticket.category}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-300">{ticket.assignee}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-400">
                    {new Date(ticket.createdDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-400">
                    {new Date(ticket.targetDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-400">{ticket.estimatedEffort}</span>
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
