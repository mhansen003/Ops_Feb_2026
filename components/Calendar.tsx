'use client';

import { type Ticket } from '@/lib/data-client';
import { useState } from 'react';

interface CalendarProps {
  tickets: Ticket[];
}

export default function Calendar({ tickets }: CalendarProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(0);

  const today = new Date();

  // Generate next 8 Wednesdays as release dates
  const getNextWednesdays = (count: number): Date[] => {
    const wednesdays: Date[] = [];
    const current = new Date(today);

    // Find the next Wednesday
    while (current.getDay() !== 3) {
      current.setDate(current.getDate() + 1);
    }

    for (let i = 0; i < count; i++) {
      wednesdays.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    return wednesdays;
  };

  const releaseWednesdays = getNextWednesdays(8);

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

  return (
    <div className="space-y-6">
      {/* Release Schedule Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Wednesday Release Schedule</h2>
            <p className="text-gray-400 mt-1">Releases occur every Wednesday</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-400">{readyForRelease.length}</div>
            <div className="text-sm text-gray-400">Ready for Release</div>
          </div>
        </div>

        {/* Upcoming Releases Timeline */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {releaseWednesdays.map((wednesday, index) => {
              const isNextRelease = index === 0;
              const daysUntil = Math.ceil((wednesday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <button
                  key={index}
                  onClick={() => setSelectedWeek(index)}
                  className={`flex-shrink-0 p-4 rounded-lg border-2 transition-all ${
                    selectedWeek === index
                      ? 'border-blue-500 bg-blue-500/20'
                      : isNextRelease
                      ? 'border-green-500/50 bg-green-500/10 hover:border-green-500'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-lg font-bold ${isNextRelease ? 'text-green-400' : 'text-white'}`}>
                      {formatShortDate(wednesday)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                    </div>
                    {isNextRelease && (
                      <div className="mt-2 text-xs px-2 py-1 bg-green-500/30 text-green-300 rounded">
                        Next Release
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
          color="bg-purple-500"
          description="Scheduled for release"
        />
        <PipelineCard
          title="Ready to Release"
          count={readyToReleaseWithClear.length}
          color="bg-green-500"
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
          color="bg-blue-500"
          description="Testing in progress"
        />
        <PipelineCard
          title="In Dev"
          count={inDev.length}
          color="bg-amber-500"
          description="Development active"
        />
      </div>

      {/* Selected Release Week Details */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">
          Release: {formatDate(releaseWednesdays[selectedWeek])}
        </h3>

        {selectedWeek === 0 ? (
          <>
            <p className="text-gray-400 mb-4">
              Items ready for the next Wednesday release:
            </p>

            {/* Ready for Release Items */}
            {readyForRelease.length > 0 ? (
              <div className="space-y-3">
                {readyForRelease.map(ticket => (
                  <div
                    key={ticket.id}
                    className="p-4 bg-green-500/10 rounded-lg border border-green-500/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-gray-400">{ticket.id}</span>
                          <span className={`badge badge-${ticket.priority.toLowerCase()}`}>
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-blue-400">{ticket.state}</span>
                        </div>
                        <h4 className="font-semibold text-white mb-1">{ticket.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>👤 {ticket.assignee}</span>
                          <span>📅 Created: {ticket.createdDate}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Ready
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No items currently ready for release
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Future release window</p>
            <p className="text-sm mt-2">Items currently in progress may be ready by this date</p>
          </div>
        )}
      </div>

      {/* In Progress - Coming Soon */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          ⚡ In Progress ({inProgress.length})
          <span className="text-sm font-normal text-gray-400">- Potential upcoming releases</span>
        </h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {inProgress.slice(0, 15).map(ticket => (
            <div
              key={ticket.id}
              className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-400">{ticket.id}</span>
                    <span className={`badge badge-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-amber-400">{ticket.state}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{ticket.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>👤 {ticket.assignee}</span>
                    <span>📅 Created: {ticket.createdDate}</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  {ticket.status}
                </div>
              </div>
            </div>
          ))}
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
