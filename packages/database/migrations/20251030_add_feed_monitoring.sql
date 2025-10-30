-- Feed Monitoring Tables

CREATE TABLE IF NOT EXISTS feed_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_key VARCHAR(255) NOT NULL UNIQUE,
  health_status VARCHAR(50) NOT NULL DEFAULT 'healthy',
  last_successful_fetch TIMESTAMP,
  consecutive_failures INTEGER DEFAULT 0,
  success_rate_24h REAL,
  success_rate_7d REAL,
  last_error TEXT,
  last_error_at TIMESTAMP,
  auto_disabled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feed_health_feed_key_idx ON feed_health(feed_key);
CREATE INDEX IF NOT EXISTS feed_health_status_idx ON feed_health(health_status);

CREATE TABLE IF NOT EXISTS feed_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_key VARCHAR(255) NOT NULL,
  fetch_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT TRUE,
  duration_ms INTEGER,
  articles_fetched INTEGER DEFAULT 0,
  articles_inserted INTEGER DEFAULT 0,
  articles_skipped INTEGER DEFAULT 0,
  error_message TEXT,
  error_type VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS feed_metrics_feed_key_idx ON feed_metrics(feed_key);
CREATE INDEX IF NOT EXISTS feed_metrics_timestamp_idx ON feed_metrics(fetch_timestamp);


