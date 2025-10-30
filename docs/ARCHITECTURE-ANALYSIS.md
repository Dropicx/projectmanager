# Architecture Analysis: Current State & brief360 Integration Plan

**Date**: January 2025  
**Author**: Architecture Review  
**Status**: Active Analysis

---

## 📋 Executive Summary

This document analyzes the current architecture state of the Consailt platform, identifies service responsibilities, documents RSS feed request flow, and maps brief360 architecture for integration. It also reviews and adjusts GitHub issues to align with the brief360 integration target.

---

## 🏗️ Current Architecture Overview

### Service Architecture (4 Services)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Railway Infrastructure                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web       │  │   Worker    │  │   RSSHub    │             │
│  │  Service    │  │   Service   │  │   Service   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                 │                      │
│         └────────────────┴─────────────────┘                      │
│                          │                                        │
│                   ┌──────▼──────┐                                 │
│                   │ PostgreSQL  │                                 │
│                   │   Redis     │                                 │
│                   └─────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Service Responsibilities

### 1. **Web Service** (Next.js 15)
**Purpose**: Frontend application + API backend

**Responsibilities**:
- ✅ Next.js 15 web application (React 19, Tailwind CSS)
- ✅ tRPC API endpoints for knowledge base, projects, AI
- ✅ Authentication via Clerk
- ✅ Server-side rendering and API routes
- ✅ Health check endpoint (`/api/health`)

**Port**: 3000  
**Dockerfile**: `dockerfiles/Dockerfile.web`  
**Start Command**: `cd /app/web && node server.js`

**RSS Feed Role**: 
- ❌ **Currently**: Does NOT make RSS feed requests
- ✅ **Future**: Will provide API endpoints to read RSS articles from database
- ✅ **Future**: Will display RSS articles in UI (dashboard/news page)

---

### 2. **Worker Service** (Background Jobs)
**Purpose**: Background processing and scheduled tasks

**Responsibilities**:
- ✅ **CURRENT**: RSS feed fetching and parsing
- ✅ **CURRENT**: Multi-frequency RSS sync (15min, 30min, 60min, 120min, daily)
- ✅ AI-powered project insights generation
- ✅ Risk assessment and analysis
- ✅ Knowledge summary generation
- ✅ Embedding generation for semantic search
- ✅ Scheduled cron jobs for automated tasks

**Port**: None (background service)  
**Dockerfile**: `dockerfiles/Dockerfile.worker`  
**Start Command**: `cd /app/worker && node dist/index.js`

**RSS Feed Role**:
- ✅ **Currently**: **PRIMARY RESPONSIBILITY** - Makes all RSS feed requests
- ✅ **Currently**: Fetches feeds from:
  - Direct RSS URLs (legacy feeds)
  - RSSHub routes (via RSSHub service)
  - brief360 feeds (76 feeds across 6 categories)
- ✅ **Currently**: Stores articles in `news_articles` table
- ✅ **Currently**: Runs on schedules:
  - Every 15 minutes (Security feeds)
  - Every 30 minutes (News, Business, Tech feeds)
  - Every 60 minutes (Business, Tech feeds)
  - Every 120 minutes (Politics, Regulation feeds)
  - Daily at 8 AM UTC (Full sync)
- ✅ **Future**: Continue making RSS requests
- ✅ **Future**: Add relevance scoring (brief360 feature)

**Code Location**: 
- `worker/src/index.ts` - Cron jobs and RSS sync
- `packages/api/lib/rss-parser.ts` - Feed fetching logic

---

### 3. **RSSHub Service** (Self-hosted RSS Aggregator)
**Purpose**: RSS feed aggregation for sites without native RSS

**Responsibilities**:
- ✅ Self-hosted RSSHub instance
- ✅ Generate RSS feeds from websites without native feeds
- ✅ Serve as RSS feed source for brief360 feeds
- ✅ Cache feeds in Redis (DB 3)

