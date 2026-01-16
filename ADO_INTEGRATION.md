# Azure DevOps Integration Guide

## Overview

This dashboard now fetches live data from Azure DevOps work items across 3 projects and stores it in a Neon PostgreSQL database for fast access.

## Architecture

```
ADO Projects → API Routes → Neon PostgreSQL → Dashboard Components
     ↓              ↓              ↓                    ↓
   3 Queries    Dedup Logic   Storage Cache      Real-time UI
```

## Data Sources

### Azure DevOps Queries
1. **Byte LOS** - Query ID: `4d29bc56-ad8d-43fb-9de8-f5032de8149c`
2. **BYTE** - Query ID: `ba574226-2715-4616-a2f6-33e01fcdb319`
3. **Product Masters** - Query ID: `9cf4112e-b407-450f-915f-74182da51ce1`

## How It Works

### 1. Data Refresh Flow
When you click "🔄 Refresh from ADO":

1. **Fetch** - API calls each ADO project query
2. **Transform** - Converts ADO work items to our ticket format
3. **Deduplicate** - Removes duplicate work items (keeps latest revision)
4. **Store** - Clears database and inserts fresh data
5. **Reload** - Dashboard updates with new data

### 2. Data Mapping

ADO fields are intelligently mapped to our dashboard format:

- **Priority**:
  - 1 → Critical
  - 2 → High
  - 3 → Medium
  - 4+ → Low

- **Status**: Maps ADO states to: New, In Progress, Blocked, Ready for Review, Completed

- **Category**:
  - Bug → Bug Fix
  - Feature/User Story → Feature
  - Task → Infrastructure
  - Epic → Feature

- **Estimated Effort**: Based on Story Points
  - ≤2 → 1 week
  - 3-5 → 2 weeks
  - 6-8 → 3 weeks
  - 9+ → 4+ weeks

### 3. Database Schema

```sql
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,              -- WI-{workItemId}
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,                    -- Critical, High, Medium, Low
  status TEXT,                      -- Mapped from ADO State
  category TEXT,                    -- Derived from WorkItemType
  assignee TEXT,
  created_date TIMESTAMP,
  target_date TIMESTAMP,
  estimated_effort TEXT,
  dependencies TEXT,
  tags TEXT[],
  project TEXT,                     -- Byte LOS, BYTE, Product Masters
  work_item_type TEXT,              -- Original ADO type
  state TEXT,                       -- Original ADO state
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### GET `/api/init`
Initializes the database schema. Run this once on first deployment.

### POST `/api/refresh`
Fetches data from all ADO queries, deduplicates, and stores in database.

**Response:**
```json
{
  "success": true,
  "message": "Data refreshed successfully",
  "stats": {
    "ticketsImported": 45,
    "byProject": {
      "Byte LOS": 20,
      "BYTE": 15,
      "Product Masters": 10
    }
  }
}
```

### GET `/api/tickets`
Returns all tickets from database with statistics.

## Environment Variables

Required in Vercel:

```bash
ADO_ORGANIZATION=cmgfidev
ADO_PAT=<your-pat>
DATABASE_URL=<neon-connection-string>
```

## First-Time Setup

1. **Initialize Database** (automatic on first API call)
2. **Click "Refresh from ADO"** to import data
3. **View Dashboard** - All tabs now show live ADO data

## Refresh Strategy

### When to Refresh
- Before important meetings
- After significant ADO updates
- Weekly for regular tracking
- On-demand for latest status

### Automatic Refresh (Future Enhancement)
Consider adding:
- Scheduled CRON job (daily at 6am)
- Webhook from ADO (real-time updates)
- Cache TTL with auto-refresh

## Troubleshooting

### No Data Showing
1. Check environment variables in Vercel
2. Verify ADO PAT has read permissions
3. Check browser console for errors
4. Try clicking "Refresh from ADO"

### Slow Refresh
- Normal for 40+ work items across 3 projects
- Takes 5-10 seconds typically
- Database storage ensures fast subsequent loads

### Duplicate Tickets
The system automatically deduplicates by work item ID, keeping the latest revision.

## Security

- ✅ ADO PAT stored as Vercel environment variable (not in code)
- ✅ Database credentials encrypted by Neon
- ✅ API routes protected by Vercel's security
- ✅ No sensitive data in client-side code

## Performance

- **First Load**: 5-10 seconds (ADO fetch + DB insert)
- **Cached Load**: <1 second (database query)
- **Dashboard Render**: Instant (client-side)

## Future Enhancements

1. **Incremental Updates** - Only fetch changed items
2. **Real-time Sync** - ADO webhooks for instant updates
3. **Historical Tracking** - Store snapshots for trend analysis
4. **Custom Queries** - Let users add their own ADO queries
5. **Export Options** - Download data as CSV/Excel
