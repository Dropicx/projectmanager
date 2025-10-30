# brief360 Integration Implementation Plan

**Date**: January 2025  
**Status**: Planning Phase  
**Target Completion**: Q1 2025

---

## 📋 Executive Summary

This document provides a detailed implementation plan for integrating brief360 architecture features into the Consailt platform. The integration includes user profiles, AI-powered relevance scoring, alert systems, and personalized article feeds.

**Total Estimated Effort**: 82-104 hours (includes Elasticsearch)  
**Timeline**: 12-13 weeks (part-time development)  
**Priority**: High (core features for platform value)

---

## 🎯 Integration Goals

1. **User Profile System**: Interview-based onboarding to capture user interests and preferences
2. **Relevance Scoring**: AI-powered article scoring based on user profiles
3. **Alert System**: Intelligent alerts for critical articles
4. **Personalized Feed**: Dashboard with curated articles for each user

---

## 📊 Phase Breakdown

### Phase 1: Foundation (Weeks 1-2) ✅ Mostly Complete

**Status**: Foundation already in place

**Completed**:
- ✅ RSS feed fetching (Worker service)
- ✅ Multi-frequency scheduling (15/30/60/120 min)
- ✅ Database schema for `news_articles`
- ✅ brief360 feeds integrated (76 feeds)

**Remaining**:
- [ ] Issue #16: RSS Feed Monitoring & Health Checks (High Priority)

**Estimated Effort**: 8-10 hours

---

### Phase 2: User Profile System (Weeks 3-5)

**Issue**: #21 - User Profile & Preferences System  
**Priority**: High  
**Estimated Effort**: 12-16 hours

#### Week 3: Database & Schema

