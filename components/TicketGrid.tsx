'use client';

import { type Ticket, type Priority, type Status } from '@/lib/data-client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { TicketLink } from './TicketLink';

interface TicketGridProps {
  tickets: Ticket[];
}

// Multi-select dropdown component
interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

function MultiSelect({ label, options, selected, onChange, placeholder = 'All' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectAll = () => {
    onChange([...options]);
  };

  const displayText = selected.length === 0
    ? placeholder
    : selected.length === 1
    ? selected[0]
    : `${selected.length} selected`;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className={selected.length === 0 ? 'text-gray-500' : 'text-white'}>
          {displayText}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {/* Quick actions */}
          <div className="flex gap-2 p-2 border-b border-gray-700">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Options */}
          <div className="p-2 space-y-1">
            {options.map(option => (
              <label
                key={option}
                className="flex items-center gap-3 px-2 py-2 rounded cursor-pointer hover:bg-gray-700/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-200">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TicketGrid({ tickets: initialTickets }: TicketGridProps) {
  const tickets = initialTickets;
  const [sortField, setSortField] = useState<keyof Ticket | 'sme' | 'stackRank'>('stackRank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterPriorities, setFilterPriorities] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterAssignees, setFilterAssignees] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique values for filters
  const assigneeOptions = useMemo(() => {
    return [...new Set(tickets.map(t => t.assignee).filter(Boolean))].sort();
  }, [tickets]);

  const priorityOptions: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
  const statusOptions: Status[] = ['New', 'In Progress', 'Blocked', 'Ready for Review', 'Completed'];

  // SME mapping
  const getSME = (ticket: Ticket): string => {
    return ticket.assignee || 'Unassigned';
  };

  // Filter tickets
  let filteredTickets = tickets.filter(ticket => {
    const matchesPriority = filterPriorities.length === 0 || filterPriorities.includes(ticket.priority);
    const matchesStatus = filterStatuses.length === 0 || filterStatuses.includes(ticket.status);
    const matchesAssignee = filterAssignees.length === 0 || filterAssignees.includes(ticket.assignee);
    const matchesSearch = searchTerm === '' ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.state && ticket.state.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesPriority && matchesStatus && matchesAssignee && matchesSearch;
  });

  // Helper to get numeric rank for sorting
  const getNumericRank = (ticket: Ticket): number => {
    const rank = ticket.priorityRankWithinTier;
    if (!rank || rank === 'Unranked') return 999; // Unranked goes last
    const num = parseInt(rank, 10);
    return isNaN(num) ? 999 : num;
  };

  // Sort tickets
  filteredTickets = [...filteredTickets].sort((a, b) => {
    // Stack Rank sort: priority first, then rank within tier
    if (sortField === 'stackRank') {
      const priorityOrder = ['Critical', 'High', 'Medium', 'Low'];
      const aPriorityIdx = priorityOrder.indexOf(a.priority);
      const bPriorityIdx = priorityOrder.indexOf(b.priority);

      if (aPriorityIdx !== bPriorityIdx) {
        return sortDirection === 'asc' ? aPriorityIdx - bPriorityIdx : bPriorityIdx - aPriorityIdx;
      }

      // Same priority, sort by rank within tier
      const aRank = getNumericRank(a);
      const bRank = getNumericRank(b);
      return sortDirection === 'asc' ? aRank - bRank : bRank - aRank;
    }

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

  const handleSort = (field: keyof Ticket | 'sme' | 'stackRank') => {
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

  // Count active filters
  const activeFilterCount = filterPriorities.length + filterStatuses.length + filterAssignees.length;

  const clearAllFilters = () => {
    setFilterPriorities([]);
    setFilterStatuses([]);
    setFilterAssignees([]);
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Ticket Grid</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <span>Clear all filters</span>
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            </button>
          )}
        </div>

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

          {/* Assignee Filter - Multi-select */}
          <MultiSelect
            label="Assignee"
            options={assigneeOptions}
            selected={filterAssignees}
            onChange={setFilterAssignees}
            placeholder="All Assignees"
          />

          {/* Priority Filter - Multi-select */}
          <MultiSelect
            label="Priority"
            options={priorityOptions}
            selected={filterPriorities}
            onChange={setFilterPriorities}
            placeholder="All Priorities"
          />

          {/* Status Filter - Multi-select */}
          <MultiSelect
            label="Status"
            options={statusOptions}
            selected={filterStatuses}
            onChange={setFilterStatuses}
            placeholder="All Statuses"
          />
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filterPriorities.map(p => (
              <span key={p} className="inline-flex items-center gap-1 px-2 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-full">
                {p}
                <button onClick={() => setFilterPriorities(filterPriorities.filter(x => x !== p))} className="hover:text-white">×</button>
              </span>
            ))}
            {filterStatuses.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {s}
                <button onClick={() => setFilterStatuses(filterStatuses.filter(x => x !== s))} className="hover:text-white">×</button>
              </span>
            ))}
            {filterAssignees.map(a => (
              <span key={a} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                {a}
                <button onClick={() => setFilterAssignees(filterAssignees.filter(x => x !== a))} className="hover:text-white">×</button>
              </span>
            ))}
          </div>
        )}

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
                  onClick={() => handleSort('stackRank')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Stack Rank
                  {sortField === 'stackRank' && (
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
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      ticket.priorityRankWithinTier === '0' ? 'text-green-400' :
                      ticket.priorityRankWithinTier === 'Unranked' ? 'text-gray-500' :
                      'text-white'
                    }`}>
                      {ticket.priorityRankWithinTier || '-'}
                    </span>
                    {ticket.priorityRankWithinTier === '0' && (
                      <span className="text-xs text-green-400" title="Near finish line">🏁</span>
                    )}
                  </div>
                  {ticket.explanation && (
                    <div className="text-xs text-amber-400/80 mt-1 max-w-[150px] truncate" title={ticket.explanation}>
                      💬 {ticket.explanation}
                    </div>
                  )}
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
