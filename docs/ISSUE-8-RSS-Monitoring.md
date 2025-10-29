# Issue #8: RSS Feed Monitoring & Health Checks

**Status**: 📋 To Do  
**Priority**: Medium  
**Type**: Enhancement  
**Labels**: `rss`, `monitoring`, `reliability`

---

## 📋 Description

Add comprehensive monitoring and health checks for RSS feed ingestion to ensure reliability and enable proactive issue detection. This includes tracking feed health status, alerting on failures, and providing visibility into feed performance.

## 🎯 Goals

- Monitor RSS feed health and fetch success rates
- Alert on feed failures and degradation
- Provide dashboard visibility into feed status
- Automatically disable consistently failing feeds
- Track feed fetch metrics and performance

## ✅ Acceptance Criteria

### 1. Feed Health Status Tracking
- [ ] Track health status per feed (healthy, degraded, failing, disabled)
- [ ] Store last successful fetch timestamp
- [ ] Store consecutive failure count
- [ ] Store success rate over rolling window (e.g., last 24 hours, 7 days)
- [ ] Database schema for feed health tracking

### 2. Failed Feed Alerting
- [ ] Alert mechanism for feeds failing more than X times consecutively
- [ ] Configurable alert thresholds (default: 3 consecutive failures)
- [ ] Alert destinations: logs, email (future), webhook (future)
- [ ] Daily digest of feed health summary
- [ ] Critical alert for high-priority feeds (security feeds)

### 3. Feed Fetch Metrics
- [ ] Track fetch duration per feed
- [ ] Track articles fetched vs. inserted
- [ ] Track error types and frequencies
- [ ] Store metrics in database (feed_metrics table)
- [ ] Export metrics to monitoring system (future: Prometheus)

### 4. Feed Status Dashboard
- [ ] API endpoint to get feed health status
- [ ] List feeds by health status (healthy, degraded, failing)
- [ ] Show last fetch time, success rate, error count
- [ ] UI component to display feed status (future)
- [ ] Historical health trends (future)

### 5. Automatic Feed Disabling
- [ ] Auto-disable feeds after N consecutive failures (configurable, default: 10)
- [ ] Notification when feed is auto-disabled
- [ ] Manual re-enable mechanism via API
- [ ] Retry logic with exponential backoff before disabling
- [ ] Cooldown period before re-enabling attempts

## 🛠️ Technical Implementation

### Database Schema
```sql
CREATE TABLE feed_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_key VARCHAR(255) NOT NULL UNIQUE,
  health_status VARCHAR(50) NOT NULL, -- 'healthy', 'degraded', 'failing', 'disabled'
  last_successful_fetch TIMESTAMP,
  consecutive_failures INTEGER DEFAULT 0,
  success_rate_24h DECIMAL(5,2), -- percentage
  success_rate_7d DECIMAL(5,2),
  last_error TEXT,
  last_error_at TIMESTAMP,
  auto_disabled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feed_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_key VARCHAR(255) NOT NULL,
  fetch_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  duration_ms INTEGER,
  articles_fetched INTEGER,
  articles_inserted INTEGER,
  articles_skipped INTEGER,
  error_message TEXT,
  error_type VARCHAR(100)
);

CREATE INDEX idx_feed_metrics_feed_key ON feed_metrics(feed_key);
CREATE INDEX idx_feed_metrics_timestamp ON feed_metrics(fetch_timestamp);
```

### API Endpoints
```typescript
// Get all feeds with health status
GET /api/trpc/news.getFeedHealth

// Get feed metrics for a specific feed
GET /api/trpc/news.getFeedMetrics?feedKey=security_cert_bund&days=7

// Get overall feed health summary
GET /api/trpc/news.getFeedHealthSummary

// Manually enable/disable feed
POST /api/trpc/news.updateFeedStatus
```

### Monitoring Logic
- After each feed fetch, update `feed_health` table
- Calculate success rate over rolling windows
- Auto-disable if consecutive failures exceed threshold
- Log all failures with error details
- Generate daily health report

## 📊 Success Metrics

- Feed uptime > 95% for all enabled feeds
- Alert response time < 5 minutes for critical feeds
- < 5% of feeds auto-disabled due to failures
- Feed health dashboard load time < 500ms

## 🔗 Related Issues

- Depends on: Issue #7 (RSS Feed Ingestion)
- Blocks: Issue #11 (RSS Feed Configuration UI) - needs health data

## 📝 Notes

- Start with logging and database tracking
- Add alerting after monitoring foundation is in place
- UI dashboard can be implemented separately if needed
- Consider integration with existing monitoring stack (e.g., Railway metrics)