**Port**: 1200  
**Dockerfile**: `dockerfiles/Dockerfile.rsshub`  
**Start Command**: `npm start`

**RSS Feed Role**:
- ✅ **Currently**: **SERVICE PROVIDER** - Generates RSS feeds on-demand
- ✅ **Currently**: Worker service queries RSSHub at: `${RSSHUB_URL}/route/...`
- ✅ **Currently**: Used by brief360 feeds with `feed_type: "rsshub"`
- ✅ **Future**: Continue serving as RSS generator
- ✅ **Future**: May be replaced/merged if brief360 has its own RSS system

**Configuration**:
- `RSSHUB_URL` environment variable points to this service
- `RSSHUB_SELF_HOSTED=true` enables self-hosted mode
- Redis caching configured (DB 3)

---

### 4. **Backend (implied, not separate service)**
**Note**: The "backend" is actually part of the Web service (tRPC API routes)

**Responsibilities**:
- ✅ tRPC API routes (`packages/api/trpc/`)
- ✅ Database access via Drizzle ORM
- ✅ Business logic for knowledge base, projects, AI

**RSS Feed Role**:
- ❌ **Currently**: Does NOT make RSS feed requests (handled by Worker)
- ✅ **Currently**: Provides API endpoints to read stored articles
- ✅ **Future**: Will provide filtered/personalized article feeds

---

## 🔄 RSS Feed Request Flow

### Current Flow (Who Makes Requests)

```
┌─────────────────────────────────────────────────────────────┐
│  Worker Service (Primary RSS Requester)                     │
│  - Cron Jobs scheduled (15min, 30min, 60min, 120min, daily)│
│  - Calls syncFeedsByFrequency() or syncAllRssFeeds()        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  RSS Parser (packages/api/lib/rss-parser.ts)               │
│  - fetchAndStoreRSSFeed(feedKey)                            │
│  - getAllFeeds() → Returns 76+ brief360 feeds              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─────────────────┬──────────────────┐
                   ▼                 ▼                  ▼
        ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
        │ Direct RSS   │   │ RSSHub       │   │  API         │
        │ Feeds        │   │ Service      │   │  Sources     │
        │ (legacy)     │   │ (port 1200)  │   │ (future)     │
        └──────────────┘   └──────────────┘   └──────────────┘
                   │                 │                  │
                   └─────────────────┴──────────────────┘
                                     │
                                     ▼
                        ┌──────────────────────┐
                        │  PostgreSQL          │
                        │  news_articles       │
                        │  (storage)          │
                        └──────────────────────┘
```

### Request Flow Details

1. **Worker Service** (Cron-triggered)
   - Every 15/30/60/120 minutes, cron jobs trigger RSS sync
   - Calls `syncFeedsByFrequency(frequencyMinutes)` from `packages/api/lib/rss-parser.ts`

2. **RSS Parser** (`packages/api/lib/rss-parser.ts`)
   - `getAllFeeds()` retrieves all feed configurations:
     - Legacy feeds (general, security, citizen)
     - brief360 feeds (76 feeds across 6 categories) - if `RSS_ENABLE_BRIEF360_FEEDS=true`
   - `fetchAndStoreRSSFeed(feedKey)` for each feed:
     - If `feed_type === "rsshub"`: Normalizes URL to use `${RSSHUB_URL}/route/...`
     - If `feed_type === "rss"`: Fetches directly from URL
     - Uses `rss-parser` library to parse feed
     - Stores articles in `news_articles` table
     - Deduplication by `link` field

3. **RSSHub Service** (If needed)
   - Worker makes HTTP requests to RSSHub service
   - RSSHub generates RSS feed on-the-fly
   - Returns RSS XML that Worker parses

4. **Database Storage**
   - Articles stored in `news_articles` table
   - Metadata includes feed category, source, published date

### Future Flow (With brief360 Integration)

