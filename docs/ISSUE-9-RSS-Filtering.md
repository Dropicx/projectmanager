# Issue #9: RSS Feed Filtering & Relevance Scoring

**Status**: 📋 To Do  
**Priority**: Medium  
**Type**: Enhancement  
**Labels**: `rss`, `ai`, `filtering`, `relevance`

---

## 📋 Description

Add AI-powered filtering and relevance scoring for RSS feed articles to improve content quality and ensure users only see articles relevant to consulting work. This reduces noise and improves the value of ingested content.

## 🎯 Goals

- Filter articles based on relevance to consulting domain
- Score articles for relevance and quality
- Implement keyword-based filtering
- Support user preference-based filtering
- Improve article deduplication using content similarity

## ✅ Acceptance Criteria

### 1. AI-Based Relevance Scoring
- [ ] Use AI (Nova Lite) to score article relevance to consulting domain (0-100)
- [ ] Filter out articles below relevance threshold (configurable, default: 60)
- [ ] Store relevance score in article metadata
- [ ] Batch processing for efficiency
- [ ] Configurable per feed or globally

### 2. Keyword-Based Filtering
- [ ] Configurable inclusion keywords per feed/category
- [ ] Configurable exclusion keywords per feed/category
- [ ] Support regex patterns for advanced matching
- [ ] Case-insensitive matching
- [ ] Store matched keywords in metadata

### 3. Content Quality Scoring
- [ ] Detect and filter low-quality content (spam, ads, etc.)
- [ ] Score based on content length, readability, structure
- [ ] Filter extremely short articles (< 100 words)
- [ ] Filter articles with excessive links/ads
- [ ] Store quality score in metadata

### 4. User Preference-Based Filtering
- [ ] Allow users to set preferred topics/keywords
- [ ] Filter articles based on user preferences
- [ ] Per-user article relevance ranking
- [ ] Learning from user interactions (views, saves)
- [ ] Store user preferences in database

### 5. Improved Deduplication
- [ ] Content similarity detection using embeddings
- [ ] Semantic deduplication (similar articles with different titles)
- [ ] Cross-feed duplicate detection
- [ ] Handle article reposts across different sources
- [ ] Store duplicate relationships

## 🛠️ Technical Implementation

### Database Schema Updates
```sql
ALTER TABLE news_articles 
  ADD COLUMN relevance_score INTEGER, -- 0-100
  ADD COLUMN quality_score INTEGER, -- 0-100
  ADD COLUMN matched_keywords TEXT[],
  ADD COLUMN filtered_reason VARCHAR(255),
  ADD COLUMN embedding_vector REAL[], -- For similarity detection
  ADD COLUMN duplicate_of UUID REFERENCES news_articles(id);

CREATE TABLE user_feed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  inclusion_keywords TEXT[],
  exclusion_keywords TEXT[],
  preferred_categories TEXT[],
  minimum_relevance_score INTEGER DEFAULT 60,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_relevance ON news_articles(relevance_score);
CREATE INDEX idx_articles_quality ON news_articles(quality_score);
CREATE INDEX idx_articles_embedding ON news_articles USING ivfflat (embedding_vector vector_cosine_ops);
```

### AI Scoring Prompt
```typescript
const relevancePrompt = `
Rate the relevance of this article to professional consulting work (technology, business, strategy, management, security, etc.).
Consider:
- Is it relevant to consulting industry topics?
- Would it be useful for a consultant's knowledge base?
- Is it actionable or informational for consulting work?

Score: 0-100, where:
- 80-100: Highly relevant
- 60-79: Moderately relevant  
- 40-59: Somewhat relevant
- 0-39: Not relevant

Article Title: {title}
Article Content: {content}

Respond with ONLY a number (0-100):
`;
```

### Filtering Pipeline
```
1. Fetch RSS Feed
2. Parse Articles
3. Apply Keyword Filters (inclusion/exclusion)
4. AI Relevance Scoring (async, batch)
5. Quality Scoring
6. Deduplication Check
7. Store or Skip Decision
```

### API Endpoints
```typescript
// Get filtered articles based on user preferences
GET /api/trpc/news.getFilteredNews?userId=xxx&category=all

// Get relevance scores for articles
GET /api/trpc/news.getArticleRelevance?articleId=xxx

// Update user feed preferences
POST /api/trpc/news.updateFeedPreferences

// Manual filtering test
POST /api/trpc/news.testArticleFilter
```

## 📊 Success Metrics

- 80% reduction in irrelevant articles shown to users
- Average relevance score > 70 for displayed articles
- < 5% false positives (relevant articles filtered out)
- User satisfaction with article quality > 4/5

## 🔗 Related Issues

- Depends on: Issue #7 (RSS Feed Ingestion), Issue #12 (Content Enrichment) - uses embeddings
- Enhances: Issue #11 (RSS Feed Configuration UI) - can configure filters

## 📝 Notes

- Start with keyword filtering as it's simplest
- AI scoring can be expensive - batch process and cache results
- Consider using cheaper models (Nova Lite) for initial filtering
- Build learning system incrementally (start with static preferences)
- Embedding-based deduplication requires pgvector extension or alternative

## ⚠️ Performance Considerations

- Batch AI scoring requests to reduce API calls
- Cache relevance scores (articles don't change)
- Process filtering asynchronously after initial ingestion
- Index relevance_score for fast querying