**Tasks**:
1. Design `user_profiles` table schema
   ```sql
   CREATE TABLE user_profiles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL UNIQUE REFERENCES users(id),
     industry TEXT,
     company_size TEXT,
     interests TEXT[],
     technologies TEXT[],
     competitors TEXT[],
     goals TEXT[],
     interests_text TEXT,
     interests_embedding REAL[],
     content_preferences JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. Create Drizzle schema definition
   - File: `packages/database/schema/user-profiles.ts`
   - Define `user_profiles` table schema
   - Add relationships to `users` table

3. Create migration file
   - File: `packages/database/migrations/XXXX_create_user_profiles.sql`
   - Include indexes: `user_id`, `industry`

4. Run migration and test
   - Verify schema creation
   - Test relationships

**Deliverables**:
- [ ] Database schema created
- [ ] Migration file ready
- [ ] Tests passing

---

#### Week 4: Interview Flow & Onboarding

**Tasks**:
1. Create interview flow component
   - File: `web/components/onboarding/interview-flow.tsx`
   - Multi-step form with progress indicator
   - Steps:
     1. Industry selection
     2. Company size
     3. Business goals (multi-select)
     4. Technology stack (multi-select)
     5. Competitors (text input)
     6. Content preferences

2. Create onboarding page
   - File: `web/app/(dashboard)/onboarding/page.tsx`
   - Route: `/dashboard/onboarding`
   - Use interview flow component
   - Redirect to dashboard after completion

3. Implement AI question generation
   - Extend AI orchestrator for interview questions
   - Use Nova Lite for cost efficiency
   - Generate contextual follow-up questions
   - File: `packages/ai/lib/interview-question-generator.ts`

4. Implement insight extraction
   - Extract structured data from interview answers
   - Use Nova Lite for JSON extraction
   - File: `packages/ai/lib/insight-extractor.ts`

5. API endpoints (tRPC)
   - File: `packages/api/trpc/routers/users.ts` (extend)
   - `users.getProfile` - Get user profile
   - `users.createProfile` - Create profile from interview
   - `users.updateProfile` - Update profile fields
   - `users.generateInterviewQuestion` - AI question generation
   - `users.extractInsights` - Extract data from answers

**Deliverables**:
- [ ] Interview flow UI functional
- [ ] Onboarding page accessible
- [ ] AI question generation working
- [ ] API endpoints implemented
- [ ] Profile creation from interview working

---

#### Week 5: Profile Management & Embeddings

**Tasks**:
1. Profile embedding generation
   - File: `worker/jobs/profile-embedding-job.ts`
   - Generate embeddings from `interests_text`
   - Use AWS Titan Embeddings v2 (1536 dimensions)
   - Store in `interests_embedding` column
   - Fallback to mock embeddings on failure

2. Profile update job
   - Regenerate embeddings when profile changes
   - Background job triggered on profile update

3. Profile settings page
   - File: `web/app/(dashboard)/settings/profile/page.tsx`
   - Edit profile fields
   - Display current profile
   - Save/update functionality

4. Profile completion tracking
   - Check if user has completed profile
   - Redirect to onboarding if incomplete
   - Show profile completion status

**Deliverables**:
- [ ] Embedding generation working
- [ ] Profile updates trigger re-embedding
- [ ] Settings page functional
- [ ] Profile completion tracking working

---

### Phase 3: Relevance Scoring (Weeks 6-8)

**Issue**: #17 - RSS Feed Filtering & Relevance Scoring  
**Priority**: High  
**Estimated Effort**: 16-20 hours

#### Week 6: Scoring Algorithm & Database

**Tasks**:
1. Design `user_article_scores` table
   ```sql
   CREATE TABLE user_article_scores (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
     relevance_score DECIMAL(5,2) NOT NULL, -- 0-100
     scoring_factors JSONB, -- Breakdown of scoring components
     calculated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(user_id, article_id)
   );
   ```

2. Create relevance scoring service
   - File: `packages/api/lib/relevance-scorer.ts`
   - Implement brief360 scoring algorithm:
     - Semantic similarity (35%) - cosine similarity of embeddings
     - Topic matching (25%) - keyword matching
     - Entity matching (10%) - companies, technologies
     - Source credibility (15%) - predefined scores
     - Recency (10%) - exponential decay
     - Category preference (5%) - user preference match

3. Entity extraction
   - Extract entities from articles (organizations, products, CVEs)
   - Use NLP library or AI model
   - Store in article metadata
   - File: `packages/api/lib/entity-extractor.ts`

4. Source credibility mapping
   - Define credibility scores per source
   - CERT: 1.0, Reuters: 1.0, TechCrunch: 0.8, Blogs: 0.6
   - Configurable via config file

**Deliverables**:
- [ ] Database schema created
- [ ] Scoring algorithm implemented
- [ ] Entity extraction working
- [ ] Source credibility scoring working

---

#### Week 7: Scoring Integration

**Tasks**:
1. Article scoring job
   - File: `worker/jobs/article-scoring-job.ts`
   - Score each new article for ALL active users
   - Batch processing for efficiency
   - Store scores in `user_article_scores` table

2. Integration with RSS ingestion
   - Trigger scoring job after article ingestion
   - Queue scoring job in Worker service
   - Process scores asynchronously

3. Scoring factors breakdown
   - Store individual component scores (semantic, topic, entity, etc.)
   - Useful for debugging and analytics
   - Store in `scoring_factors` JSONB column

4. Caching strategy
   - Cache scores (articles don't change)
   - Invalidate cache on article update (rare)
   - Redis cache for frequently accessed scores

**Deliverables**:
- [ ] Scoring job processing articles
   - [ ] Scores stored in database
   - [ ] Batch processing efficient
   - [ ] Integration with RSS flow working

---

#### Week 8: Optimization & Testing

**Tasks**:
1. Performance optimization
   - Optimize embedding comparisons (batch operations)
   - Index `user_article_scores` table properly
   - Query optimization for score retrieval

2. Scoring accuracy validation
   - Manual review of scored articles
   - Compare scores to user feedback
   - Tune scoring weights if needed

3. Edge case handling
   - Handle missing user profiles gracefully
   - Handle missing article data
   - Fallback scoring for incomplete data

4. Testing
   - Unit tests for scoring algorithm
   - Integration tests for scoring job
   - Performance tests for batch processing

**Deliverables**:
- [ ] Scoring performance optimized
- [ ] Accuracy validated
- [ ] Edge cases handled
- [ ] Tests passing

---

### Phase 4: Alert System (Weeks 9-10)

**Issue**: #22 - Alert System for Critical Articles  
**Priority**: High  
**Estimated Effort**: 12-16 hours

#### Week 9: Alert Generation & Database

**Tasks**:
1. Create `user_alerts` table
   ```sql
   CREATE TABLE user_alerts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
     alert_level VARCHAR(20) NOT NULL CHECK (alert_level IN ('critical', 'high', 'medium')),
     alert_type VARCHAR(50) NOT NULL,
     message TEXT NOT NULL,
     is_viewed BOOLEAN DEFAULT FALSE,
     is_acknowledged BOOLEAN DEFAULT FALSE,
     viewed_at TIMESTAMP,
     acknowledged_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. Implement alert generation logic
   - File: `packages/api/lib/alert-generator.ts`
   - Evaluate articles against alert rules:
     - Critical: CVEs affecting user tech stack
     - Critical: Security breaches at user company
     - High: Competitor news
     - High: Regulatory changes
     - Medium: High relevance (score >= 80)

3. Alert generation job
   - File: `worker/jobs/alert-generation-job.ts`
   - Run after article scoring completes
   - Check each article against all active users
   - Generate alerts based on rules
   - Prevent duplicate alerts

**Deliverables**:
- [ ] Database schema created
- [ ] Alert generation logic implemented
- [ ] Alert generation job working
- [ ] No duplicate alerts

