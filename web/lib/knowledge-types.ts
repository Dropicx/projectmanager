/**
 * Knowledge Type System Configuration
 * Defines structured templates and features for each knowledge type
 */

export interface TypeField {
  id: string; // Keep id for consistency
  key?: string; // Optional key for backward compatibility
  label: string;
  description?: string;
  helpText?: string; // Add helpText as alias for description
  required?: boolean;
  type: "text" | "textarea" | "date" | "select" | "checklist" | "number";
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

export interface TypeSection {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  fields: TypeField[];
  aiPrompt?: string; // AI prompt to help fill this section
}

export interface KnowledgeTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sections: TypeSection[];
  aiFeatures: {
    generateSummary?: boolean;
    suggestRelated?: boolean;
    autoTag?: boolean;
    customPrompts?: string[];
  };
  exportFormats?: string[];
  workflow?: {
    requiresApproval?: boolean;
    reviewCycle?: number; // days
    notifyOnCreate?: string[]; // role IDs
  };
}

export const KNOWLEDGE_TYPES: Record<string, KnowledgeTypeConfig> = {
  note: {
    id: "note",
    name: "Simple Note",
    description: "Quick notes and free-form documentation",
    icon: "📝",
    color: "gray",
    sections: [
      {
        id: "content",
        title: "Content",
        description: "Write your note or documentation here",
        fields: [
          {
            id: "body",
            label: "Note Content",
            type: "textarea",
            required: true,
            placeholder: "Start writing your note, documentation, or any other content...",
          },
        ],
      },
    ],
    aiFeatures: {
      generateSummary: true,
      autoTag: true,
    },
    exportFormats: ["md", "pdf", "docx"],
  },
  decision: {
    id: "decision",
    name: "Decision Record",
    description: "Document important decisions with context and rationale",
    icon: "Scale",
    color: "blue",
    sections: [
      {
        id: "context",
        title: "Context & Background",
        description: "What led to this decision being needed?",
        fields: [
          {
            id: "situation",
            label: "Situation",
            type: "textarea",
            required: true,
            placeholder: "Describe the situation requiring a decision...",
          },
          {
            id: "stakeholders",
            label: "Stakeholders",
            type: "text",
            placeholder: "Who is affected by this decision?",
          },
          {
            id: "constraints",
            label: "Constraints",
            type: "textarea",
            placeholder: "Time, budget, technical, or other constraints...",
          },
        ],
        aiPrompt: "Help me describe the context and background for this decision",
      },
      {
        id: "options",
        title: "Options Considered",
        description: "What alternatives were evaluated?",
        fields: [
          {
            id: "options",
            label: "Options",
            type: "textarea",
            required: true,
            placeholder: "List each option with pros and cons...",
          },
          {
            id: "criteria",
            label: "Evaluation Criteria",
            type: "textarea",
            placeholder: "What criteria were used to evaluate options?",
          },
        ],
        aiPrompt: "Generate a pros and cons analysis for each option",
      },
      {
        id: "decision",
        title: "Decision Made",
        description: "What was decided and why?",
        fields: [
          {
            id: "choice",
            label: "Chosen Option",
            type: "text",
            required: true,
            placeholder: "Which option was selected?",
          },
          {
            id: "rationale",
            label: "Rationale",
            type: "textarea",
            required: true,
            placeholder: "Why was this option chosen?",
          },
          {
            id: "risks",
            label: "Risks & Mitigations",
            type: "textarea",
            placeholder: "What risks exist and how will they be managed?",
          },
        ],
      },
      {
        id: "followup",
        title: "Follow-up",
        fields: [
          {
            id: "reviewDate",
            label: "Review Date",
            type: "date",
            placeholder: "When should this decision be reviewed?",
          },
          {
            id: "successMetrics",
            label: "Success Metrics",
            type: "textarea",
            placeholder: "How will we measure if this was the right decision?",
          },
        ],
      },
    ],
    aiFeatures: {
      generateSummary: true,
      suggestRelated: true,
      autoTag: true,
      customPrompts: [
        "Identify potential risks in this decision",
        "Suggest success metrics",
        "Find similar past decisions",
      ],
    },
    workflow: {
      requiresApproval: true,
      reviewCycle: 90,
      notifyOnCreate: ["team-lead", "stakeholder"],
    },
  },

  solution: {
    id: "solution",
    name: "Solution Design",
    description: "Document technical solutions and architectures",
    icon: "Lightbulb",
    color: "green",
    sections: [
      {
        id: "problem",
        title: "Problem Statement",
        fields: [
          {
            id: "problem",
            label: "Problem Description",
            type: "textarea",
            required: true,
            placeholder: "What problem does this solve?",
          },
          {
            id: "impact",
            label: "Business Impact",
            type: "textarea",
            placeholder: "What's the impact of not solving this?",
          },
        ],
        aiPrompt: "Help articulate the problem and its business impact",
      },
      {
        id: "requirements",
        title: "Requirements",
        fields: [
          {
            id: "functional",
            label: "Functional Requirements",
            type: "textarea",
            required: true,
            placeholder: "What must the solution do?",
          },
          {
            id: "nonfunctional",
            label: "Non-functional Requirements",
            type: "textarea",
            placeholder: "Performance, security, scalability needs...",
          },
        ],
      },
      {
        id: "solution",
        title: "Proposed Solution",
        fields: [
          {
            id: "approach",
            label: "Solution Approach",
            type: "textarea",
            required: true,
            placeholder: "Describe the solution approach...",
          },
          {
            id: "architecture",
            label: "Architecture/Design",
            type: "textarea",
            placeholder: "Technical architecture and design details...",
          },
          {
            id: "technologies",
            label: "Technologies Used",
            type: "text",
            placeholder: "List key technologies and tools...",
          },
        ],
        aiPrompt: "Suggest architectural patterns and best practices",
      },
      {
        id: "implementation",
        title: "Implementation",
        fields: [
          {
            id: "steps",
            label: "Implementation Steps",
            type: "textarea",
            placeholder: "High-level implementation plan...",
          },
          {
            id: "timeline",
            label: "Estimated Timeline",
            type: "text",
            placeholder: "Expected duration and milestones...",
          },
          {
            id: "resources",
            label: "Resources Required",
            type: "textarea",
            placeholder: "Team, tools, and other resources needed...",
          },
        ],
      },
    ],
    aiFeatures: {
      generateSummary: true,
      suggestRelated: true,
      autoTag: true,
      customPrompts: [
        "Generate implementation checklist",
        "Identify potential technical risks",
        "Suggest alternative approaches",
      ],
    },
  },

  issue: {
    id: "issue",
    name: "Issue Analysis",
    description: "Track and analyze problems with root cause analysis",
    icon: "AlertCircle",
    color: "red",
    sections: [
      {
        id: "description",
        title: "Issue Description",
        fields: [
          {
            id: "title",
            label: "Issue Title",
            type: "text",
            required: true,
            placeholder: "Brief description of the issue...",
          },
          {
            id: "details",
            label: "Detailed Description",
            type: "textarea",
            required: true,
            placeholder: "Full details of what happened...",
          },
          {
            id: "severity",
            label: "Severity",
            type: "select",
            required: true,
            options: [
              { value: "critical", label: "Critical" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ],
          },
          {
            id: "dateOccurred",
            label: "Date Occurred",
            type: "date",
          },
        ],
      },
      {
        id: "analysis",
        title: "Root Cause Analysis",
        fields: [
          {
            id: "symptoms",
            label: "Symptoms",
            type: "textarea",
            placeholder: "What were the observable symptoms?",
          },
          {
            id: "rootCause",
            label: "Root Cause",
            type: "textarea",
            required: true,
            placeholder: "What was the underlying cause?",
          },
          {
            id: "contributing",
            label: "Contributing Factors",
            type: "textarea",
            placeholder: "What factors contributed to this issue?",
          },
        ],
        aiPrompt: "Help identify root causes using 5-why analysis",
      },
      {
        id: "impact",
        title: "Impact Assessment",
        fields: [
          {
            id: "affected",
            label: "Systems/People Affected",
            type: "textarea",
            placeholder: "Who or what was impacted?",
          },
          {
            id: "duration",
            label: "Duration",
            type: "text",
            placeholder: "How long did the issue persist?",
          },
          {
            id: "cost",
            label: "Estimated Cost/Impact",
            type: "text",
            placeholder: "Financial or other measurable impact...",
          },
        ],
      },
      {
        id: "resolution",
        title: "Resolution & Prevention",
        fields: [
          {
            id: "immediateAction",
            label: "Immediate Actions Taken",
            type: "textarea",
            placeholder: "What was done to resolve the issue?",
          },
          {
            id: "preventiveMeasures",
            label: "Preventive Measures",
            type: "textarea",
            required: true,
            placeholder: "How will we prevent this in the future?",
          },
          {
            id: "lessonsLearned",
            label: "Lessons Learned",
            type: "textarea",
            placeholder: "What did we learn from this incident?",
          },
        ],
      },
    ],
    aiFeatures: {
      generateSummary: true,
      suggestRelated: true,
      autoTag: true,
      customPrompts: [
        "Identify patterns in similar issues",
        "Suggest preventive measures",
        "Generate incident report",
      ],
    },
    workflow: {
      notifyOnCreate: ["tech-lead", "manager"],
    },
  },

  pattern: {
    id: "pattern",
    name: "Method/Process",
    description: "Document reusable methods, processes, and patterns",
    icon: "GitBranch",
    color: "purple",
    sections: [
      {
        id: "overview",
        title: "Overview",
        fields: [
          {
            id: "name",
            label: "Method Name",
            type: "text",
            required: true,
            placeholder: "Name of the method or process...",
          },
          {
            id: "purpose",
            label: "Purpose",
            type: "textarea",
            required: true,
            placeholder: "What does this method achieve?",
          },
          {
            id: "useWhen",
            label: "When to Use",
            type: "textarea",
            placeholder: "In what situations should this be used?",
          },
        ],
      },
      {
        id: "prerequisites",
        title: "Prerequisites",
        fields: [
          {
            id: "requirements",
            label: "Requirements",
            type: "textarea",
            placeholder: "What needs to be in place before starting?",
          },
          {
            id: "skills",
            label: "Required Skills",
            type: "text",
            placeholder: "What skills or knowledge is needed?",
          },
          {
            id: "tools",
            label: "Tools Required",
            type: "text",
            placeholder: "What tools or resources are needed?",
          },
        ],
      },
      {
        id: "process",
        title: "Step-by-Step Process",
        fields: [
          {
            id: "steps",
            label: "Process Steps",
            type: "textarea",
            required: true,
            placeholder: "1. First step\n2. Second step\n3. Third step...",
          },
          {
            id: "timeline",
            label: "Typical Timeline",
            type: "text",
            placeholder: "How long does this usually take?",
          },
        ],
        aiPrompt: "Help structure this process into clear, actionable steps",
      },
      {
        id: "bestPractices",
        title: "Best Practices & Tips",
        fields: [
          {
            id: "dos",
            label: "Best Practices",
            type: "textarea",
            placeholder: "What should you always do?",
          },
          {
            id: "donts",
            label: "Common Pitfalls",
            type: "textarea",
            placeholder: "What mistakes should you avoid?",
          },
          {
            id: "tips",
            label: "Pro Tips",
            type: "textarea",
            placeholder: "Expert advice and shortcuts...",
          },
        ],
      },
    ],
    aiFeatures: {
      generateSummary: true,
      suggestRelated: true,
      customPrompts: [
        "Generate process diagram",
        "Create checklist from steps",
        "Suggest optimizations",
      ],
    },
    exportFormats: ["markdown", "checklist", "diagram"],
  },

  template: {
    id: "template",
    name: "Template",
    description: "Reusable templates and frameworks",
    icon: "FileText",
    color: "yellow",
    sections: [
      {
        id: "metadata",
        title: "Template Information",
        fields: [
          {
            id: "name",
            label: "Template Name",
            type: "text",
            required: true,
            placeholder: "Name of the template...",
          },
          {
            id: "category",
            label: "Category",
            type: "select",
            options: [
              { value: "document", label: "Document" },
              { value: "presentation", label: "Presentation" },
              { value: "analysis", label: "Analysis" },
              { value: "report", label: "Report" },
              { value: "other", label: "Other" },
            ],
          },
          {
            id: "description",
            label: "Description",
            type: "textarea",
            required: true,
            placeholder: "What is this template for?",
          },
        ],
      },
      {
        id: "usage",
        title: "Usage Guide",
        fields: [
          {
            id: "whenToUse",
            label: "When to Use",
            type: "textarea",
            placeholder: "In what situations should this template be used?",
          },
          {
            id: "instructions",
            label: "Instructions",
            type: "textarea",
            placeholder: "How to use this template effectively...",
          },
          {
            id: "variables",
            label: "Variables/Placeholders",
            type: "textarea",
            placeholder: "List all variables that need to be replaced...",
          },
        ],
      },
      {
        id: "content",
        title: "Template Content",
        fields: [
          {
            id: "template",
            label: "Template",
            type: "textarea",
            required: true,
            placeholder: "The actual template content with placeholders...",
          },
          {
            id: "example",
            label: "Example Usage",
            type: "textarea",
            placeholder: "Show an example of the filled template...",
          },
        ],
      },
    ],
    aiFeatures: {
      generateSummary: true,
      customPrompts: [
        "Generate variations of this template",
        "Fill template with sample data",
        "Suggest improvements",
      ],
    },
    exportFormats: ["word", "markdown", "html"],
  },

  reference: {
    id: "reference",
    name: "Reference Guide",
    description: "Quick reference documentation and guides",
    icon: "Book",
    color: "indigo",
    sections: [
      {
        id: "overview",
        title: "Overview",
        fields: [
          {
            id: "topic",
            label: "Topic",
            type: "text",
            required: true,
            placeholder: "What topic does this cover?",
          },
          {
            id: "summary",
            label: "Summary",
            type: "textarea",
            required: true,
            placeholder: "Brief overview of the topic...",
          },
          {
            id: "audience",
            label: "Target Audience",
            type: "text",
            placeholder: "Who is this guide for?",
          },
        ],
      },
      {
        id: "concepts",
        title: "Key Concepts",
        fields: [
          {
            id: "concepts",
            label: "Concepts & Definitions",
            type: "textarea",
            required: true,
            placeholder: "Important concepts and their definitions...",
          },
          {
            id: "terminology",
            label: "Terminology",
            type: "textarea",
            placeholder: "Special terms and jargon explained...",
          },
        ],
        aiPrompt: "Help explain complex concepts in simple terms",
      },
      {
        id: "quickReference",
        title: "Quick Reference",
        fields: [
          {
            id: "commands",
            label: "Commands/Shortcuts",
            type: "textarea",
            placeholder: "Quick commands or shortcuts...",
          },
          {
            id: "commonTasks",
            label: "Common Tasks",
            type: "textarea",
            placeholder: "How to do common tasks...",
          },
          {
            id: "troubleshooting",
            label: "Troubleshooting",
            type: "textarea",
            placeholder: "Common issues and solutions...",
          },
        ],
      },
      {
        id: "resources",
        title: "Additional Resources",
        fields: [
          {
            id: "links",
            label: "External Links",
            type: "textarea",
            placeholder: "Useful external resources...",
          },
          {
            id: "related",
            label: "Related Topics",
            type: "text",
            placeholder: "Related guides and documentation...",
          },
        ],
      },
    ],
    aiFeatures: {
      generateSummary: true,
      suggestRelated: true,
      autoTag: true,
      customPrompts: [
        "Generate FAQ section",
        "Create cheat sheet",
        "Update with latest information",
      ],
    },
  },

  insight: {
    id: "insight",
    name: "Case Study",
    description: "Document project experiences and lessons learned",
    icon: "TrendingUp",
    color: "orange",
    sections: [
      {
        id: "background",
        title: "Project Background",
        fields: [
          {
            id: "project",
            label: "Project/Client",
            type: "text",
            required: true,
            placeholder: "Project or client name...",
          },
          {
            id: "period",
            label: "Time Period",
            type: "text",
            placeholder: "When did this take place?",
          },
          {
            id: "context",
            label: "Context",
            type: "textarea",
            required: true,
            placeholder: "Background and situation...",
          },
        ],
      },
      {
        id: "challenges",
        title: "Challenges",
        fields: [
          {
            id: "challenges",
            label: "Challenges Faced",
            type: "textarea",
            required: true,
            placeholder: "What challenges were encountered?",
          },
          {
            id: "constraints",
            label: "Constraints",
            type: "textarea",
            placeholder: "What limitations existed?",
          },
        ],
      },
      {
        id: "actions",
        title: "Actions & Solutions",
        fields: [
          {
            id: "approach",
            label: "Approach Taken",
            type: "textarea",
            required: true,
            placeholder: "How were the challenges addressed?",
          },
          {
            id: "innovations",
            label: "Innovations/Creative Solutions",
            type: "textarea",
            placeholder: "Any novel approaches or solutions?",
          },
        ],
      },
      {
        id: "results",
        title: "Results & Outcomes",
        fields: [
          {
            id: "outcomes",
            label: "Outcomes",
            type: "textarea",
            required: true,
            placeholder: "What were the results?",
          },
          {
            id: "metrics",
            label: "Success Metrics",
            type: "textarea",
            placeholder: "Measurable improvements or achievements...",
          },
          {
            id: "feedback",
            label: "Client/Stakeholder Feedback",
            type: "textarea",
            placeholder: "What did stakeholders say?",
          },
        ],
      },
      {
        id: "learnings",
        title: "Key Learnings",
        fields: [
          {
            id: "lessons",
            label: "Lessons Learned",
            type: "textarea",
            required: true,
            placeholder: "What key lessons were learned?",
          },
          {
            id: "recommendations",
            label: "Recommendations",
            type: "textarea",
            placeholder: "What would you do differently?",
          },
          {
            id: "applicability",
            label: "Future Applications",
            type: "textarea",
            placeholder: "How can these learnings be applied?",
          },
        ],
        aiPrompt: "Help extract key insights and patterns",
      },
    ],
    aiFeatures: {
      generateSummary: true,
      suggestRelated: true,
      customPrompts: [
        "Extract success factors",
        "Identify patterns across cases",
        "Generate executive summary",
        "Create presentation slides",
      ],
    },
    exportFormats: ["presentation", "report", "markdown"],
  },

  action: {
    id: "action",
    name: "Action Plan",
    description: "Strategic plans with tasks and milestones",
    icon: "Target",
    color: "teal",
    sections: [
      {
        id: "objective",
        title: "Objective",
        fields: [
          {
            id: "goal",
            label: "Goal",
            type: "text",
            required: true,
            placeholder: "What is the main objective?",
          },
          {
            id: "description",
            label: "Description",
            type: "textarea",
            required: true,
            placeholder: "Detailed description of what we want to achieve...",
          },
          {
            id: "successCriteria",
            label: "Success Criteria",
            type: "textarea",
            placeholder: "How will we know we've succeeded?",
          },
        ],
      },
      {
        id: "plan",
        title: "Action Items",
        fields: [
          {
            id: "tasks",
            label: "Tasks & Milestones",
            type: "textarea",
            required: true,
            placeholder: "List all tasks with deadlines...",
          },
          {
            id: "priorities",
            label: "Priorities",
            type: "textarea",
            placeholder: "What are the most critical tasks?",
          },
          {
            id: "dependencies",
            label: "Dependencies",
            type: "textarea",
            placeholder: "What needs to happen first?",
          },
        ],
        aiPrompt: "Help break down the goal into actionable tasks",
      },
      {
        id: "resources",
        title: "Resources",
        fields: [
          {
            id: "team",
            label: "Team/Responsibilities",
            type: "textarea",
            placeholder: "Who is responsible for what?",
          },
          {
            id: "budget",
            label: "Budget/Resources",
            type: "text",
            placeholder: "What resources are needed?",
          },
          {
            id: "timeline",
            label: "Timeline",
            type: "text",
            required: true,
            placeholder: "Overall timeline and key dates...",
          },
        ],
      },
      {
        id: "risks",
        title: "Risk Management",
        fields: [
          {
            id: "risks",
            label: "Identified Risks",
            type: "textarea",
            placeholder: "What could go wrong?",
          },
          {
            id: "mitigation",
            label: "Mitigation Strategies",
            type: "textarea",
            placeholder: "How will we handle risks?",
          },
          {
            id: "contingency",
            label: "Contingency Plans",
            type: "textarea",
            placeholder: "Backup plans if things don't work out...",
          },
        ],
      },
    ],
    aiFeatures: {
      generateSummary: true,
      customPrompts: [
        "Generate Gantt chart",
        "Optimize resource allocation",
        "Identify critical path",
        "Assess risks",
      ],
    },
    workflow: {
      reviewCycle: 7,
      notifyOnCreate: ["project-manager"],
    },
    exportFormats: ["gantt", "kanban", "calendar"],
  },
};

// Helper function to get type configuration
export function getTypeConfig(typeId: string): KnowledgeTypeConfig | undefined {
  return KNOWLEDGE_TYPES[typeId];
}

// Helper function to get all type options for select inputs
export function getTypeOptions() {
  return Object.values(KNOWLEDGE_TYPES).map((type) => ({
    value: type.id,
    label: type.name,
    description: type.description,
    icon: type.icon,
    color: type.color,
  }));
}

// Export types array for components that need it
export const knowledgeTypes = Object.values(KNOWLEDGE_TYPES);

// Helper function to validate required fields
export function validateTypeFields(typeId: string, data: Record<string, any>): string[] {
  const errors: string[] = [];
  const config = getTypeConfig(typeId);

  if (!config) return errors;

  config.sections.forEach((section) => {
    section.fields.forEach((field) => {
      const fieldKey = field.id || field.key;
      if (field.required && fieldKey && !data[fieldKey]) {
        errors.push(`${field.label} is required`);
      }
    });
  });

  return errors;
}

// Helper function to get AI prompts for a type
export function getTypeAIPrompts(typeId: string): string[] {
  const config = getTypeConfig(typeId);
  if (!config) return [];

  const prompts: string[] = [];

  // Add section-specific prompts
  config.sections.forEach((section) => {
    if (section.aiPrompt) {
      prompts.push(section.aiPrompt);
    }
  });

  // Add custom prompts
  if (config.aiFeatures.customPrompts) {
    prompts.push(...config.aiFeatures.customPrompts);
  }

  return prompts;
}
