'use client';

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Calendar from '@/components/Calendar';
import TicketGrid from '@/components/TicketGrid';
import CriticalQuestions from '@/components/CriticalQuestions';
import Takeaways from '@/components/Takeaways';

type Tab = 'dashboard' | 'calendar' | 'tickets' | 'questions' | 'takeaways';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

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
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            Operations Backlog
          </h1>
          <p className="text-lg text-gray-400">
            Executive Operations Dashboard - February 2026
          </p>
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
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'calendar' && <Calendar />}
          {activeTab === 'tickets' && <TicketGrid />}
          {activeTab === 'questions' && <CriticalQuestions />}
          {activeTab === 'takeaways' && <Takeaways />}
        </div>
      </div>
    </main>
  );
}
