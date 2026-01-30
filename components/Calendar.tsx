'use client';

import { type Ticket } from '@/lib/data-client';
import { useState } from 'react';
import { TicketLink } from './TicketLink';

interface CalendarProps {
  tickets: Ticket[];
}

export default function Calendar({ tickets }: CalendarProps) {
  const [selectedSprint, setSelectedSprint] = useState<number>(0);

  const today = new Date();

  // Generate next 4 sprint end dates (3-week sprints, ending on Wednesday)
  const getSprintEndDates = (count: number): Date[] => {
    const sprintEnds: Date[] = [];
    const current = new Date(today);

    // Find the next Wednesday
    while (current.getDay() !== 3) {
      current.setDate(current.getDate() + 1);
    }

    for (let i = 0; i < count; i++) {
      sprintEnds.push(new Date(current));
      current.setDate(current.getDate() + 21); // 3-week sprints
    }

    return sprintEnds;
  };

  const sprintEndDates = getSprintEndDates(4);

  // Get tickets ready for release (Ready for Review status)
  const readyForRelease = tickets.filter(t => t.status === 'Ready for Review');

  // Get tickets in progress
  const inProgress = tickets.filter(t => t.status === 'In Progress');

  // Get tickets by state for more granular view
  const getTicketsByState = (state: string) => tickets.filter(t => t.state === state);

  // Specific ADO states for release tracking
  const tuesdayRelease = getTicketsByState('Tuesday Release');
  const readyToReleaseWithClear = getTicketsByState('Ready to Release with Clear');
  const readyForProd = getTicketsByState('Ready for Prod');
  const inQA = getTicketsByState('In QA');
  const inDev = getTicketsByState('In Dev');
  const bsaInProgress = getTicketsByState('BSA in Progress');

  // Simulate projected release sprint based on current state (adjusted for 3-week sprints)
  const getProjectedSprint = (ticket: Ticket): number => {
    // Estimate sprints until release based on ADO state
    const stateSprintEstimates: Record<string, number> = {
      'Tuesday Release': 0,
      'Ready for Prod': 0,
      'Ready to Release with Clear': 0,
      'In QA': 0,           // Current sprint
      'In Dev': 1,          // Next sprint
      'BSA in Progress': 1, // Next sprint
      'Gathering Requirements': 2,
      'Prioritized Backlog': 2,
      'Ready for Grooming': 2,
      'On Hold': 3,
      'MISC': 3,
      'New': 3,
    };

    return stateSprintEstimates[ticket.state || ''] ?? 3;
  };

  // Group tickets by projected sprint
  const ticketsBySprint = sprintEndDates.map((_, sprintIndex) => {
    return tickets.filter(t => {
      if (t.status === 'Completed') return false;
      const projectedSprint = getProjectedSprint(t);
      return projectedSprint === sprintIndex;
    });
  });

  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', dot: 'bg-amber-500' };
      case 'Medium': return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', dot: 'bg-blue-500' };
      case 'Low': return { bg: 'bg-teal-500/20', border: 'border-teal-500/50', text: 'text-teal-400', dot: 'bg-teal-500' };
      default: return { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', dot: 'bg-gray-500' };
    }
  };

  // Get color based on state
  const getStateColor = (state: string) => {
    switch (state) {
      case 'Tuesday Release':
      case 'Ready for Prod':
      case 'Ready to Release with Clear':
        return 'text-green-400 bg-green-500/20';
      case 'In QA':
        return 'text-purple-400 bg-purple-500/20';
      case 'In Dev':
        return 'text-blue-400 bg-blue-500/20';
      case 'BSA in Progress':
        return 'text-cyan-400 bg-cyan-500/20';
      case 'Gathering Requirements':
        return 'text-amber-400 bg-amber-500/20';
      case 'On Hold':
        return 'text-red-400 bg-red-500/20';
      case 'Prioritized Backlog':
      case 'Ready for Grooming':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate sprint start date (3 weeks before end)
  const getSprintStartDate = (endDate: Date) => {
    const start = new Date(endDate);
    start.setDate(start.getDate() - 20); // 3 weeks minus 1 day
    return start;
  };

  return (
    <div className="space-y-6">
      {/* Release Schedule Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">3-Week Sprint Schedule</h2>
            <p className="text-gray-400 mt-1">Sprint releases occur every 3 weeks on Wednesday</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-400">{readyForRelease.length}</div>
            <div className="text-sm text-gray-400">Ready for Release</div>
          </div>
        </div>

        {/* Upcoming Sprints Timeline */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {sprintEndDates.map((endDate, index) => {
              const isCurrentSprint = index === 0;
              const startDate = getSprintStartDate(endDate);
              const daysUntil = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const sprintTicketCount = ticketsBySprint[index]?.length || 0;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedSprint(index)}
                  className={`flex-shrink-0 p-4 rounded-lg border-2 transition-all min-w-[160px] ${
                    selectedSprint === index
                      ? 'border-blue-500 bg-blue-500/20'
                      : isCurrentSprint
                      ? 'border-green-500/50 bg-green-500/10 hover:border-green-500'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Sprint {index + 1}</div>
                    <div className={`text-sm font-bold ${isCurrentSprint ? 'text-green-400' : 'text-white'}`}>
                      {formatShortDate(startDate)} - {formatShortDate(endDate)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {daysUntil <= 0 ? 'Ending today!' : daysUntil === 1 ? '1 day left' : `${daysUntil} days left`}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className={`text-lg font-bold ${sprintTicketCount > 0 ? 'text-white' : 'text-gray-600'}`}>
                        {sprintTicketCount}
                      </span>
                      <span className="text-xs text-gray-500">items</span>
                    </div>
                    {isCurrentSprint && (
                      <div className="mt-2 text-xs px-2 py-1 bg-green-500/30 text-green-300 rounded">
                        Current Sprint
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Release Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <PipelineCard
          title="Tuesday Release"
          count={tuesdayRelease.length}
          color="bg-green-500"
          description="Shipping this release"
        />
        <PipelineCard
          title="Ready to Release"
          count={readyToReleaseWithClear.length}
          color="bg-emerald-500"
          description="Cleared and ready"
        />
        <PipelineCard
          title="Ready for Prod"
          count={readyForProd.length}
          color="bg-teal-500"
          description="Production ready"
        />
        <PipelineCard
          title="In QA"
          count={inQA.length}
          color="bg-purple-500"
          description="Testing in progress"
        />
        <PipelineCard
          title="In Dev"
          count={inDev.length}
          color="bg-blue-500"
          description="Development active"
        />
      </div>

      {/* Color Legend */}
      <div className="card">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Priority Color Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-gray-300">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-300">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500"></div>
            <span className="text-sm text-gray-300">Low</span>
          </div>
        </div>
      </div>

      {/* Selected Sprint Details */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            Sprint {selectedSprint + 1}: {formatShortDate(getSprintStartDate(sprintEndDates[selectedSprint]))} - {formatDate(sprintEndDates[selectedSprint])}
          </h3>
          {selectedSprint === 0 && (
            <span className="text-xs px-3 py-1 bg-green-500/30 text-green-300 rounded-full">
              Current Sprint
            </span>
          )}
        </div>

        {(() => {
          const sprintTickets = ticketsBySprint[selectedSprint] || [];
          const isCurrentSprint = selectedSprint === 0;

          // Sort by priority
          const sortedTickets = [...sprintTickets].sort((a, b) => {
            const priorityOrder = ['High', 'Medium', 'Low'];
            return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
          });

          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400">
                  {isCurrentSprint
                    ? `Items targeted for current sprint release (${sprintTickets.length} tickets):`
                    : `Projected items for Sprint ${selectedSprint + 1} (${sprintTickets.length} tickets):`}
                </p>
              </div>

              {sortedTickets.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {sortedTickets.map(ticket => {
                    const priorityColor = getPriorityColor(ticket.priority);
                    const stateColor = getStateColor(ticket.state || '');

                    return (
                      <div
                        key={ticket.id}
                        className={`p-4 rounded-lg border-l-4 ${priorityColor.bg} ${priorityColor.border} hover:brightness-110 transition-all`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-2 h-2 rounded-full ${priorityColor.dot}`}></div>
                              <TicketLink ticketId={ticket.id} className="text-sm font-mono" />
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priorityColor.bg} ${priorityColor.text}`}>
                                {ticket.priority}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${stateColor}`}>
                                {ticket.state}
                              </span>
                            </div>
                            <h4 className="font-semibold text-white mb-1">{ticket.title}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>👤 {ticket.assignee}</span>
                              <span>📅 {ticket.createdDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {isCurrentSprint
                    ? 'No items currently targeted for this sprint'
                    : 'No items projected for this sprint window'}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* In Progress - Coming Soon */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          ⚡ In Progress ({inProgress.length})
          <span className="text-sm font-normal text-gray-400">- Active development</span>
        </h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {inProgress.slice(0, 15).map(ticket => {
            const priorityColor = getPriorityColor(ticket.priority);
            const stateColor = getStateColor(ticket.state || '');

            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-lg border-l-4 ${priorityColor.bg} ${priorityColor.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2 h-2 rounded-full ${priorityColor.dot}`}></div>
                      <TicketLink ticketId={ticket.id} className="text-sm font-mono" />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priorityColor.bg} ${priorityColor.text}`}>
                        {ticket.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${stateColor}`}>
                        {ticket.state}
                      </span>
                    </div>
                    <h4 className="font-semibold text-white mb-1">{ticket.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>👤 {ticket.assignee}</span>
                      <span>📅 {ticket.createdDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {inProgress.length > 15 && (
            <p className="text-center text-gray-500 py-2">
              +{inProgress.length - 15} more items in progress
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface PipelineCardProps {
  title: string;
  count: number;
  color: string;
  description: string;
}

function PipelineCard({ title, count, color, description }: PipelineCardProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-sm font-medium text-gray-300">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{count}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}
