import type { KnowledgeTypeConfig } from "./knowledge-types";

// AI prompt templates for different knowledge types
export const typePromptTemplates: Record<string, string> = {
  "decision-record": `
    Generate a comprehensive decision record with the following structure:
    1. Context: Describe the situation and why a decision is needed
    2. Decision: State the decision clearly and concisely
    3. Rationale: Explain the reasoning behind the decision
    4. Consequences: List positive and negative impacts
    5. Implementation: Outline the action steps
    6. Review: Define success metrics and review timeline
  `,
  "solution-design": `
    Create a detailed solution design document including:
    1. Problem Statement: Define the problem being solved
    2. Solution Overview: High-level description of the solution
    3. Technical Architecture: Components, data flow, and interactions
    4. Implementation Details: Key technical decisions and approaches
    5. Testing Strategy: How the solution will be validated
    6. Deployment Plan: Rollout strategy and considerations
  `,
  "issue-analysis": `
    Perform a thorough issue analysis covering:
    1. Issue Description: What is the problem and its symptoms
    2. Root Cause Analysis: Identify underlying causes
    3. Impact Assessment: Who/what is affected and severity
    4. Resolution Options: Possible solutions with pros/cons
    5. Recommended Action: Best course of action
    6. Prevention Measures: How to avoid recurrence
  `,
  "method-process": `
    Document a method or process with:
    1. Purpose: Why this method exists
    2. Prerequisites: What's needed before starting
    3. Step-by-Step Instructions: Detailed walkthrough
    4. Best Practices: Tips for optimal results
    5. Common Pitfalls: What to avoid
    6. Validation: How to verify correct execution
  `,
  template: `
    Create a reusable template that includes:
    1. Template Purpose: When and why to use this template
    2. Instructions: How to properly use the template
    3. Structure: The template format with placeholders
    4. Examples: Sample filled-out versions
    5. Customization Guide: How to adapt for specific needs
    6. Quality Checklist: Ensure completeness
  `,
  "reference-guide": `
    Develop a comprehensive reference guide with:
    1. Overview: Introduction to the topic
    2. Core Concepts: Essential terminology and principles
    3. Detailed Information: In-depth coverage of key areas
    4. Quick Reference: Summary tables or lists
    5. Examples: Practical demonstrations
    6. Additional Resources: Links and further reading
  `,
  "case-study": `
    Write a detailed case study including:
    1. Background: Context and initial situation
    2. Challenge: Problems or opportunities identified
    3. Approach: Methods and strategies employed
    4. Implementation: How the solution was executed
    5. Results: Outcomes and metrics
    6. Lessons Learned: Key takeaways and insights
  `,
  "action-plan": `
    Create a comprehensive action plan with:
    1. Objective: Clear goal statement
    2. Current State: Baseline assessment
    3. Tasks: Detailed action items with owners
    4. Timeline: Schedule with milestones
    5. Resources: Required people, budget, tools
    6. Success Metrics: How to measure achievement
  `,
};

// Generate AI prompt based on type config and partial data
export function generateAIPrompt(
  typeConfig: KnowledgeTypeConfig,
  partialData?: Record<string, any>,
  specificField?: string
): string {
  const basePrompt =
    typePromptTemplates[typeConfig.id] || "Generate comprehensive knowledge content.";

  let prompt = `You are creating a ${typeConfig.name}. ${typeConfig.description}\n\n`;
  prompt += basePrompt;

  // Add context from partial data if available
  if (partialData) {
    prompt += "\n\nContext from existing data:\n";

    typeConfig.sections.forEach((section) => {
      const sectionData = partialData[section.id];
      if (sectionData) {
        prompt += `\n${section.title}:\n`;
        section.fields.forEach((field) => {
          const fieldId = field.id || (field as any).key;
          if (sectionData[fieldId]) {
            prompt += `- ${field.label}: ${sectionData[fieldId]}\n`;
          }
        });
      }
    });
  }

  // Add specific field guidance if requested
  if (specificField) {
    const field = typeConfig.sections
      .flatMap((s) => s.fields)
      .find((f) => (f.id || (f as any).key) === specificField);

    if (field) {
      prompt += `\n\nFocus specifically on generating content for: ${field.label}`;
      if ((field as any).helpText || (field as any).description) {
        prompt += `\nGuidance: ${(field as any).helpText || (field as any).description}`;
      }
      if (field.placeholder) {
        prompt += `\nExample format: ${field.placeholder}`;
      }
    }
  }

  // Add custom prompts if configured
  if (typeConfig.aiFeatures?.customPrompts) {
    prompt += "\n\nAdditional requirements:\n";
    typeConfig.aiFeatures.customPrompts.forEach((customPrompt, index) => {
      prompt += `${index + 1}. ${customPrompt}\n`;
    });
  }

  return prompt;
}

