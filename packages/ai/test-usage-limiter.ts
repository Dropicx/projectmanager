#!/usr/bin/env tsx

/**
 * Test script for AWS Bedrock usage limiter
 * Run with: pnpm tsx packages/ai/test-usage-limiter.ts
 */

import { UsageLimiter } from './usage-limiter'
import { db } from '@consulting-platform/database'
import { organizations } from '@consulting-platform/database/schema'
import { eq } from 'drizzle-orm'

async function testUsageLimiter() {
  console.log('\n🧪 Testing AWS Bedrock Usage Limiter\n')

  const limiter = new UsageLimiter()

  // Test organization ID (you'll need a real one from your database)
  const testOrgId = 'test-org-123' // Replace with a real organization ID

  try {
    console.log('1️⃣  Testing budget check for different models...\n')

    // Test with Nova Lite (cheapest)
    const novaLiteCheck = await limiter.checkBudget(
      testOrgId,
      'nova-lite',
      10000 // 10k tokens
    )
    console.log('Nova Lite (10k tokens):', novaLiteCheck.allowed ? '✅ Allowed' : '❌ Blocked')
    if (novaLiteCheck.stats) {
      console.log(`   Monthly: $${(novaLiteCheck.stats.monthlyUsed/100).toFixed(2)} / $${(novaLiteCheck.stats.monthlyLimit/100).toFixed(2)}`)
      console.log(`   Daily: $${(novaLiteCheck.stats.dailyUsed/100).toFixed(2)} / $${(novaLiteCheck.stats.dailyLimit/100).toFixed(2)}`)
    }

    // Test with Claude 3.7 (most expensive)
    const claudeCheck = await limiter.checkBudget(
      testOrgId,
      'claude-3-7-sonnet',
      10000 // 10k tokens
    )
    console.log('\nClaude 3.7 Sonnet (10k tokens):', claudeCheck.allowed ? '✅ Allowed' : '❌ Blocked')
    if (claudeCheck.stats) {
      console.log(`   Monthly: $${(claudeCheck.stats.monthlyUsed/100).toFixed(2)} / $${(claudeCheck.stats.monthlyLimit/100).toFixed(2)}`)
      console.log(`   Daily: $${(claudeCheck.stats.dailyUsed/100).toFixed(2)} / $${(claudeCheck.stats.dailyLimit/100).toFixed(2)}`)
    }

    console.log('\n2️⃣  Testing usage recording...\n')

    // Record a small usage
    await limiter.recordUsage(
      testOrgId,
      'test-user-123',
      'test-project-456',
      'nova-lite',
      'Test prompt for budget tracking',
      'Test response from AI model',
      5000, // 5k tokens
      1234  // latency in ms
    )
    console.log('✅ Recorded usage for Nova Lite (5k tokens)')

    // Check stats after recording
    const stats = await limiter.getUsageStats(testOrgId)
    console.log('\n3️⃣  Current usage statistics:\n')
    console.log(`Monthly usage: $${(stats.monthlyUsed/100).toFixed(2)} / $${(stats.monthlyLimit/100).toFixed(2)} (${stats.percentUsed.toFixed(1)}%)`)
    console.log(`Daily usage: $${(stats.dailyUsed/100).toFixed(2)} / $${(stats.dailyLimit/100).toFixed(2)}`)
    console.log(`Near limit warning: ${stats.isNearLimit ? '⚠️ Yes' : '✅ No'}`)

    console.log('\n4️⃣  Testing tier-based limits...\n')

    const tiers = ['free', 'pro', 'enterprise'] as const
    for (const tier of tiers) {
      const limits = limiter.getDefaultLimitsForTier(tier)
      console.log(`${tier.toUpperCase()} tier:`)
      console.log(`   Monthly: $${(limits.monthly/100).toFixed(2)}`)
      console.log(`   Daily: $${(limits.daily/100).toFixed(2)}`)
    }

    console.log('\n5️⃣  Testing budget exceeded scenario...\n')

    // Try to use a huge amount of tokens with expensive model
    const hugeRequest = await limiter.checkBudget(
      testOrgId,
      'claude-3-7-sonnet',
      50_000_000 // 50M tokens - should definitely exceed budget!
    )

    if (!hugeRequest.allowed) {
      console.log('✅ Budget protection working!')
      console.log(`   Reason: ${hugeRequest.reason}`)
    } else {
      console.log('❌ WARNING: Budget protection might not be working correctly!')
    }

    console.log('\n✅ All tests completed!\n')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    // Cleanup - reset the test organization's usage (optional)
    // await db.update(organizations)
    //   .set({
    //     current_month_usage_cents: 0,
    //     current_day_usage_cents: 0
    //   })
    //   .where(eq(organizations.id, testOrgId))

    process.exit(0)
  }
}

// Run the test
testUsageLimiter().catch(console.error)