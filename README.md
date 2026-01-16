# Operations Backlog Dashboard - February 2026

A modern, interactive dashboard for presenting operations backlog to executive leadership. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📊 **Dashboard Overview** - Key metrics and priority distribution
- 📅 **Calendar Heatmap** - Visual representation of ticket creation patterns
- 🎫 **Ticket Grid** - Sortable, filterable table of all backlog items
- ❓ **Critical Questions** - Strategic analysis for leadership review
- 🎯 **Takeaways & Next Steps** - Executive summary and action plan

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deployment**: Vercel

## Design

Dark theme inspired by modern analytics dashboards, featuring:
- Deep navy background (#0a0f1a)
- Vibrant accent colors for data visualization
- Smooth animations and transitions
- Responsive grid layouts

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Data Integration

Currently uses placeholder data. To integrate with Azure DevOps:

1. Update `lib/data.ts` with ADO API integration
2. Configure environment variables for ADO credentials
3. Implement data refresh mechanism

## Project Structure

```
ops-feb-2026/
├── app/
│   ├── globals.css          # Global styles and theme
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page with tab navigation
├── components/
│   ├── Dashboard.tsx        # Overview dashboard
│   ├── Calendar.tsx         # Heatmap calendar
│   ├── TicketGrid.tsx       # Data grid
│   ├── CriticalQuestions.tsx # Strategic analysis
│   └── Takeaways.tsx        # Executive summary
└── lib/
    └── data.ts              # Data types and placeholder data
```

## Live Dashboard

**Production URL:** https://ops-feb-2026-nhwoqx8i9-cmgprojects.vercel.app

## Created By

Built with Claude Code for operations leadership presentation.