---

#### Week 10: Alert UI & API

**Tasks**:
1. Alert API endpoints (tRPC)
   - File: `packages/api/trpc/routers/alerts.ts`
   - `alerts.getUserAlerts` - Get alerts with filters
   - `alerts.getUnreadCount` - Unread alert count
   - `alerts.markAsViewed` - Mark as viewed
   - `alerts.acknowledge` - Acknowledge alert
   - `alerts.markAllAsViewed` - Bulk mark as viewed

2. Alert center page
   - File: `web/app/(dashboard)/alerts/page.tsx`
   - List all user alerts
   - Filter by level, type, status
   - Alert detail view

3. Alert notifications
   - Alert count badge in navigation
   - In-app notifications (toast/popup)
   - Link to alert center

4. Alert management
   - Mark as viewed
   - Acknowledge alerts
   - Alert detail shows article
   - Link to article from alert

**Deliverables**:
- [ ] API endpoints implemented
- [ ] Alert center page functional
- [ ] Alert notifications working
- [ ] Alert management working

---

### Phase 5: Personalized Feed (Weeks 11-13)

**Issue**: #23 - Personalized Article Feed & Dashboard  
**Priority**: Medium  
**Estimated Effort**: 30-42 hours (includes Elasticsearch)

#### Week 11: Elasticsearch Setup & Article Indexing

**Dependency**: Elasticsearch is required for full-text search functionality (matching brief360 architecture)

**Tasks**:
1. Add Elasticsearch service to `docker-compose.yml`
   - Use Elasticsearch 8.11.0
   - Configure single-node mode for development
   - Set Java heap size (512m)
   - Health check configuration

2. Create Elasticsearch client wrapper
   - File: `packages/api/lib/elasticsearch-client.ts`
   - Wrap Elasticsearch Node.js client
   - Connection management
   - Error handling

3. Create article indexing service
   - File: `packages/api/lib/article-indexer.ts`
   - Index article structure
   - Handle article updates
   - Handle article deletes
   - Bulk indexing operations

4. Create article indexing job
   - File: `worker/jobs/article-indexing-job.ts`
   - Index all existing articles on startup
   - Index new articles after RSS ingestion
   - Background indexing for performance

5. Article index schema
   - Define Elasticsearch mapping
   - Fields: id, title, summary, content, category, publishedAt, source, url, imageUrl
   - Support for relevance scores (dynamic per user)

**Deliverables**:
- [ ] Elasticsearch service running in docker-compose
- [ ] Elasticsearch client configured
- [ ] Article indexing job working
- [ ] All existing articles indexed

---

#### Week 12: Search API & Integration

**Tasks**:
1. Create search tRPC router
   - File: `packages/api/trpc/routers/search.ts`
   - Full-text search endpoint
   - Faceted search (category, date, source)
   - Relevance score filtering
   - Pagination support

2. Implement search queries
   - Full-text search with highlighting
   - Boolean queries (AND, OR, NOT)
   - Filter by category, date range
   - Sort by relevance, date, score
   - Performance optimization

3. Integrate search with personalized feed
   - Use search API for feed filtering
   - Combine with relevance scores
   - Efficient querying

4. Test search functionality
   - Test with large article sets
   - Performance testing
   - Edge cases

**Deliverables**:
- [ ] Search API endpoints functional
- [ ] Search integrated with feed
- [ ] Performance acceptable (< 500ms response time)

---

#### Week 13: Feed API & Data

**Tasks**:
1. Personalized feed API endpoint
   - File: `packages/api/trpc/routers/news.ts` (extend)
   - `news.getPersonalizedFeed` - Get user's personalized feed
   - Filter by category, date range, relevance threshold
   - Sort by relevance, newest, oldest
   - Pagination support

2. Article detail with insights
   - `news.getArticleDetail` - Get article with AI insights
   - Include relevance score for user
   - Include alert status
   - Include bookmark status

3. Bookmark functionality
   - Create `user_bookmarks` table (if needed)
   - `news.bookmarkArticle` - Bookmark article
   - `news.unbookmarkArticle` - Remove bookmark
   - `news.getBookmarks` - Get bookmarked articles

**Deliverables**:
- [ ] Personalized feed API working
- [ ] Article detail endpoint working
- [ ] Bookmark functionality working

---

#### Week 12: Feed UI Components

**Tasks**:
1. News feed page
   - File: `web/app/(dashboard)/news/page.tsx`
   - Display personalized article feed
   - Infinite scroll or pagination
   - Loading and error states

2. Article card component
   - File: `web/components/news/news-card.tsx`
   - Show title, summary, relevance score badge
   - Category badges, published date
   - Bookmark button, alert indicator

