'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import Calendar from '@/components/Calendar';
import TicketGrid from '@/components/TicketGrid';
import CriticalQuestions from '@/components/CriticalQuestions';
import Takeaways from '@/components/Takeaways';
import { fetchTickets, refreshData, type Ticket, type TicketStats } from '@/lib/data-client';

type Tab = 'dashboard' | 'calendar' | 'tickets' | 'questions' | 'takeaways';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const result = await refreshData();
      if (result.success) {
        await loadData();
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: '📊' },
    { id: 'calendar' as Tab, label: 'Calendar', icon: '📅' },
    { id: 'tickets' as Tab, label: 'Ticket Grid', icon: '🎫' },
    { id: 'questions' as Tab, label: 'Critical Questions', icon: '❓' },
    { id: 'takeaways' as Tab, label: 'Takeaways & Next Steps', icon: '🎯' },
  ];

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-8 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                Operations Backlog
              </h1>
              <p className="text-lg text-gray-400">
                Executive Operations Dashboard - February 2026
                {stats && <span className="ml-4 text-sm">({stats.total} tickets loaded)</span>}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                refreshing
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {refreshing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Refreshing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  🔄 Refresh from ADO
                </span>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              ⚠️ Error: {error}
            </div>
          )}
        </header>

        {/* Tab Navigation */}
        <nav className="tab-nav slide-in">
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

        {/* Content Area */}
        <div className="fade-in">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-400">Loading data from database...</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="card text-center py-20">
              <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
              <p className="text-gray-400 mb-6">Click "Refresh from ADO" to import tickets from Azure DevOps</p>
              <button
                onClick={handleRefresh}
                className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:shadow-lg hover:scale-105 transition-all"
              >
                🔄 Import Data Now
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard tickets={tickets} stats={stats!} />}
              {activeTab === 'calendar' && <Calendar tickets={tickets} />}
              {activeTab === 'tickets' && <TicketGrid tickets={tickets} />}
              {activeTab === 'questions' && <CriticalQuestions tickets={tickets} stats={stats!} />}
              {activeTab === 'takeaways' && <Takeaways tickets={tickets} stats={stats!} />}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
