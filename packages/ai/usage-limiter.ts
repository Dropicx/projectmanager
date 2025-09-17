import { ai_interactions, db, organizations } from "@consulting-platform/database";
import { eq, sql } from "drizzle-orm";
import type { ModelType } from "./types";

export interface UsageStats {
  monthlyUsed: number;
  monthlyLimit: number;
  dailyUsed: number;
  dailyLimit: number;
  isNearLimit: boolean;
  percentUsed: number;
}

export class UsageLimiter {
  // Model cost mapping (cents per 1M tokens)
  private modelCosts: Record<ModelType, number> = {
    "claude-3-7-sonnet": 300, // $3.00
    "claude-3-5-haiku": 80, // $0.80
    "nova-pro": 80, // $0.80
    "nova-lite": 6, // $0.06
    "mistral-large": 200, // $2.00
    "llama-3-8b": 10, // $0.10
    "llama-3-70b": 50, // $0.50
  };

  /**
   * Check if organization has budget for the estimated cost
   */
  async checkBudget(
    organizationId: string,
    model: ModelType,
    estimatedTokens: number
  ): Promise<{ allowed: boolean; reason?: string; stats?: UsageStats }> {
    // Calculate estimated cost
    const estimatedCostCents = this.calculateCost(model, estimatedTokens);

    // Get organization budget info
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org) {
      return {
        allowed: false,
        reason: "Organization not found",
      };
    }

    // Check if we need to reset monthly usage (first day of month)
    await this.resetMonthlyUsageIfNeeded(organizationId, org);

    // Check if we need to reset daily usage
    await this.resetDailyUsageIfNeeded(organizationId, org);

    // Refresh org data after potential resets
    const [currentOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    const stats: UsageStats = {
      monthlyUsed: currentOrg.current_month_usage_cents || 0,
      monthlyLimit: currentOrg.monthly_budget_cents || 10000,
      dailyUsed: currentOrg.current_day_usage_cents || 0,
      dailyLimit: currentOrg.daily_limit_cents || 1000,
      isNearLimit: false,
      percentUsed: 0,
    };

    stats.percentUsed = (stats.monthlyUsed / stats.monthlyLimit) * 100;
    stats.isNearLimit = stats.percentUsed >= 80;

    // Check monthly budget
    if (stats.monthlyUsed + estimatedCostCents > stats.monthlyLimit) {
      return {
        allowed: false,
        reason: `Monthly budget exceeded. Used: $${(stats.monthlyUsed / 100).toFixed(2)}, Limit: $${(stats.monthlyLimit / 100).toFixed(2)}`,
        stats,
      };
    }

    // Check daily limit
    if (stats.dailyUsed + estimatedCostCents > stats.dailyLimit) {
      return {
        allowed: false,
        reason: `Daily limit exceeded. Used: $${(stats.dailyUsed / 100).toFixed(2)}, Limit: $${(stats.dailyLimit / 100).toFixed(2)}`,
        stats,
      };
    }

    return { allowed: true, stats };
  }

  /**
   * Record actual usage after AI call completes
   */
  async recordUsage(
    organizationId: string,
    userId: string,
    projectId: string | null,
    model: ModelType,
    prompt: string,
    response: string,
    actualTokens: number,
    latencyMs: number
  ): Promise<void> {
    const actualCostCents = this.calculateCost(model, actualTokens);

    // Start a transaction to ensure consistency
    await db.transaction(async (tx: any) => {
      // Update organization usage
      await tx
        .update(organizations)
        .set({
          current_month_usage_cents: sql`COALESCE(current_month_usage_cents, 0) + ${actualCostCents}`,
          current_day_usage_cents: sql`COALESCE(current_day_usage_cents, 0) + ${actualCostCents}`,
          updated_at: new Date(),
        })
        .where(eq(organizations.id, organizationId));

      // Record detailed interaction
      await tx.insert(ai_interactions).values({
        user_id: userId,
        project_id: projectId,
        model,
        prompt,
        response,
        tokens_used: actualTokens,
        cost_cents: actualCostCents,
        latency_ms: latencyMs,
        metadata: {
          organization_id: organizationId,
          timestamp: new Date().toISOString(),
        },
      });
    });

    // Check if we should send alerts
    await this.checkAndSendAlerts(organizationId);
  }

