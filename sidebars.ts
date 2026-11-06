import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  // Supervaizer Controller sidebar
  supervaizerControllerSidebar: [
    {
      type: "category",
      label: "Supervaizer Controller",
      collapsible: true,
      collapsed: false,
      link: {
        type: "generated-index",
        title: "Supervaizer Controller Documentation",
        description: "Documentation for the Supervaizer Controller",
      },
      items: [
        {
          type: "doc",
          id: "supervaizer-controller/quickstart",
          label: "Quick Start",
        },
        {
          type: "doc",
          id: "supervaizer-controller/core-concepts",
          label: "Missions, Jobs, Cases, Steps",
        },
        {
          type: "doc",
          id: "supervaizer-controller/controller-setup",
          label: "Build Your Controller",
        },
        {
          type: "doc",
          id: "supervaizer-controller/parameters",
          label: "Parameters and Secrets",
        },
        {
          type: "doc",
          id: "supervaizer-controller/human-in-the-loop",
          label: "Human in the Loop",
        },
        {
          type: "doc",
          id: "supervaizer-controller/resources",
          label: "Shared Resources",
        },
        {
          type: "doc",
          id: "supervaizer-controller/cost-reporting",
          label: "Cost Reporting",
        },
        {
          type: "doc",
          id: "supervaizer-controller/rule-checkpoints",
          label: "Guardrail Controls",
        },
        {
          type: "doc",
          id: "supervaizer-controller/job-configurator",
          label: "Job Configurator (Configure screen)",
        },
        {
          type: "doc",
          id: "supervaizer-controller/job-analytics",
          label: "Job and Mission Analytics",
        },
        {
          type: "doc",
          id: "supervaizer-controller/deploy",
          label: "Cloud Deployment",
        },
        {
          type: "doc",
          id: "supervaizer-controller/network-security",
          label: "Network Security",
        },
        {
          type: "doc",
          id: "supervaizer-controller/troubleshooting",
          label: "Troubleshooting",
        },

        {
          type: "category",
          label: "Technical Documentation",
          collapsible: true,
          collapsed: true,
          link: {
            type: "generated-index",
            title: "Technical Documentation",
            description:
              "Advanced technical documentation for developers and contributors",
            slug: "category/technical-documentation",
          },
          items: [
            {
              type: "doc",
              id: "supervaizer-controller/model_reference/model_core",
              label: "Core Model Reference",
            },
            {
              type: "doc",
              id: "supervaizer-controller/model_reference/model_extra",
              label: "Extended Model Reference",
            },
            // The ref/ files are copies of the SDK docs/ folder
            // (`just generate-docs` in the supervaizer repo). Keep the SDK file names.
            {
              type: "doc",
              id: "supervaizer-controller/ref/2026_05_SUPERVAIZER_v2",
              label: "Supervaizer v2 Contract",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2026_05_PROTOCOLS",
              label: "Protocols",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2026_05_WORKSPACE_AGENT_GRANTS",
              label: "Workspace Agent Grants",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2026_10_GUIDED_SETUP_CONTRACT",
              label: "Guided Setup Contract",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2026_10_SCHEDULED_START",
              label: "Scheduled Start",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2026_10_BILLABLE_CONSUMPTION",
              label: "Billable Consumption",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2025_08_PARAMETER_VALIDATION",
              label: "Parameter Validation",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2025_08_REST_API",
              label: "REST API",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2025_08_CLI",
              label: "Command Line Interface",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2025_08_PERSISTENCE",
              label: "Persistence",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/2025_08_ADMIN_README",
              label: "Admin Documentation",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/CHANGELOG",
              label: "Changelog",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/README",
              label: "README",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/LICENSE",
              label: "License",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/CONTRIBUTING",
              label: "Contributing",
            },
            {
              type: "doc",
              id: "supervaizer-controller/Tunneling-setup",
              label: "Tunneling Setup",
            },
          ],
        },
      ],
    },
  ],

  // Supervaize Studio sidebar
  supervaizeFleetSidebar: [
    {
      type: "category",
      label: "Supervaize Studio",
      link: {
        type: "generated-index",
        title: "Supervaize Studio Documentation",
        description: "Documentation for Supervaize Studio Management",
        slug: "category/supervaize-studio",
      },
      items: [
        {
          type: "doc",
          id: "supervaize-fleet/intro",
          label: "Introduction",
        },
        {
          type: "doc",
          id: "supervaize-fleet/features/overview",
          label: "Platform Overview",
        },
        {
          type: "category",
          label: "Features",
          collapsible: true,
          collapsed: false,
          items: [
            {
              type: "doc",
              id: "supervaize-fleet/features/agent-management",
              label: "Agent Management",
            },
            {
              type: "doc",
              id: "supervaize-fleet/features/mission-management",
              label: "Create a Mission",
            },
            {
              type: "doc",
              id: "supervaize-fleet/features/context-management",
              label: "Context Management",
            },
            {
              type: "doc",
              id: "supervaize-fleet/features/job-management",
              label: "Create a Job",
            },
            {
              type: "doc",
              id: "supervaize-fleet/features/job-navigation",
              label: "Navigate a Job",
            },
            {
              type: "doc",
              id: "supervaize-fleet/features/case-management",
              label: "Case Management",
            },
            {
              type: "doc",
              id: "supervaize-fleet/features/rating-analytics",
              label: "Rating & Analytics",
            },
            {
              type: "doc",
              id: "supervaize-fleet/features/slack-notifications",
              label: "Notifications and Slack",
            },
          ],
        },
        {
          type: "category",
          label: "Rules (Jev) · Beta Preview",
          collapsible: true,
          collapsed: false,
          items: [
            {
              type: "doc",
              id: "supervaize-fleet/rules/setup",
              label: "Set Up Rules",
            },
            {
              type: "doc",
              id: "supervaize-fleet/rules/run-and-review",
              label: "Run and Review",
            },
          ],
        },
        {
          type: "category",
          label: "Aidan Interview Campaigns",
          collapsible: true,
          collapsed: false,
          items: [
            {
              type: "doc",
              id: "supervaize-fleet/aidan/setup",
              label: "Set Up a Campaign",
            },
            {
              type: "doc",
              id: "supervaize-fleet/aidan/scenario",
              label: "Write a Scenario",
            },
            {
              type: "doc",
              id: "supervaize-fleet/aidan/monitor",
              label: "Monitor a Campaign",
            },
          ],
        },
        {
          type: "category",
          label: "Supervaize MCP (Claude / ChatGPT)",
          collapsible: true,
          collapsed: false,
          items: [
            {
              type: "doc",
              id: "supervaize-fleet/mcp-connector/install",
              label: "Installation",
            },
            {
              type: "doc",
              id: "supervaize-fleet/mcp-connector/examples",
              label: "Example Usage",
            },
          ],
        },
        {
          type: "doc",
          id: "supervaize-fleet/developer-account",
          label: "Setup Development Environment",
        },
      ],
    },
  ],

  // The Skills Cookbook sidebar
  skillsCookbookSidebar: [
    {
      type: "doc",
      id: "skills-cookbook/intro",
      label: "Introduction",
    },
  ],

  // Integrations sidebar
  integrationsSidebar: [
    {
      type: "doc",
      id: "integrations/intro",
      label: "Introduction",
    },
    {
      type: "doc",
      id: "integrations/n8n-integration",
      label: "n8n Integration",
    },
    {
      type: "category",
      label: "Skills",
      collapsed: false,
      link: {
        type: "doc",
        id: "integrations/skills/skills-intro",
      },
      items: [
        {
          type: "doc",
          id: "integrations/skills/supervaizer-integration",
          label: "Supervaizer Integration",
        },
        {
          type: "doc",
          id: "integrations/skills/supervaize-access",
          label: "Supervaize Access",
        },
      ],
    },
  ],
};

export default sidebars;
