# Railway IAC Limitations and Solutions

## The Problem: Railway's IAC Limitations

Railway's Infrastructure as Code (IAC) support is **limited** compared to platforms like Terraform, AWS CDK, or Pulumi. Here's what Railway currently supports:

### ✅ What Railway IAC CAN Do

1. **Configure Existing Services**
   - `railway.json` can configure the **default service**
   - Build settings, deployment settings, environment variables
   - Only works for **one service** (the default/service where `railway.json` is deployed)

2. **Document Service Configuration**
   - `railway-services.json` documents all services
   - But Railway **doesn't read or apply it automatically**

### ❌ What Railway IAC CANNOT Do

1. **Create Services Declaratively**
   - `railway.json` cannot create new services
   - `railway-services.json` is not supported by Railway
   - No multi-service declarative configuration

2. **Multi-Service Management**
   - Cannot manage multiple services from a single config file
   - Each service needs manual setup via Dashboard or CLI

## Why This Limitation Exists

Railway's design philosophy focuses on:
- **Simplicity**: Easy to get started without complex configs
- **Flexibility**: Services can be added via UI, CLI, or API
- **Git-based workflow**: Deployments tied to git repos, not config files

## Solutions and Workarounds

### Solution 1: Railway CLI Scripts (Current Approach)

We use `scripts/setup-railway.sh` to:
- Create services via `railway add`
- Configure services via `railway variables set`
- Manage multiple services programmatically

**Pros:**
- Works now
- Uses official Railway CLI
- Can be automated/scripted

**Cons:**
- Not truly declarative
- Requires manual script execution
- Not version-controlled service creation

**Usage:**
```bash
./scripts/setup-railway.sh
```

### Solution 2: Railway GraphQL API

Railway provides a GraphQL API for full programmatic control:

```graphql
mutation {
  serviceCreate(input: {
    projectId: "project-id"
    name: "rsshub"
  }) {
    id
    name
  }
}
```

**Pros:**
- Full control over service creation
- Can build truly declarative tools
- Programmatic access to all Railway features

**Cons:**
- Requires API authentication
- More complex to implement
- Need to handle API rate limits

**Example Script:**
```bash
# Using Railway API
curl -X POST https://api.railway.app/graphql \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { serviceCreate(input: { projectId: \"...\", name: \"rsshub\" }) { id name } }"
  }'
```

### Solution 3: Terraform Railway Provider (If Available)

If Railway had a Terraform provider, we could do:

```hcl
resource "railway_service" "web" {
  project_id = var.project_id
  name       = "web"
  
  build {
    dockerfile = "dockerfiles/Dockerfile.web"
  }
  
  deploy {
    start_command = "cd /app/web && node server.js"
  }
}
```

**Status:** Check Railway documentation for Terraform provider availability.

### Solution 4: Pulumi Railway Provider

Similar to Terraform but with code (TypeScript/Python):

```typescript
import * as railway from "@pulumi/railway";

const webService = new railway.Service("web", {
  projectId: projectId,
  name: "web",
  // ... config
});
```

**Status:** Check Pulumi registry for Railway provider.

### Solution 5: Hybrid Approach (Recommended)

Combine configuration files with automation scripts:

1. **Declarative Config Files** (`railway-services.json`)
   - Documents desired state
   - Version controlled
   - Human-readable

2. **Application Scripts** (`scripts/railway-iac-apply.sh`)
   - Reads config files
   - Creates/updates services via CLI or API
   - Idempotent (can run multiple times safely)

3. **CI/CD Integration**
   - Run scripts on git push
   - Ensure infrastructure matches code

## Current Implementation

We use **Solution 5 (Hybrid Approach)**:

### Files

1. **`railway-services.json`** - Declarative service definitions
   ```json
   {
     "services": {
       "web": { ... },
       "worker": { ... },
       "rsshub": { ... }
     }
   }
   ```

2. **`scripts/setup-railway.sh`** - Service creation and configuration
   - Uses `railway add` to create services
   - Uses `railway variables set` to configure
   - Idempotent (safe to run multiple times)

3. **`scripts/railway-iac-apply.sh`** - Advanced IAC application
   - Reads `railway-services.json`
   - Creates services programmatically
   - Configures all services from one config file

### Usage

```bash
# Setup all services
./scripts/setup-railway.sh

# Or apply IAC config
./scripts/railway-iac-apply.sh
```

## Future Improvements

### Option A: Railway API Integration

Create a Node.js/TypeScript tool that:
- Reads `railway-services.json`
- Uses Railway GraphQL API
- Creates/updates services declaratively
- Implements drift detection

**Example:**
```typescript
// railway-iac.ts
import { RailwayClient } from '@railway/app';
import config from './railway-services.json';

const client = new RailwayClient({ token: process.env.RAILWAY_TOKEN });

for (const [name, service] of Object.entries(config.services)) {
  await client.services.create({
    projectId: config.projectId,
    name,
    ...service
  });
}
```

### Option B: Custom Terraform Provider

Build a custom Terraform provider for Railway:

```hcl
terraform {
  required_providers {
    railway = {
      source  = "local/railway"
      version = "1.0.0"
    }
  }
}

resource "railway_service" "web" {
  ...
}
```

### Option C: Kubernetes-like Declarative API

If Railway adds a declarative API (similar to Kubernetes), we could:

```yaml
apiVersion: railway.app/v1
kind: Service
metadata:
  name: web
spec:
  build:
    dockerfile: dockerfiles/Dockerfile.web
  deploy:
    startCommand: cd /app/web && node server.js
```

## Recommendations

1. **For Now:** Use the hybrid approach with scripts
2. **For Production:** Consider Railway API for service creation
3. **For Enterprise:** Evaluate Terraform/Pulumi if providers exist
4. **For Future:** Monitor Railway for improved IAC support

## References

- [Railway Config-as-Code Docs](https://docs.railway.app/deploy/config-as-code)
- [Railway API Documentation](https://docs.railway.app/reference/api)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)