```
┌─────────────────────────────────────────────────────────────┐
│  Worker Service (Primary RSS Requester) - UNCHANGED         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Enhanced RSS Parser                                        │
│  - Fetch feeds (UNCHANGED)                                  │
│  - NEW: Relevance scoring (brief360 feature)               │
│  - NEW: User preference filtering                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  AI Relevance Scorer (NEW - from brief360)                 │
│  - Score articles for all users                           │
│  - Store scores in user_article_scores table              │
│  - Generate alerts for high-relevance articles             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  PostgreSQL          │
        │  news_articles        │
        │  user_article_scores │
        │  user_alerts         │
        └──────────────────────┘
```

---

## 🎯 brief360 Architecture Analysis

### brief360 Service Components

```
brief360/
├── backend/ (FastAPI - Python)
│   ├── app/workers/
│   │   ├── rss_crawler.py      # RSS feed fetching (Celery tasks)
│   │   ├── relevance_scorer.py # AI-powered relevance scoring
│   │   └── insights_generator.py # AI insights generation
│   ├── app/services/
│   │   ├── ai_service.py        # OpenAI/Claude integration
│   │   └── matching_service.py  # Article-user matching
│   └── app/models/
│       ├── article.py           # Article model
│       ├── user_profile.py      # User profile with interests
│       └── user_article_score.py # Relevance scores
│
└── frontend/ (Next.js 14)
    └── Dashboard with personalized feed
```

### Key brief360 Features to Integrate

1. **RSS Feed Fetching** (Celery workers)
   - ✅ Already implemented in projectmanager (Worker service)
   - ✅ Multi-frequency scheduling (15/30/60/120 min)
   - ✅ Similar architecture

2. **AI-Powered Relevance Scoring** (missing in projectmanager)
   - ✅ brief360: `relevance_scorer.py` - scores articles for all users
   - ✅ Uses:
     - Semantic similarity (35%) - embeddings
     - Topic matching (25%)
     - Entity matching (10%) - companies, technologies
     - Source credibility (15%)
     - Recency (10%)
     - Category preference (5%)
   - ❌ projectmanager: Not yet implemented

3. **User Profiles & Preferences** (missing in projectmanager)
   - ✅ brief360: Interview-based user profile creation
   - ✅ Stores: industry, company_size, interests, technologies, competitors
   - ✅ Generates embeddings from user interests
   - ❌ projectmanager: Basic user model exists, but no preference system

4. **Alert System** (missing in projectmanager)
   - ✅ brief360: Intelligent alerts for critical articles
   - ✅ Alert levels: critical, high, medium
   - ✅ Triggers for: CVEs affecting tech stack, competitor news, regulatory changes
   - ❌ projectmanager: No alert system

5. **AI Insights Generation** (partially in projectmanager)
   - ✅ brief360: AI-generated summaries and insights per article
   - ✅ Uses OpenAI/Claude
   - ✅ projectmanager: Has AI orchestrator, but not used for article insights

---

## 📊 GitHub Issues Analysis

### Current Issues (Fetched from GitHub)

| # | Title | Status | Priority | Aligned with brief360? |
|---|-------|--------|----------|------------------------|
| 8 | [Phase 3] Database schema for news articles and RSS feeds | OPEN | - | ✅ Yes - Basic schema exists |
| 9 | [Phase 4] BullMQ background jobs for RSS processing | OPEN | - | ✅ Yes - Already implemented |
| 10 | [Phase 5] AI-powered relevance scoring for news articles | OPEN | - | ✅ **Key brief360 feature** |
| 11 | [Phase 6] Frontend news feed with filtering and sorting | OPEN | - | ✅ Yes - Part of brief360 |
| 12 | [Phase 7] End-to-end testing for RSS integration | OPEN | - | ✅ Yes |
| 13 | [Phase 8] Performance optimization and monitoring | OPEN | - | ✅ Yes |
| 14 | [Phase 8] Production deployment and documentation | OPEN | - | ✅ Yes |
| 15 | [Project Milestone] Complete brief360 RSS Integration | OPEN | - | ✅ **Master tracking issue** |
| 16 | [Phase 3] RSS Feed Monitoring & Health Checks | OPEN | Medium | ⚠️ Should be higher priority |
| 17 | [Phase 3] RSS Feed Filtering & Relevance Scoring | OPEN | Medium | ✅ **Key brief360 feature** |
| 18 | [Phase 3] RSS Feed Analytics & Reporting | OPEN | Low | ⚠️ Nice-to-have |
| 19 | [Phase 3] RSS Feed Configuration UI | OPEN | Low | ⚠️ Nice-to-have |
| 20 | [Phase 3] RSS Feed Content Enrichment | OPEN | Low | ⚠️ Nice-to-have |

