# 📚 Consailt Documentation

Welcome to the comprehensive documentation for Consailt - an AI-powered consulting intelligence platform. This documentation covers everything from product requirements to technical implementation details.

## 🎯 Quick Start

### For Developers
1. **Setup**: [Development Setup Guide](./DEVELOPMENT_SETUP.md)
2. **API**: [API Documentation](./API.md)
3. **Database**: [Drizzle ORM Guide](./DRIZZLE_ORM_GUIDE.md)
4. **Deployment**: [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### For Product Teams
1. **Overview**: [Product Requirements Document](./PRD.md)
2. **Architecture**: [System Architecture](./ARCHITECTURE.md)
3. **Features**: [API Documentation](./API.md)

### For DevOps
1. **Deployment**: [Deployment Guide](./DEPLOYMENT_GUIDE.md)
2. **Infrastructure**: [System Architecture](./ARCHITECTURE.md)
3. **Monitoring**: [API Documentation](./API.md) (Monitoring section)

## 📖 Documentation Structure

### 📋 Product Documentation
- **[PRD.md](./PRD.md)** - Product Requirements Document
  - Executive summary and vision
  - User personas and use cases
  - Feature specifications
  - Business model and pricing
  - Success metrics and KPIs

### 🏗️ Technical Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System Architecture
  - High-level system design
  - Technology stack overview
  - Data flow and processing
  - Security and compliance
  - Scalability and performance

- **[API.md](./API.md)** - API Documentation
  - Complete API reference
  - Authentication and authorization
  - Request/response examples
  - Error handling and status codes
  - Rate limiting and monitoring

- **[DRIZZLE_ORM_GUIDE.md](./DRIZZLE_ORM_GUIDE.md)** - Database Guide
  - Schema design and relationships
  - Query examples and patterns
  - Migration management
  - Performance optimization
  - Testing strategies

### 🚀 Deployment Documentation
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment Guide
  - Railway deployment setup
  - Environment configuration
  - Database and Redis setup
  - Monitoring and health checks
  - Troubleshooting common issues

- **[AWS_BEDROCK_INTEGRATION.md](./AWS_BEDROCK_INTEGRATION.md)** - AI Integration
  - AWS Bedrock setup and configuration
  - Multi-model AI orchestration
  - Cost optimization strategies
  - Streaming responses
  - Error handling and resilience

### 🛠️ Development Documentation
- **[DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)** - Development Setup
  - Local environment setup
  - Required tools and dependencies
  - Database and Redis configuration
  - Testing and debugging
  - Common troubleshooting

## 🎯 Key Features

### 🤖 AI-Powered Intelligence
- **Multi-Model Orchestration**: Intelligent model selection based on task complexity
- **Cost Optimization**: Smart routing to minimize AI costs while maintaining quality
- **Real-time Insights**: Streaming AI responses for better user experience
- **Risk Assessment**: Automated project risk analysis and mitigation strategies

### 📊 Project Management
- **Comprehensive CRUD**: Full project lifecycle management
- **Task Management**: Advanced task tracking with dependencies
- **Team Collaboration**: Real-time collaboration features
- **Knowledge Base**: RAG-powered knowledge management

### 🔐 Enterprise Security
- **Zero-Data Retention**: AI models don't store sensitive data
- **GDPR Compliance**: EU data residency and privacy protection
- **Role-Based Access**: Granular permission management
- **Audit Logging**: Complete activity tracking

### 📈 Analytics & Reporting
- **Real-time KPIs**: Live project and portfolio metrics
- **Custom Reports**: Flexible reporting and dashboard creation
- **AI Usage Tracking**: Cost and usage analytics
- **Performance Monitoring**: System health and performance metrics

## 🏗️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features and performance
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **TanStack Query** - Data fetching and caching

### Backend
- **tRPC** - End-to-end type-safe APIs
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Primary database (Neon)
- **Redis** - Caching and job queues

### AI/ML
- **AWS Bedrock** - Multi-model AI platform
- **Claude 3.7** - Advanced reasoning and analysis
- **Nova Pro/Lite** - Cost-effective project analysis
- **Mistral Large** - Technical documentation
- **Llama 3.2** - Real-time interactions

### Infrastructure
- **Railway** - Application hosting and deployment
- **Neon** - PostgreSQL database hosting
- **Clerk** - Authentication and user management
- **Sentry** - Error monitoring and tracking
- **Langfuse** - AI observability and monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js 22+ and pnpm 9+
- Docker (for local development)
- AWS account (for AI features)
- Clerk account (for authentication)

### Quick Setup
```bash
# Clone repository
git clone https://github.com/Dropicx/projectmanager.git
cd projectmanager

# Install dependencies
pnpm install

# Setup environment
cp env.example .env.local
# Edit .env.local with your configuration

# Setup database
pnpm db:push

# Start development servers
pnpm dev:all
```

### First Steps
1. **Read the PRD**: Understand the product vision and requirements
2. **Setup Development**: Follow the development setup guide
3. **Explore the API**: Check out the API documentation
4. **Deploy to Railway**: Use the deployment guide for production

## 📊 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Worker        │    │   External      │
│   (Next.js 15)  │    │   Service       │    │   Services      │
│                 │    │                 │    │                 │
│ • React 19      │    │ • BullMQ Jobs   │    │ • AWS Bedrock   │
│ • Tailwind CSS  │    │ • Cron Jobs     │    │ • Clerk Auth    │
│ • shadcn/ui     │    │ • AI Processing │    │ • Railway       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Layer    │
                    │                 │
                    │ • PostgreSQL    │
                    │ • Redis         │
                    │ • Vector DB     │
                    └─────────────────┘
```

## 🔧 Development Workflow

### Daily Development
1. **Start Services**: `pnpm dev:all`
2. **Make Changes**: Edit code with hot reload
3. **Run Tests**: `pnpm test`
4. **Type Check**: `pnpm type-check`
5. **Deploy**: `railway up`

### Database Changes
1. **Modify Schema**: Edit `packages/database/schema.ts`
2. **Generate Migration**: `pnpm db:generate`
3. **Apply Changes**: `pnpm db:push`
4. **Update Types**: `pnpm type-check`

### Adding Features
1. **Create Branch**: `git checkout -b feature/new-feature`
2. **Implement**: Add components, API endpoints, database changes
3. **Test**: Write and run tests
4. **Deploy**: Push to Railway for testing
5. **Merge**: Create pull request and merge

## 📈 Performance & Monitoring

### Key Metrics
- **Response Time**: < 100ms for API calls
- **Page Load**: < 3 seconds for web pages
- **Uptime**: 99.9% availability target
- **AI Cost**: < $0.001 per query average

### Monitoring Stack
- **Sentry**: Error tracking and performance monitoring
- **Langfuse**: AI usage and cost tracking
- **Railway**: Infrastructure monitoring
- **Custom Dashboards**: Business metrics

## 🛡️ Security & Compliance

### Security Features
- **Authentication**: Clerk-based user management
- **Authorization**: Role-based access control
- **Data Protection**: Encryption at rest and in transit
- **AI Privacy**: Zero-data-retention for AI models

### Compliance
- **GDPR**: EU data residency and privacy
- **SOC2 Type II**: Security controls (in progress)
- **ISO 27001**: Information security (planned)

## 📞 Support & Resources

### Getting Help
- **Documentation**: This comprehensive guide
- **GitHub Issues**: Bug reports and feature requests
- **Slack**: #consailt-dev channel for discussions
- **Email**: team@consailt.ai for direct support

### External Resources
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **tRPC**: [trpc.io](https://trpc.io)
- **Drizzle**: [orm.drizzle.team](https://orm.drizzle.team)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **AWS Bedrock**: [docs.aws.amazon.com/bedrock](https://docs.aws.amazon.com/bedrock)

## 🔄 Contributing

### Documentation Updates
1. **Edit Files**: Modify documentation in `/docs`
2. **Test Changes**: Verify formatting and links
3. **Commit**: Use descriptive commit messages
4. **Pull Request**: Create PR for review

### Code Contributions
1. **Fork Repository**: Create your fork
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Implement**: Add your changes with tests
4. **Test**: Run full test suite
5. **Submit PR**: Create pull request with description

## 📝 Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | January 2024 | Initial comprehensive documentation |
| 0.9.0 | January 2024 | Added technical guides |
| 0.1.0 | December 2023 | Basic documentation structure |

---

**Last Updated**: January 2024  
**Documentation Version**: 1.0.0  
**Project Version**: 1.0.0

*This documentation is maintained by the Consailt development team and is updated regularly to reflect the current state of the platform.*
