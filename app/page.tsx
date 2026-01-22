'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import Calendar from '@/components/Calendar';
import TicketGrid from '@/components/TicketGrid';
import CriticalQuestions from '@/components/CriticalQuestions';
import Burndown from '@/components/Burndown';
import Story from '@/components/Story';
import { fetchTickets, type Ticket, type TicketStats } from '@/lib/data-client';

type Tab = 'story' | 'dashboard' | 'calendar' | 'tickets' | 'questions' | 'burndown';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('story');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTickets();
      setTickets(data.tickets);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs = [
    { id: 'story' as Tab, label: 'Story', icon: '📖' },
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: '📊' },
    { id: 'burndown' as Tab, label: 'Burndown', icon: '📉' },
    { id: 'calendar' as Tab, label: 'Calendar', icon: '📅' },
    { id: 'tickets' as Tab, label: 'Ticket Grid', icon: '🎫' },
    { id: 'questions' as Tab, label: 'Critical Questions', icon: '❓' },
  ];

  return (
    <main className="min-h-screen">
      {/* Sticky Header + Tabs */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-8">
          {/* Header */}
          <header className="py-4 fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  Byte Backlog
                </h1>
                <p className="text-sm text-gray-400">
                  Stack Ranked - January 2026
                  {stats && <span className="ml-2">({stats.total} tickets)</span>}
                </p>
              </div>
            </div>
            {error && (
              <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
                ⚠️ Error: {error}
              </div>
            )}
          </header>

          {/* Tab Navigation */}
          <nav className="tab-nav slide-in pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        <div className="fade-in">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-400">Loading backlog data...</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="card text-center py-20">
              <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
              <p className="text-gray-400 mb-6">Backlog data is being loaded...</p>
            </div>
          ) : (
            <>
              {activeTab === 'story' && <Story tickets={tickets} stats={stats!} />}
              {activeTab === 'dashboard' && <Dashboard tickets={tickets} stats={stats!} />}
              {activeTab === 'burndown' && <Burndown tickets={tickets} stats={stats!} />}
              {activeTab === 'calendar' && <Calendar tickets={tickets} />}
              {activeTab === 'tickets' && <TicketGrid tickets={tickets} />}
              {activeTab === 'questions' && <CriticalQuestions tickets={tickets} stats={stats!} />}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