### Issue Alignment Assessment

#### ✅ Well-Aligned Issues
- **Issue #10** (AI-powered relevance scoring) - **Core brief360 feature**
- **Issue #17** (RSS Feed Filtering & Relevance Scoring) - **Core brief360 feature**
- **Issue #11** (Frontend news feed) - Part of brief360 dashboard
- **Issue #8, #9** (Database & Jobs) - Foundation (already partially done)

#### ⚠️ Needs Adjustment
1. **Issue #10 & #17** - Overlap! Both cover relevance scoring. Should merge or clarify.
2. **Issue #16** (Monitoring) - Should be higher priority for production readiness
3. **Missing Issues**:
   - User profile system (brief360 interview flow)
   - Alert system (critical/high/medium alerts)
   - User preference-based filtering (brief360 core feature)
   - Article curation for users (brief360 dashboard feature)

#### ❌ Missing from Issues
1. **User Profile & Preferences System**
   - User interview flow (brief360 onboarding)
   - Storage of interests, technologies, competitors
   - User preference-based article filtering

2. **Alert System**
   - Critical alerts for CVEs affecting user tech stack
   - High-priority alerts for competitor news
   - Medium alerts for high-relevance articles

3. **Personalized Article Feed**
   - User-specific article ranking
   - Article curation based on user profile
   - Dashboard with personalized feed

---

## 🔄 Recommended Issue Adjustments

### 1. Merge Issues #10 and #17

**Current State**:
- Issue #10: "AI-powered relevance scoring for news articles"
- Issue #17: "RSS Feed Filtering & Relevance Scoring"

**Recommendation**: 
- **Keep Issue #17** as the main issue (more comprehensive)
- **Close/Reference Issue #10** as duplicate
- Add brief360-specific requirements to Issue #17:
  - User profile-based scoring
  - Entity matching (companies, technologies)
  - Alert generation based on scores

### 2. Add New Issues

#### **NEW Issue #21: User Profile & Preferences System**
**Priority**: High  
**Type**: Feature (brief360 integration)

**Description**: Implement user profile system with interview-based onboarding to capture user interests, technologies, competitors, and business context for personalized article scoring.

**Tasks**:
- [ ] Design user_profile table (industry, company_size, interests, technologies, competitors)
- [ ] Create interview flow UI (brief360-style onboarding)
- [ ] Generate user interest embeddings
- [ ] Store user preferences in database
- [ ] API endpoints for profile management

**Dependencies**: Issue #17 (relevance scoring needs profiles)

---

#### **NEW Issue #22: Alert System for Critical Articles**
**Priority**: High  
**Type**: Feature (brief360 integration)

**Description**: Implement intelligent alert system that notifies users of critical security vulnerabilities, competitor news, and high-relevance articles based on user profile.

**Tasks**:
- [ ] Design alert table (user_alerts)
- [ ] Implement alert generation logic:
  - Critical: CVEs affecting user's tech stack
  - High: Competitor news, regulatory changes
  - Medium: High-relevance articles (score > 80)
- [ ] Alert delivery mechanism (in-app, email future)
- [ ] Alert management UI (mark as viewed, acknowledge)

**Dependencies**: Issue #21 (user profiles), Issue #17 (relevance scoring)

---

#### **NEW Issue #23: Personalized Article Feed & Dashboard**
**Priority**: Medium  
**Type**: Feature (brief360 integration)

