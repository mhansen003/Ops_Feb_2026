'use client';

import { type Ticket, type TicketStats } from '@/lib/data-client';

interface StoryProps {
  tickets: Ticket[];
  stats: TicketStats;
}

export default function Story({ tickets, stats }: StoryProps) {
  const completedCount = stats.byStatus.Completed || 0;
  const totalActive = stats.total - completedCount;

  return (
    <div className="space-y-8">
      {/* Hero Quote Section */}
      <div className="card bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700">
        <div className="max-w-4xl mx-auto py-8">
          {/* Quote Mark */}
          <div className="text-6xl text-blue-500/30 font-serif leading-none mb-4">"</div>

          {/* The Story */}
          <blockquote className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light italic mb-8">
            In January 2026, the Byte LOS team faced a daunting challenge: a sprawling backlog of 183 items scattered across three ADO boards, with no clear prioritization and items in various states of accuracy. Director of Product Ericka Anaya led a systematic "plan of attack"—organizing four one-hour prioritization sessions with Lauren Forconi, mobilizing Kelly Mattox to coordinate board cleanups with Renee's team, and ensuring developers Andrew, Robert, and Brian reviewed and closed stale items. Through collaborative effort and disciplined triage, the team transformed chaos into clarity: cleaning Team Renee's board from 32 items down to 23 accurate entries, addressing 61 items on the Byte Dev board, and delivering approximately 10 tickets in the weekly release. What emerged was a stack-ranked, prioritized backlog of {stats.total} items—finally giving leadership visibility into the true scope of work and enabling data-driven decisions about capacity, timelines, and business impact.
          </blockquote>

          {/* Attribution */}
          <div className="flex items-center gap-4 border-t border-gray-700 pt-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
              BB
            </div>
            <div>
              <div className="font-semibold text-white">Byte Backlog Initiative</div>
              <div className="text-sm text-gray-400">January 2026 • Stack Ranked & Prioritized</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Milestones */}
      <div className="card">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          The Journey
        </h3>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-teal-500 to-green-500"></div>

          {/* Timeline Items */}
          <div className="space-y-8">
            <TimelineItem
              date="Jan 13, 2026"
              title="Plan of Attack Initiated"
              description="Ericka Anaya outlined the strategy: 183 items across 3 ADO boards needed review, prioritization sessions scheduled with Lauren Forconi."
              icon="📋"
              color="bg-blue-500"
            />
            <TimelineItem
              date="Jan 14, 2026"
              title="Team Renee Board Complete"
              description="First board cleaned up with Lauren and Susan. After review, 23 accurate items retained from the original 32."
              icon="✅"
              color="bg-teal-500"
            />
            <TimelineItem
              date="Jan 14-21, 2026"
              title="Prioritization Sessions"
              description="Four one-hour sessions with Lauren Forconi to properly prioritize and align on what stays, what gets deferred, and what can be closed."
              icon="🎯"
              color="bg-purple-500"
            />
            <TimelineItem
              date="Jan 21, 2026"
              title="Backlog Cleanup Complete"
              description="All board queries exported to Excel for Lauren to stack rank by priority. Clean, prioritized backlog delivered."
              icon="📤"
              color="bg-amber-500"
            />
            <TimelineItem
              date="Jan 29, 2026"
              title="Stack Ranking Delivered"
              description="Lauren Forconi and Susan Walker delivered the final stack-ranked backlog. Each priority tier ranked internally, items near completion flagged, and potential duplicates identified for tech team review."
              icon="🏆"
              color="bg-green-500"
            />
          </div>
        </div>
      </div>

      {/* The Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Original Backlog"
          value="183"
          subtext="Items across 3 boards"
          icon="📊"
          gradient="from-gray-500 to-gray-600"
        />
        <MetricCard
          label="After Cleanup"
          value={stats.total.toString()}
          subtext="Prioritized items"
          icon="✨"
          gradient="from-blue-500 to-teal-500"
        />
        <MetricCard
          label="Reduction"
          value={`${Math.round((1 - stats.total / 183) * 100)}%`}
          subtext="Items closed or merged"
          icon="📉"
          gradient="from-green-500 to-emerald-500"
        />
        <MetricCard
          label="Team Size"
          value="2+2"
          subtext="BAs + Developers"
          icon="👥"
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Stack Ranking Highlights from Lauren */}
      <div className="card bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-700/30">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="text-2xl">📋</span>
          Stack Ranking Highlights
          <span className="text-sm font-normal text-amber-400 ml-2">from Lauren & Susan's Review</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ranking Approach */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <span className="text-green-400">✓</span> Ranking Approach
            </h4>
            <ul className="text-sm text-gray-300 space-y-2 pl-6">
              <li>Items ranked <span className="text-green-400 font-semibold">within each priority tier</span> (Critical → High → Medium → Low)</li>
              <li>Rank <span className="text-green-400 font-semibold">"0"</span> = near finish line, don't deprioritize</li>
              <li><span className="text-amber-400">"Unranked"</span> = needs clarification or wrapped into other items</li>
              <li className="italic text-gray-400">"Not deathly attached to strict order—happy to wiggle things around as it makes sense"</li>
            </ul>
          </div>

          {/* Key Call-outs */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <span className="text-amber-400">⚡</span> Key Call-outs
            </h4>
            <ul className="text-sm text-gray-300 space-y-2 pl-6">
              <li><span className="text-blue-400">#73860</span> - "Didn't we do this already?" - verify before starting</li>
              <li><span className="text-blue-400">#76214</span> & <span className="text-blue-400">#78114</span> - potential duplicates of other tickets</li>
              <li><span className="text-blue-400">#87757</span> - Lereta flood integration: Susan recommends <span className="text-red-400">not proceeding</span></li>
              <li><span className="text-blue-400">#92240, #92908</span> - consider combining with <span className="text-blue-400">#60402</span> (AIO refresh)</li>
            </ul>
          </div>
        </div>

        {/* Items Removed */}
        <div className="mt-6 pt-4 border-t border-amber-700/30">
          <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
            <span className="text-green-400">✅</span> Completed & Removed (3 items)
          </h4>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">#91364 - First Payment Letter (per Kelly)</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">#92360 - Credit Verifications Bundle (Released)</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">#93001 - AIO Hardstops (per ADO)</span>
          </div>
        </div>
      </div>

      {/* Team Recognition */}
      <div className="card">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="text-2xl">🌟</span>
          The Team Behind the Transformation
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TeamMember name="Ericka Anaya" role="Director of Product" emoji="👩‍💼" />
          <TeamMember name="Lauren Forconi" role="Stack Ranking Lead" emoji="📊" />
          <TeamMember name="Kelly Mattox" role="Coordination Lead" emoji="🎯" />
          <TeamMember name="Susan Walker" role="Stack Ranking" emoji="📋" />
          <TeamMember name="Renee Perrault" role="Team Lead" emoji="👩‍💻" />
          <TeamMember name="Andrew" role="Developer" emoji="⚙️" />
          <TeamMember name="Robert" role="Developer" emoji="🔧" />
          <TeamMember name="Brian Carlon" role="Developer" emoji="💻" />
        </div>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

function TimelineItem({ date, title, description, icon, color }: TimelineItemProps) {
  return (
    <div className="relative pl-16">
      {/* Icon */}
      <div className={`absolute left-0 w-12 h-12 rounded-full ${color} flex items-center justify-center text-xl shadow-lg`}>
        {icon}
      </div>

      {/* Content */}
      <div className="pb-2">
        <div className="text-sm text-gray-500 mb-1">{date}</div>
        <h4 className="font-semibold text-white mb-2">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: string;
  gradient: string;
}

function MetricCard({ label, value, subtext, icon, gradient }: MetricCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className="text-sm text-gray-400 mt-1">{subtext}</div>
    </div>
  );
}

interface TeamMemberProps {
  name: string;
  role: string;
  emoji: string;
}

function TeamMember({ name, role, emoji }: TeamMemberProps) {
  return (
    <div className="p-4 bg-gray-800/30 rounded-lg text-center hover:bg-gray-800/50 transition-all">
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="font-medium text-white text-sm">{name}</div>
      <div className="text-xs text-gray-500">{role}</div>
    </div>
  );
}