3. Filter panel
   - File: `web/components/news/news-filters.tsx`
   - Filter by category, date range, relevance
   - Sort options
   - Clear filters

4. Article detail view
   - File: `web/components/news/article-detail.tsx`
   - Full article content
   - AI-generated insights
   - Related articles
   - Bookmark/share buttons

**Deliverables**:
- [ ] News feed page functional
- [ ] Article cards displaying correctly
- [ ] Filters working
- [ ] Article detail view working

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Issue #16: RSS Feed Monitoring & Health Checks

### Phase 2: User Profiles
- [ ] Issue #21: User Profile & Preferences System
  - [ ] Database schema
  - [ ] Interview flow
  - [ ] Profile management
  - [ ] Embedding generation

### Phase 3: Relevance Scoring
- [ ] Issue #17: RSS Feed Filtering & Relevance Scoring
  - [ ] Scoring algorithm
  - [ ] Entity extraction
  - [ ] Scoring job
  - [ ] Optimization

### Phase 4: Alert System
- [ ] Issue #22: Alert System for Critical Articles
  - [ ] Alert generation
  - [ ] Alert API
  - [ ] Alert UI

### Phase 5: Personalized Feed
- [ ] Issue #23: Personalized Article Feed & Dashboard
  - [ ] **Elasticsearch setup** (Week 11)
  - [ ] **Article indexing** (Week 11)
  - [ ] **Search API** (Week 12)
  - [ ] Feed API (Week 13)
  - [ ] Feed UI (Week 13)
  - [ ] Bookmarking (Week 13)

---

## 🔗 Dependencies & Relationships

```
Issue #21 (User Profiles)
    │
    ├─→ Issue #17 (Relevance Scoring) - requires user profiles
    │   │
    │   └─→ Issue #22 (Alerts) - uses relevance scores
    │       │
    │       └─→ Issue #23 (Feed) - shows alerts
    │
    └─→ Issue #23 (Feed) - uses user profiles for personalization
```

**Implementation Order**:
1. Issue #21 (User Profiles) - Foundation
2. Issue #17 (Relevance Scoring) - Core feature
3. Issue #22 (Alerts) - Enhancement
4. Issue #23 (Feed) - User-facing feature
5. Issue #16 (Monitoring) - Can be parallel

---

## 📊 Success Metrics

### User Profiles
- 90%+ onboarding completion rate
- Profile completion time < 5 minutes
- Embedding generation success > 95%

### Relevance Scoring
- Average relevance score of viewed articles > 70
- Scoring accuracy (user feedback alignment) > 80%
- Scoring job processes 1000 articles in < 5 minutes

### Alert System
- Critical alerts delivered < 5 minutes
- Alert accuracy (true positives) > 85%
- User engagement with alerts > 60%

### Personalized Feed
- Average articles viewed per session > 5
- User satisfaction > 4/5
- Page load time < 2 seconds

---

## 🛠️ Technical Decisions

### Embeddings
- **Model**: AWS Titan Embeddings v2 (1536 dimensions)
- **Rationale**: Same model as knowledge base, consistent, cost-effective

### Scoring Algorithm
- **Approach**: Multi-factor weighted scoring (brief360 style)
- **Rationale**: Proven approach, interpretable, tunable

### Alert Generation
- **Timing**: After relevance scoring completes
- **Rationale**: Alerts depend on scores, efficient to batch together

### Feed Personalization
- **Default**: Show articles with relevance score >= 50
- **Rationale**: Balance relevance vs. content volume

---

## 📝 Notes & Considerations

1. **Performance**: Scoring all articles for all users can be expensive
   - Solution: Batch processing, caching, async jobs
   
2. **User Privacy**: Profile data is sensitive
   - Solution: Encrypt sensitive fields, GDPR compliance

3. **Scalability**: Large user base = many scoring operations
   - Solution: Efficient algorithms, database indexing, caching

4. **Cost**: AI features (embeddings, scoring) can be expensive
   - Solution: Use cheaper models (Nova Lite), batch processing, caching

---

## 🔗 References

### Brief360 Files to Reference
- `brief360/backend/app/models/user_profile.py` - User profile model
- `brief360/backend/app/workers/relevance_scorer.py` - Scoring algorithm
- `brief360/backend/app/models/user_article_score.py` - Score storage
- `brief360/backend/app/models/user_alert.py` - Alert model
- `brief360/frontend/app/dashboard/page.tsx` - Dashboard UI
- `brief360/frontend/app/interview/page.tsx` - Interview flow

### Project Files
- `packages/api/lib/rss-parser.ts` - RSS feed fetching
- `worker/src/index.ts` - Worker service and cron jobs
- `packages/ai/orchestrator.ts` - AI orchestrator
- `packages/database/schema.ts` - Database schema

---

**Last Updated**: January 2025  
**Next Review**: After Phase 1 completion