**Description**: Build personalized article feed that displays articles ranked by relevance score, filtered by user preferences, with AI-generated summaries and insights.

**Tasks**:
- [ ] Dashboard page with personalized feed
- [ ] Display articles sorted by user relevance score
- [ ] Show AI-generated summaries per article
- [ ] Filter by category, date, relevance threshold
- [ ] Article detail view with insights
- [ ] Bookmark/save articles functionality

**Dependencies**: Issue #17 (relevance scoring), Issue #21 (user profiles)

---

### 3. Update Issue Priorities

**Current → Recommended**:
- Issue #16 (Monitoring): Medium → **High** (needed for production)
- Issue #17 (Filtering & Scoring): Medium → **High** (core brief360 feature)
- Issue #21 (User Profiles): New → **High** (core brief360 feature)
- Issue #22 (Alerts): New → **High** (core brief360 feature)
- Issue #23 (Personalized Feed): New → **Medium**

**Keep as Low**:
- Issue #18 (Analytics) - Nice-to-have
- Issue #19 (Configuration UI) - Nice-to-have
- Issue #20 (Content Enrichment) - Nice-to-have

---

## 🗺️ Integration Roadmap

### Phase 1: Foundation (✅ Mostly Complete)
- [x] RSS feed fetching (Worker service)
- [x] Multi-frequency scheduling
- [x] Database schema for articles
- [ ] RSS feed monitoring (Issue #16) - **In Progress**

### Phase 2: Core brief360 Features (🔄 Next Steps)
1. **User Profile System** (Issue #21 - NEW)
   - Interview-based onboarding
   - Profile storage and embeddings
   - **Timeline**: 2-3 weeks

2. **Relevance Scoring** (Issue #17 - Enhanced)
   - AI-powered scoring algorithm
   - User profile-based matching
   - Entity extraction and matching
   - **Timeline**: 3-4 weeks

3. **Alert System** (Issue #22 - NEW)
   - Alert generation logic
   - Alert delivery
   - Alert UI
   - **Timeline**: 2-3 weeks

### Phase 3: User Experience (⏳ Future)
1. **Personalized Feed** (Issue #23 - NEW)
   - Dashboard with ranked articles
   - Filtering and sorting
   - Article detail views
   - **Timeline**: 2-3 weeks

2. **Frontend Integration** (Issue #11)
   - News feed UI components
   - Filtering UI
   - Mobile responsiveness
   - **Timeline**: 2-3 weeks

### Phase 4: Polish & Production (⏳ Future)
- Testing (Issue #12)
- Performance optimization (Issue #13)
- Production deployment (Issue #14)
- Analytics & monitoring

---

## 📝 Summary & Recommendations

### Current State
1. ✅ **Worker Service** makes all RSS feed requests (primary responsibility)
2. ✅ **RSSHub Service** generates feeds on-demand for brief360 feeds
3. ✅ **Web Service** provides API endpoints but does NOT make RSS requests
4. ✅ Multi-frequency RSS sync already implemented
5. ✅ 76 brief360 feeds integrated and configured

### brief360 Integration Gaps
1. ❌ User profile system with interview onboarding
2. ❌ AI-powered relevance scoring per user
3. ❌ Alert system for critical articles
4. ❌ Personalized article feed dashboard
5. ❌ User preference-based filtering

### Action Items
1. **Immediate**: Update GitHub issues (#10, #17, create #21, #22, #23)
2. **Short-term**: Implement user profile system (Issue #21)
3. **Medium-term**: Implement relevance scoring and alerts (Issues #17, #22)
4. **Long-term**: Build personalized dashboard (Issue #23)

### Next Steps
1. Review and merge duplicate issues (#10 & #17)
2. Create new issues for brief360 features (#21, #22, #23)
3. Update issue priorities
4. Begin implementation with user profile system

---

**Last Updated**: January 2025  
**Next Review**: After issue adjustments

