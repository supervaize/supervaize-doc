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
          label: "Core Concepts",
        },
        {
          type: "doc",
          id: "supervaizer-controller/controller-setup",
          label: "Controller Setup Guide",
        },
        {
          type: "doc",
          id: "supervaizer-controller/dynamic-choices",
          label: "Dynamic Choices",
        },
        {
          type: "doc",
          id: "supervaizer-controller/application-flow-control",
          label: "Application Flow Control",
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
            {
              type: "doc",
              id: "supervaizer-controller/ref/API_REFERENCE",
              label: "API Reference",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/REST_API",
              label: "REST API",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/CLI",
              label: "Command Line Interface",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/PROTOCOLS",
              label: "Protocols",
            },
            {
              type: "doc",
              id: "supervaizer-controller/ref/PERSISTENCE",
              label: "Persistence",
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
              id: "supervaizer-controller/ref/ADMIN_README",
              label: "Admin Documentation",
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
              label: "Mission Management",
            },
            {
              type: "doc",
              id: "supervaize-fleet/features/context-management",
              label: "Context Management",
            },
            {
              type: "doc",
              id: "supervaize-fleet/features/job-management",
              label: "Job Management",
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
              label: "Slack Notifications",
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
    {
      type: "category",
      label: "Claude Code Skills",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "skills-cookbook/claude-code-skill",
          label: "Supervaizer Integration Skill",
        },
      ],
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