// Generate summary from structured data
export function generateSummaryPrompt(
  typeConfig: KnowledgeTypeConfig,
  structuredData: Record<string, any>
): string {
  let prompt = `Generate a concise summary (2-3 sentences) for this ${typeConfig.name}.\n\n`;

  prompt += "Key information:\n";
  typeConfig.sections.forEach((section) => {
    const sectionData = structuredData[section.id];
    if (sectionData && section.required) {
      section.fields.forEach((field) => {
        const fieldId = field.id || (field as any).key;
        if (field.required && sectionData[fieldId]) {
          prompt += `- ${field.label}: ${sectionData[fieldId]}\n`;
        }
      });
    }
  });

  prompt += "\nCreate a summary that captures the essence and key decisions/outcomes.";
  return prompt;
}

// Generate tags based on content
export function generateTagsPrompt(typeConfig: KnowledgeTypeConfig, content: string): string {
  return `Analyze this ${typeConfig.name} content and generate 3-5 relevant tags.

Content: ${content.substring(0, 1000)}...

Generate tags that are:
- Specific to the domain and topic
- Useful for categorization and search
- Single words or short phrases
- Relevant to ${typeConfig.name} type of knowledge

Return tags as a comma-separated list.`;
}

// Suggest related knowledge items
export function generateRelatedPrompt(
  typeConfig: KnowledgeTypeConfig,
  title: string,
  tags: string[]
): string {
  return `Based on a ${typeConfig.name} titled "${title}" with tags [${tags.join(", ")}],
suggest 3-5 related knowledge items that would be valuable to link or reference.

For each suggestion provide:
- Title: A descriptive name
- Type: What kind of knowledge item (${["decision", "solution", "issue", "method", "template", "reference", "case study", "action plan"].join(", ")})
- Relevance: Why it's related (1 sentence)

Format as a numbered list.`;
}

// Validate completeness of structured data
export function validateStructuredData(
  typeConfig: KnowledgeTypeConfig,
  structuredData: Record<string, any>
): {
  isComplete: boolean;
  missingRequired: string[];
  completionPercentage: number;
} {
  const missingRequired: string[] = [];
  let totalFields = 0;
  let completedFields = 0;

  typeConfig.sections.forEach((section) => {
    const sectionData = structuredData[section.id] || {};

    section.fields.forEach((field) => {
      const fieldId = field.id || (field as any).key;
      totalFields++;
      if (sectionData[fieldId]) {
        completedFields++;
      } else if (field.required) {
        missingRequired.push(`${section.title} > ${field.label}`);
      }
    });
  });

  return {
    isComplete: missingRequired.length === 0,
    missingRequired,
    completionPercentage: Math.round((completedFields / totalFields) * 100),
  };
}

// Generate improvement suggestions
export function generateImprovementPrompt(
  typeConfig: KnowledgeTypeConfig,
  content: string,
  structuredData?: Record<string, any>
): string {
  const validation = structuredData ? validateStructuredData(typeConfig, structuredData) : null;

  let prompt = `Review this ${typeConfig.name} and suggest improvements.\n\n`;

  if (validation && !validation.isComplete) {
    prompt += `Missing required fields: ${validation.missingRequired.join(", ")}\n`;
    prompt += `Completion: ${validation.completionPercentage}%\n\n`;
  }

  prompt += `Content excerpt: ${content.substring(0, 500)}...\n\n`;

  prompt += `Provide 3-5 specific suggestions to improve:
- Clarity and completeness
- Structure and organization
- Actionability and usefulness
- Alignment with ${typeConfig.name} best practices`;

  return prompt;
}

// Export type-specific AI features configuration
export interface AIFeatureConfig {
  enabled: boolean;
  prompt: string;
  model?: "fast" | "balanced" | "advanced";
  maxTokens?: number;
}

export function getAIFeaturesForType(typeId: string): Record<string, AIFeatureConfig> {
  const features: Record<string, AIFeatureConfig> = {
    generateSummary: {
      enabled: true,
      prompt: typePromptTemplates[typeId] || "",
      model: "fast",
      maxTokens: 150,
    },
    suggestRelated: {
      enabled: true,
      prompt: "Suggest related knowledge items",
      model: "fast",
      maxTokens: 200,
    },
    autoTag: {
      enabled: true,
      prompt: "Generate relevant tags",
      model: "fast",
      maxTokens: 50,
    },
    improveContent: {
      enabled: true,
      prompt: "Suggest improvements",
      model: "balanced",
      maxTokens: 300,
    },
    fillTemplate: {
      enabled: true,
      prompt: "Fill in template fields",
      model: "advanced",
      maxTokens: 1000,
    },
  };

  // Customize features based on type
  switch (typeId) {
    case "decision-record":
      features.generateRationale = {
        enabled: true,
        prompt: "Generate decision rationale based on context",
        model: "balanced",
        maxTokens: 300,
      };
      break;
    case "solution-design":
      features.generateArchitecture = {
        enabled: true,
        prompt: "Suggest technical architecture",
        model: "advanced",
        maxTokens: 500,
      };
      break;
    case "issue-analysis":
      features.rootCauseAnalysis = {
        enabled: true,
        prompt: "Perform root cause analysis",
        model: "balanced",
        maxTokens: 400,
      };
      break;
    case "action-plan":
      features.generateTimeline = {
        enabled: true,
        prompt: "Create realistic timeline with milestones",
        model: "balanced",
        maxTokens: 300,
      };
      break;
  }

  return features;
}
