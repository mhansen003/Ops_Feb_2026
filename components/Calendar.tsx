'use client';

import { type Ticket } from '@/lib/data-client';
import { useState } from 'react';

interface CalendarProps {
  tickets: Ticket[];
}

export default function Calendar({ tickets }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group tickets by date
  const ticketsByDate = tickets.reduce((acc, ticket) => {
    const date = ticket.createdDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(ticket);
    return acc;
  }, {} as Record<string, typeof tickets>);

  // Get date range
  const dates = Object.keys(ticketsByDate).sort();
  const startDate = new Date(dates[0]);
  const endDate = new Date();

  // Generate all dates in range
  const allDates: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    allDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get intensity for heatmap
  const getIntensity = (date: string) => {
    const count = ticketsByDate[date]?.length || 0;
    if (count === 0) return 'bg-gray-800/30';
    if (count === 1) return 'bg-teal-500/30';
    if (count === 2) return 'bg-teal-500/60';
    if (count >= 3) return 'bg-teal-500/90';
    return 'bg-gray-800/30';
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedTickets = selectedDate ? ticketsByDate[selectedDate] || [] : [];

  // Group dates by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  allDates.forEach((date, index) => {
    currentWeek.push(date);
    if (date.getDay() === 6 || index === allDates.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Ticket Creation Heatmap</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-gray-800/30"></div>
              <div className="w-4 h-4 rounded bg-teal-500/30"></div>
              <div className="w-4 h-4 rounded bg-teal-500/60"></div>
              <div className="w-4 h-4 rounded bg-teal-500/90"></div>
            </div>
            <span className="text-gray-400">More</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month Labels */}
            <div className="flex gap-1 mb-2 ml-12">
              {['Jan', 'Feb', 'Mar'].map(month => (
                <div key={month} className="text-xs text-gray-400 font-medium w-20">
                  {month}
                </div>
              ))}
            </div>

            {/* Day Labels */}
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 text-xs text-gray-400 justify-around py-1">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Heatmap Grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                      const date = week.find(d => d.getDay() === dayOfWeek);
                      if (!date) {
                        return <div key={dayOfWeek} className="w-3 h-3"></div>;
                      }
                      const dateStr = formatDate(date);
                      const count = ticketsByDate[dateStr]?.length || 0;

                      return (
                        <div
                          key={dayOfWeek}
                          className={`w-3 h-3 rounded cursor-pointer transition-all hover:ring-2 hover:ring-teal-400 ${getIntensity(dateStr)} ${
                            selectedDate === dateStr ? 'ring-2 ring-blue-400' : ''
                          }`}
                          onClick={() => setSelectedDate(dateStr)}
                          title={`${date.toLocaleDateString()}: ${count} ticket${count !== 1 ? 's' : ''}`}
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
            label="Total Tickets Created"
            value={tickets.length}
            color="text-blue-400"
          />
          <StatBox
            label="Busiest Day"
            value={Object.entries(ticketsByDate)
              .sort((a, b) => b[1].length - a[1].length)[0]?.[1]?.length || 0}
            color="text-teal-400"
          />
          <StatBox
            label="Average per Day"
            value={(tickets.length / allDates.length).toFixed(1)}
            color="text-purple-400"
          />
          <StatBox
            label="Days with Activity"
            value={Object.keys(ticketsByDate).length}
            color="text-amber-400"
          />
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedTickets.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">
            Tickets Created on {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <div className="space-y-3">
            {selectedTickets.map(ticket => (
              <div
                key={ticket.id}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-400">{ticket.id}</span>
                    <span className={`badge badge-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{ticket.category}</span>
                </div>
                <h4 className="font-semibold text-white mb-1">{ticket.title}</h4>
                <p className="text-sm text-gray-400 mb-2">{ticket.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>👤 {ticket.assignee}</span>
                  <span>📅 Target: {new Date(ticket.targetDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline View */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Timeline View</h3>
        <div className="space-y-4">
          {Object.entries(ticketsByDate)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 10)
            .map(([date, dateTickets]) => (
              <div key={date} className="flex gap-4">
                <div className="flex-shrink-0 w-32 text-sm text-gray-400 font-medium">
                  {new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <span className="text-sm font-semibold">
                      {dateTickets.length} ticket{dateTickets.length !== 1 ? 's' : ''} created
                    </span>
                  </div>
                  <div className="pl-5 space-y-1">
                    {dateTickets.map(ticket => (
                      <div key={ticket.id} className="text-sm text-gray-400">
                        • {ticket.id}: {ticket.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
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
