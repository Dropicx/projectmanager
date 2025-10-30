# brief360 Services Analysis & Future Architecture Needs

**Date**: January 2025  
**Status**: Architecture Planning

---

## 📊 Service Comparison

### Current projectmanager Services (Local Docker Compose)

| Service | Purpose | Status | Port |
|---------|---------|--------|------|
| **web** | Next.js frontend + tRPC API | ✅ Present | 3000 |
| **worker** | Background jobs (BullMQ, cron) | ✅ Present | 3001 |
| **postgres** | Primary database | ✅ Present | 5432 |
| **redis** | Cache & job queues | ✅ Present | 6379 |
| **rsshub** | RSS aggregator | ✅ Present | 1200 |

### brief360 Services (Docker Compose)

| Service | Purpose | Status | Port | Need? |
|---------|---------|--------|------|-------|
| **frontend** | Next.js frontend | ✅ Present | 3000 | ✅ We have (web) |
| **backend** | FastAPI Python API | ✅ Present | 8000 | ⚠️ Different approach |
| **celery-worker** | Celery background worker | ✅ Present | - | ⚠️ Different approach |
| **celery-beat** | Celery task scheduler | ✅ Present | - | ⚠️ Different approach |
| **postgres** | Primary database | ✅ Present | 5432 | ✅ We have |
| **redis** | Cache & message broker | ✅ Present | 6379 | ✅ We have |
| **pgadmin** | PostgreSQL admin UI | ✅ Present | 5050 | ❌ Dev tool only |
| **redisinsight** | Redis admin UI | ✅ Present | 8001 | ❌ Dev tool only |
| **rsshub** | RSS aggregator | ✅ Present | 1200 | ✅ We have |
| **elasticsearch** | Full-text search engine | ✅ Present | 9200 | 🔴 **NEEDED** |
| **minio** | Object storage (S3-compatible) | ✅ Present | 9000/9001 | ⚠️ Optional |

---

## 🔍 Detailed Analysis

### ✅ Services We Already Have

#### 1. **Web Service** (vs brief360's frontend)
- **projectmanager**: Next.js 15 with tRPC API (monolith)
- **brief360**: Separate frontend + backend (FastAPI)
- **Status**: ✅ **Adequate** - Our approach is simpler (monolith vs microservices)
- **Decision**: Keep current approach

#### 2. **Worker Service** (vs brief360's celery-worker + celery-beat)
- **projectmanager**: Node.js Worker with BullMQ + cron jobs
- **brief360**: Celery worker + Celery beat (Python)
- **Status**: ✅ **Adequate** - Functionally equivalent
- **Decision**: Keep current approach (Node.js)
- **Note**: We handle scheduling differently:
  - brief360: Celery beat (separate service)
  - projectmanager: Cron jobs in Worker service (simpler)

#### 3. **PostgreSQL**
- **Status**: ✅ **Identical** - Both use PostgreSQL 16
- **Decision**: Keep current setup

#### 4. **Redis**
- **Status**: ✅ **Identical** - Both use Redis 7
- **Decision**: Keep current setup
- **Note**: brief360 uses multiple Redis DBs:
  - DB 0: Cache
  - DB 1: Celery broker
  - DB 2: Celery results
  - DB 3: RSSHub cache
  - We should document our Redis DB usage pattern

#### 5. **RSSHub**
- **Status**: ✅ **Identical** - Both self-host RSSHub
- **Decision**: Keep current setup

---

### 🔴 Services We NEED to Add (For brief360 Features)

#### 1. **Elasticsearch** ⚠️ **HIGH PRIORITY**

**Purpose in brief360**:
- Full-text search across all articles
- Faceted search (by category, date, source)
- Semantic search using embeddings
- Article indexing and search performance

**Why we need it**:
- Issue #23 (Personalized Feed) will need article search
- Better search performance than PostgreSQL full-text search
- Supports semantic search with embeddings
- Brief360 dashboard uses Elasticsearch for article discovery

**Configuration**:
```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
  ports:
    - "9200:9200"
  volumes:
    - elasticsearch_data:/usr/share/elasticsearch/data
```

