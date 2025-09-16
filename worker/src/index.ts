import { Worker, Queue } from 'bullmq'
import { Redis } from 'ioredis'
import { CronJob } from 'cron'
import { AIOrchestrator } from '@consulting-platform/ai'
import { db, projects } from '@consulting-platform/database'
import { eq } from 'drizzle-orm'

// Redis connection configuration for BullMQ
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
}

// Parse Redis URL if provided
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
console.log('Worker starting with Redis URL:', redisUrl ? redisUrl.replace(/:[^:@]*@/, ':****@') : 'not set')
console.log('Environment variables available:', Object.keys(process.env).filter(k => k.includes('REDIS')))

const redis = new Redis(redisUrl, redisOptions)

// AI Orchestrator
const aiOrchestrator = new AIOrchestrator()

// Job queues with proper Redis configuration
const queueConnection = new Redis(redisUrl, redisOptions)
const aiInsightsQueue = new Queue('ai-insights', { connection: queueConnection })
const riskAssessmentQueue = new Queue('risk-assessment', { connection: queueConnection })

// Background job processors
const workerConnection1 = new Redis(redisUrl, redisOptions)
const aiInsightsWorker = new Worker(
  'ai-insights',
  async (job) => {
    const { projectId } = job.data
    
    try {
      // Get project data
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)

      if (!project.length) {
        throw new Error('Project not found')
      }

      // Generate AI insights
      const insights = await aiOrchestrator.generateProjectInsights(
        projectId,
        JSON.stringify(project[0])
      )

      // Update project with insights
      await db
        .update(projects)
        .set({
          ai_insights: {
            content: insights.content,
            model: insights.model,
            generated_at: new Date().toISOString(),
            cost_cents: insights.costCents
          },
          updated_at: new Date()
        })
        .where(eq(projects.id, projectId))

      console.log(`Generated AI insights for project ${projectId}`)
    } catch (error) {
      console.error(`Failed to generate AI insights for project ${projectId}:`, error)
      throw error
    }
  },
  {
    connection: workerConnection1,
    concurrency: 5
  }
)

const workerConnection2 = new Redis(redisUrl, redisOptions)
const riskAssessmentWorker = new Worker(
  'risk-assessment',
  async (job) => {
    const { projectId } = job.data
    
    try {
      // Get project data
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)

      if (!project.length) {
        throw new Error('Project not found')
      }

      // Assess project risk
      const riskAssessment = await aiOrchestrator.assessProjectRisk(
        projectId,
        JSON.stringify(project[0])
      )

      // Update project with risk assessment
      await db
        .update(projects)
        .set({
          risk_assessment: {
            content: riskAssessment.content,
            model: riskAssessment.model,
            assessed_at: new Date().toISOString(),
            cost_cents: riskAssessment.costCents
          },
          updated_at: new Date()
        })
        .where(eq(projects.id, projectId))

      console.log(`Completed risk assessment for project ${projectId}`)
    } catch (error) {
      console.error(`Failed to assess risk for project ${projectId}:`, error)
      throw error
    }
  },
  {
    connection: workerConnection2,
    concurrency: 3
  }
)

// Scheduled jobs
const dailyInsightsJob = new CronJob(
  '0 9 * * *', // Run at 9 AM daily
  async () => {
    console.log('Running daily AI insights generation...')
    
    // Get all active projects
    const activeProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.status, 'active'))

    // Queue AI insights for each project
    for (const project of activeProjects) {
      await aiInsightsQueue.add('daily-insights', {
        projectId: project.id
      })
    }

    console.log(`Queued AI insights for ${activeProjects.length} projects`)
  },
  null,
  true,
  'UTC'
)

const weeklyRiskAssessmentJob = new CronJob(
  '0 10 * * 1', // Run at 10 AM every Monday
  async () => {
    console.log('Running weekly risk assessment...')
    
    // Get all active projects
    const activeProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.status, 'active'))

    // Queue risk assessment for each project
    for (const project of activeProjects) {
      await riskAssessmentQueue.add('weekly-risk-assessment', {
        projectId: project.id
      })
    }

    console.log(`Queued risk assessment for ${activeProjects.length} projects`)
  },
  null,
  true,
  'UTC'
)

// Error handling
aiInsightsWorker.on('error', (error) => {
  console.error('AI Insights Worker error:', error)
})

riskAssessmentWorker.on('error', (error) => {
  console.error('Risk Assessment Worker error:', error)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down workers...')
  await aiInsightsWorker.close()
  await riskAssessmentWorker.close()
  await aiInsightsQueue.close()
  await riskAssessmentQueue.close()
  await redis.quit()
  await queueConnection.quit()
  await workerConnection1.quit()
  await workerConnection2.quit()
  process.exit(0)
})

console.log('Background workers started successfully')
