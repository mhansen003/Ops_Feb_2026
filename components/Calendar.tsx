'use client';

import { type Ticket } from '@/lib/data-client';
import { useState } from 'react';

interface CalendarProps {
  tickets: Ticket[];
}

type HeatmapMode = 'created' | 'due' | 'both';

export default function Calendar({ tickets }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mode, setMode] = useState<HeatmapMode>('both');

  // Group tickets by created date
  const ticketsByCreatedDate = tickets.reduce((acc, ticket) => {
    const date = ticket.createdDate.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(ticket);
    return acc;
  }, {} as Record<string, typeof tickets>);

  // Group tickets by target/due date
  const ticketsByDueDate = tickets.reduce((acc, ticket) => {
    const date = ticket.targetDate.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(ticket);
    return acc;
  }, {} as Record<string, typeof tickets>);

  // Get date range (last 90 days)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 90);
  const endDate = new Date(today);

  // Generate all dates in range
  const allDates: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    allDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get intensity for heatmap
  const getIntensity = (date: string, type: 'created' | 'due') => {
    const todayStr = formatDate(today);
    const dateObj = new Date(date);
    const isPast = dateObj < today;
    const isFuture = dateObj > today;

    const count = type === 'created'
      ? (ticketsByCreatedDate[date]?.length || 0)
      : (ticketsByDueDate[date]?.length || 0);

    if (count === 0) return 'bg-gray-800/30';

    if (type === 'created') {
      // Blue for created tickets
      if (count === 1) return 'bg-blue-500/30';
      if (count === 2) return 'bg-blue-500/60';
      if (count >= 3) return 'bg-blue-500/90';
    } else {
      // Due dates - color coded by urgency
      const daysUntilDue = Math.floor((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDue < 0) {
        // Overdue - red
        if (count === 1) return 'bg-rose-500/40';
        if (count === 2) return 'bg-rose-500/70';
        if (count >= 3) return 'bg-rose-500/100';
      } else if (daysUntilDue <= 7) {
        // Due within 7 days - orange
        if (count === 1) return 'bg-amber-500/40';
        if (count === 2) return 'bg-amber-500/70';
        if (count >= 3) return 'bg-amber-500/100';
      } else if (daysUntilDue <= 14) {
        // Due within 14 days - yellow
        if (count === 1) return 'bg-yellow-500/30';
        if (count === 2) return 'bg-yellow-500/60';
        if (count >= 3) return 'bg-yellow-500/90';
      } else {
        // Future - teal
        if (count === 1) return 'bg-teal-500/30';
        if (count === 2) return 'bg-teal-500/60';
        if (count >= 3) return 'bg-teal-500/90';
      }
    }

    return 'bg-gray-800/30';
  };

  // Get combined intensity for both mode
  const getCombinedIntensity = (date: string) => {
    const created = ticketsByCreatedDate[date]?.length || 0;
    const due = ticketsByDueDate[date]?.length || 0;
    const total = created + due;

    if (total === 0) return 'bg-gray-800/30';
    if (total === 1) return 'bg-purple-500/30';
    if (total === 2) return 'bg-purple-500/60';
    return 'bg-purple-500/90';
  };

  const selectedCreatedTickets = selectedDate ? ticketsByCreatedDate[selectedDate] || [] : [];
  const selectedDueTickets = selectedDate ? ticketsByDueDate[selectedDate] || [] : [];

  // Group dates by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Include all dates from the start, not just from first Sunday
  for (let i = 0; i < allDates.length; i++) {
    const date = allDates[i];

    // Start a new week on Sunday (unless it's the very first week)
    if (date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }

    currentWeek.push(date);

    // Close the week on Saturday or at the end
    if (date.getDay() === 6 || i === allDates.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }

  // Calculate upcoming due tickets
  const upcomingDueTickets = tickets.filter(t => {
    const dueDate = new Date(t.targetDate);
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 14;
  }).sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

  const overdueTickets = tickets.filter(t => new Date(t.targetDate) < today);

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Ticket Timeline Heatmap</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('created')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'created'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              📅 Created Dates
            </button>
            <button
              onClick={() => setMode('due')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'due'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              ⏰ Due Dates
            </button>
            <button
              onClick={() => setMode('both')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'both'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🔀 Both
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/50 rounded-lg">
          {mode === 'created' && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">Tickets Created:</span>
              <div className="flex gap-2 items-center">
                <div className="w-4 h-4 rounded bg-gray-800/30"></div>
                <span className="text-xs text-gray-500">0</span>
                <div className="w-4 h-4 rounded bg-blue-500/30"></div>
                <span className="text-xs text-gray-500">1</span>
                <div className="w-4 h-4 rounded bg-blue-500/60"></div>
                <span className="text-xs text-gray-500">2</span>
                <div className="w-4 h-4 rounded bg-blue-500/90"></div>
                <span className="text-xs text-gray-500">3+</span>
              </div>
            </div>
          )}
          {mode === 'due' && (
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-rose-500/70"></div>
                <span className="text-xs text-gray-400">Overdue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500/70"></div>
                <span className="text-xs text-gray-400">Due ≤ 7 days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500/60"></div>
                <span className="text-xs text-gray-400">Due ≤ 14 days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-teal-500/60"></div>
                <span className="text-xs text-gray-400">Future</span>
              </div>
            </div>
          )}
          {mode === 'both' && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">Combined Activity:</span>
              <div className="flex gap-2 items-center">
                <div className="w-4 h-4 rounded bg-gray-800/30"></div>
                <span className="text-xs text-gray-500">0</span>
                <div className="w-4 h-4 rounded bg-purple-500/30"></div>
                <span className="text-xs text-gray-500">1</span>
                <div className="w-4 h-4 rounded bg-purple-500/60"></div>
                <span className="text-xs text-gray-500">2</span>
                <div className="w-4 h-4 rounded bg-purple-500/90"></div>
                <span className="text-xs text-gray-500">3+</span>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Day Labels */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-2 text-xs text-gray-400 justify-around py-1 w-16">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Heatmap Grid */}
              <div className="flex gap-2">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                      const date = week.find(d => d.getDay() === dayOfWeek);
                      if (!date) {
                        return <div key={dayOfWeek} className="w-6 h-6"></div>;
                      }
                      const dateStr = formatDate(date);
                      const createdCount = ticketsByCreatedDate[dateStr]?.length || 0;
                      const dueCount = ticketsByDueDate[dateStr]?.length || 0;

                      let intensity;
                      if (mode === 'created') {
                        intensity = getIntensity(dateStr, 'created');
                      } else if (mode === 'due') {
                        intensity = getIntensity(dateStr, 'due');
                      } else {
                        intensity = getCombinedIntensity(dateStr);
                      }

                      const tooltip = mode === 'both'
                        ? `${date.toLocaleDateString()}\n📅 ${createdCount} created\n⏰ ${dueCount} due`
                        : mode === 'created'
                        ? `${date.toLocaleDateString()}: ${createdCount} created`
                        : `${date.toLocaleDateString()}: ${dueCount} due`;

                      return (
                        <div
                          key={dayOfWeek}
                          className={`w-6 h-6 rounded cursor-pointer transition-all hover:ring-2 hover:ring-teal-400 ${intensity} ${
                            selectedDate === dateStr ? 'ring-2 ring-blue-400' : ''
                          }`}
                          onClick={() => setSelectedDate(dateStr)}
                          title={tooltip}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatBox
            label="Total Active Tickets"
            value={tickets.length}
            color="text-blue-400"
          />
          <StatBox
            label="Overdue Items"
            value={overdueTickets.length}
            color="text-rose-400"
          />
          <StatBox
            label="Due Next 2 Weeks"
            value={upcomingDueTickets.length}
            color="text-amber-400"
          />
          <StatBox
            label="Unique Assignees"
            value={new Set(tickets.map(t => t.assignee)).size}
            color="text-teal-400"
          />
        </div>
      </div>

      {/* Upcoming Due Items */}
      {upcomingDueTickets.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ⏰ Upcoming Due Items (Next 14 Days)
          </h3>
          <div className="space-y-3">
            {upcomingDueTickets.slice(0, 10).map(ticket => {
              const dueDate = new Date(ticket.targetDate);
              const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={ticket.id}
                  className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-amber-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-400">{ticket.id}</span>
                      <span className={`badge badge-${ticket.priority.toLowerCase()}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      daysUntilDue <= 3 ? 'bg-rose-500/20 text-rose-400' :
                      daysUntilDue <= 7 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{ticket.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>👤 {ticket.assignee}</span>
                    <span>📅 Due: {dueDate.toLocaleDateString()}</span>
                    <span>🏷️ {ticket.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overdue Items */}
      {overdueTickets.length > 0 && (
        <div className="card border-2 border-rose-500/30">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-rose-400">
            🚨 Overdue Items ({overdueTickets.length})
          </h3>
          <div className="space-y-3">
            {overdueTickets.slice(0, 10).map(ticket => {
              const dueDate = new Date(ticket.targetDate);
              const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={ticket.id}
                  className="p-4 bg-rose-500/10 rounded-lg border-l-4 border-rose-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-400">{ticket.id}</span>
                      <span className={`badge badge-${ticket.priority.toLowerCase()}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-rose-500/30 text-rose-300">
                      {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{ticket.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>👤 {ticket.assignee}</span>
                    <span>📅 Was due: {dueDate.toLocaleDateString()}</span>
                    <span>🏷️ {ticket.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Date Details */}
      {selectedDate && (selectedCreatedTickets.length > 0 || selectedDueTickets.length > 0) && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">
            Details for {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>

          {selectedCreatedTickets.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-blue-400 mb-3">
                📅 Tickets Created ({selectedCreatedTickets.length})
              </h4>
              <div className="space-y-2">
                {selectedCreatedTickets.map(ticket => (
                  <div key={`created-${ticket.id}`} className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <div className="text-sm font-medium text-white">{ticket.id}: {ticket.title}</div>
                    <div className="text-xs text-gray-400 mt-1">👤 {ticket.assignee} • 🏷️ {ticket.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDueTickets.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-teal-400 mb-3">
                ⏰ Tickets Due ({selectedDueTickets.length})
              </h4>
              <div className="space-y-2">
                {selectedDueTickets.map(ticket => (
                  <div key={`due-${ticket.id}`} className="p-3 bg-teal-500/10 rounded-lg border border-teal-500/30">
                    <div className="text-sm font-medium text-white">{ticket.id}: {ticket.title}</div>
                    <div className="text-xs text-gray-400 mt-1">👤 {ticket.assignee} • 🏷️ {ticket.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  color: string;
}

function StatBox({ label, value, color }: StatBoxProps) {
  return (
    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}