**Integration Points**:
- Index articles after RSS ingestion
- Search API for personalized feed (Issue #23)
- Filter by category, date, relevance score
- Full-text search with highlights

**Estimated Effort**: 8-12 hours
- Setup Elasticsearch service
- Article indexing job
- Search API endpoints
- Integration with personalized feed

**Priority**: **High** (for personalized feed feature)

---

### ⚠️ Services We MIGHT Need (Future Considerations)

#### 1. **MinIO** (Object Storage)

**Purpose in brief360**:
- Object storage for media files
- Archive storage
- S3-compatible API
- File uploads/downloads

**Why we might need it**:
- Future: Document uploads for knowledge base
- Future: Article media/image storage
- Future: File attachments
- Alternative: Could use Railway's storage or AWS S3

**Configuration**:
```yaml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  environment:
    - MINIO_ROOT_USER=minioadmin
    - MINIO_ROOT_PASSWORD=minioadmin123
  ports:
    - "9000:9000"  # API
    - "9001:9001"  # Console
```

**Decision**: **Optional** - Only if we need file storage
- Current architecture: No file uploads yet
- Future consideration: If we add document uploads

**Estimated Effort**: 4-6 hours (if needed)

**Priority**: **Low** (not needed for current brief360 features)

---

### ❌ Services We DON'T Need

#### 1. **pgAdmin** (Development Tool)
- **Purpose**: PostgreSQL admin UI
- **Status**: ❌ **Not needed** - Dev tool only
- **Alternative**: Use Railway's database dashboard or local tools

#### 2. **RedisInsight** (Development Tool)
- **Purpose**: Redis admin UI
- **Status**: ❌ **Not needed** - Dev tool only
- **Alternative**: Use Railway's Redis dashboard or local tools

#### 3. **Separate Backend Service** (FastAPI)
- **brief360**: Python FastAPI backend
- **projectmanager**: tRPC in Next.js (monolith)
- **Status**: ❌ **Not needed** - Our architecture is different (simpler)
- **Decision**: Keep tRPC approach

---

## 📋 Recommended Service Additions

### Immediate (For brief360 Integration)

#### **Priority 1: Elasticsearch** 🔴 **HIGH**

**Why**: Required for personalized feed search functionality (Issue #23)

**Implementation**:
1. Add Elasticsearch service to `docker-compose.yml`
2. Create article indexing job (Worker service)
3. Create search API endpoints (tRPC)
4. Integrate with personalized feed UI
5. Update Railway services (if deploying to Railway)

**Files to Create**:
- Service definition in `docker-compose.yml`
- `packages/api/lib/elasticsearch-client.ts` - ES client wrapper
- `packages/api/lib/article-indexer.ts` - Article indexing logic
- `worker/jobs/article-indexing-job.ts` - Background indexing job
- `packages/api/trpc/routers/search.ts` - Search endpoints

**Estimated Effort**: 8-12 hours

---

### Future Considerations (Not Immediate)

#### **Priority 2: MinIO** ⚠️ **OPTIONAL**

**When needed**: If we add file uploads or media storage

**Use cases**:
- Document uploads in knowledge base
- Article images/media storage
- File attachments

**Decision**: Defer until feature is needed

---

## 🏗️ Updated Architecture (With Elasticsearch)

### Current Architecture (Local Development)

```
┌─────────────────────────────────────────────────────────┐
│  Docker Compose Services                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Web    │  │  Worker  │  │  RSSHub  │             │
│  │ (3000)   │  │  (N/A)   │  │  (1200)  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│       │             │              │                    │
│       └─────────────┴──────────────┘                    │
│                  │                                      │
│       ┌──────────▼──────────┐                           │
│       │   PostgreSQL (5432) │                           │
│       │   Redis (6379)      │                           │
│       │   Elasticsearch?    │  ← NEW                    │
│       └─────────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

### Updated Architecture (After Adding Elasticsearch)

```
┌─────────────────────────────────────────────────────────┐
│  Docker Compose Services                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Web    │  │  Worker  │  │  RSSHub  │             │
│  │ (3000)   │  │  (N/A)   │  │  (1200)  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│       │             │              │                    │
│       └─────────────┴──────────────┘                    │
│                  │                                      │
│       ┌──────────▼──────────┐                           │
│       │   PostgreSQL (5432) │                           │
│       │   Redis (6379)      │                           │
│       │   Elasticsearch     │  ← ADD (9200)            │
│       │     (9200)          │                           │
│       └─────────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Plan

### Phase 1: Elasticsearch Setup (Week 1)

**Tasks**:
1. [ ] Add Elasticsearch service to `docker-compose.yml`
2. [ ] Configure Elasticsearch environment variables
3. [ ] Test Elasticsearch connection locally
4. [ ] Create Elasticsearch client wrapper
5. [ ] Document Elasticsearch usage

**Estimated Effort**: 4-6 hours

---

### Phase 2: Article Indexing (Week 2)

**Tasks**:
1. [ ] Create article indexing job (Worker service)
2. [ ] Index existing articles on startup
3. [ ] Index new articles after RSS ingestion
4. [ ] Handle article updates/deletes
5. [ ] Test indexing with large article sets

**Estimated Effort**: 6-8 hours

---

### Phase 3: Search API (Week 2-3)

**Tasks**:
1. [ ] Create search tRPC router
2. [ ] Implement full-text search
3. [ ] Implement faceted search (category, date, etc.)
4. [ ] Implement relevance score filtering
5. [ ] Add search highlighting
6. [ ] Performance testing

**Estimated Effort**: 6-8 hours

---

### Phase 4: Integration (Week 3)

**Tasks**:
1. [ ] Integrate search with personalized feed (Issue #23)
2. [ ] Add search UI component
3. [ ] Test end-to-end search flow
4. [ ] Performance optimization

**Estimated Effort**: 4-6 hours

---

## 📊 Redis Database Usage Pattern

### Current (projectmanager)
- **DB 0**: General cache, BullMQ queues (default)

### Recommended (Following brief360 Pattern)
- **DB 0**: Application cache, sessions
- **DB 1**: BullMQ job queues (broker)
- **DB 2**: BullMQ job results (if using results backend)
- **DB 3**: RSSHub cache (already configured)

**Action**: Document Redis DB usage in architecture docs

---

## 📝 Updated docker-compose.yml (Proposed)

```yaml
services:
  # ... existing services (web, worker, postgres, redis, rsshub) ...
  
  # Elasticsearch for full-text search (NEW)
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: consulting-platform-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - consulting-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
    restart: unless-stopped

volumes:
  # ... existing volumes ...
  elasticsearch_data:
    driver: local
```

---

## 🔗 Railway Deployment Considerations

**Question**: Does Railway support Elasticsearch?

**Current Railway Services**:
- ✅ PostgreSQL (managed)
- ✅ Redis (managed)
- ❌ Elasticsearch (NOT managed by Railway)

**Options**:
1. **Railway Plugin**: Check if Railway has Elasticsearch plugin
2. **Self-hosted**: Add Elasticsearch as custom service (like RSSHub)
3. **Alternative**: Use Railway's search capabilities (if available)
4. **External Service**: Use Elastic Cloud or self-hosted instance

**Recommendation**: 
- **Local dev**: Use docker-compose Elasticsearch
- **Production**: Evaluate Railway support or use external Elasticsearch service

---

## ✅ Summary

### Must Add (For brief360 Features)
1. **Elasticsearch** - Required for personalized feed search
   - Priority: **High**
   - Effort: 8-12 hours
   - Timeline: Weeks 1-3

### Optional (Future)
2. **MinIO** - Only if file storage is needed
   - Priority: **Low**
   - Effort: 4-6 hours (if needed)

### Don't Need
- pgAdmin (dev tool)
- RedisInsight (dev tool)
- Separate FastAPI backend (different architecture)

### Architecture Differences
- **brief360**: Microservices (frontend + FastAPI backend + Celery)
- **projectmanager**: Monolith (Next.js with tRPC) + Worker service
- **Decision**: Keep current architecture (simpler, adequate)

---

**Last Updated**: January 2025  
**Next Steps**: Implement Elasticsearch for Issue #23 (Personalized Feed)