  /**
   * Get current usage statistics for an organization
   */
  async getUsageStats(organizationId: string): Promise<UsageStats> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org) {
      throw new Error("Organization not found");
    }

    const stats: UsageStats = {
      monthlyUsed: org.current_month_usage_cents || 0,
      monthlyLimit: org.monthly_budget_cents || 10000,
      dailyUsed: org.current_day_usage_cents || 0,
      dailyLimit: org.daily_limit_cents || 1000,
      isNearLimit: false,
      percentUsed: 0,
    };

    stats.percentUsed = (stats.monthlyUsed / stats.monthlyLimit) * 100;
    stats.isNearLimit = stats.percentUsed >= 80;

    return stats;
  }

  /**
   * Update budget limits for an organization
   */
  async updateBudgetLimits(
    organizationId: string,
    monthlyBudgetCents?: number,
    dailyLimitCents?: number
  ): Promise<void> {
    const updates: any = { updated_at: new Date() };

    if (monthlyBudgetCents !== undefined) {
      updates.monthly_budget_cents = monthlyBudgetCents;
    }

    if (dailyLimitCents !== undefined) {
      updates.daily_limit_cents = dailyLimitCents;
    }

    await db.update(organizations).set(updates).where(eq(organizations.id, organizationId));
  }

  /**
   * Calculate cost based on model and tokens
   */
  private calculateCost(model: ModelType, tokens: number): number {
    const costPer1MTokens = this.modelCosts[model] || 300; // Default to highest cost
    return Math.ceil((tokens / 1_000_000) * costPer1MTokens);
  }

  /**
   * Reset monthly usage if it's a new month
   */
  private async resetMonthlyUsageIfNeeded(organizationId: string, org: any): Promise<void> {
    const now = new Date();
    const resetDate = org.usage_reset_date ? new Date(org.usage_reset_date) : null;

    if (
      !resetDate ||
      now.getMonth() !== resetDate.getMonth() ||
      now.getFullYear() !== resetDate.getFullYear()
    ) {
      await db
        .update(organizations)
        .set({
          current_month_usage_cents: 0,
          usage_reset_date: now,
          updated_at: now,
        })
        .where(eq(organizations.id, organizationId));
    }
  }

  /**
   * Reset daily usage if it's a new day
   */
  private async resetDailyUsageIfNeeded(organizationId: string, org: any): Promise<void> {
    const now = new Date();
    const lastUpdate = org.updated_at ? new Date(org.updated_at) : null;

    if (
      !lastUpdate ||
      now.getDate() !== lastUpdate.getDate() ||
      now.getMonth() !== lastUpdate.getMonth()
    ) {
      await db
        .update(organizations)
        .set({
          current_day_usage_cents: 0,
          updated_at: now,
        })
        .where(eq(organizations.id, organizationId));
    }
  }

  /**
   * Check if alerts should be sent
   */
  private async checkAndSendAlerts(organizationId: string): Promise<void> {
    const stats = await this.getUsageStats(organizationId);

    if (stats.percentUsed >= 90) {
      console.warn(
        `⚠️ Organization ${organizationId} at ${stats.percentUsed.toFixed(1)}% of monthly budget`
      );
      // TODO: Send notification/email to org admins
    } else if (stats.percentUsed >= 80) {
      console.warn(
        `⚠️ Organization ${organizationId} at ${stats.percentUsed.toFixed(1)}% of monthly budget`
      );
      // TODO: Send notification to org admins
    }

    if (stats.dailyUsed >= stats.dailyLimit * 0.9) {
      console.warn(
        `⚠️ Organization ${organizationId} at ${((stats.dailyUsed / stats.dailyLimit) * 100).toFixed(1)}% of daily limit`
      );
      // TODO: Send notification
    }
  }

  /**
   * Estimate tokens for a prompt (rough estimation)
   */
  estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Get budget limits based on subscription tier
   */
  getDefaultLimitsForTier(tier: "free" | "pro" | "enterprise"): { monthly: number; daily: number } {
    // Use environment variables if set, otherwise use defaults
    const _defaultMonthly = parseFloat(process.env.BEDROCK_MONTHLY_BUDGET_USD || "100") * 100;
    const defaultDaily = parseFloat(process.env.BEDROCK_DAILY_LIMIT_USD || "10") * 100;

    const limits = {
      free: {
        monthly: parseFloat(process.env.BEDROCK_FREE_TIER_BUDGET_USD || "50") * 100,
        daily: defaultDaily,
      },
      pro: {
        monthly: parseFloat(process.env.BEDROCK_PRO_TIER_BUDGET_USD || "500") * 100,
        daily: defaultDaily * 5, // Pro gets 5x daily limit
      },
      enterprise: {
        monthly: parseFloat(process.env.BEDROCK_ENTERPRISE_BUDGET_USD || "2000") * 100,
        daily: defaultDaily * 20, // Enterprise gets 20x daily limit
      },
    };

    return limits[tier] || limits.free;
  }
}

export default UsageLimiter;
