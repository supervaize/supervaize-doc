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
          id: "supervaizer-controller/controller-setup",
          label: "Controller Setup Guide",
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
              id: "supervaizer-controller/API_REFERENCE",
              label: "API Reference",
            },
            {
              type: "doc",
              id: "supervaizer-controller/REST_API",
              label: "REST API",
            },
            {
              type: "doc",
              id: "supervaizer-controller/CLI",
              label: "Command Line Interface",
            },
            {
              type: "doc",
              id: "supervaizer-controller/PROTOCOLS",
              label: "Protocols",
            },
            {
              type: "doc",
              id: "supervaizer-controller/PERSISTENCE",
              label: "Persistence",
            },
            {
              type: "doc",
              id: "supervaizer-controller/CHANGELOG",
              label: "Changelog",
            },
          ],
        },
      ],
    },
  ],

  // Supervaize Fleet sidebar
  supervaizeFleetSidebar: [
    {
      type: "category",
      label: "Supervaize Fleet",
      link: {
        type: "generated-index",
        title: "Supervaize Fleet Documentation",
        description: "Documentation for Supervaize Fleet Management",
      },
      items: [
        {
          type: "doc",
          id: "supervaize-fleet/intro",
          label: "Introduction",
        },
        {
          type: "doc",
          id: "supervaize-fleet/developer-account",
          label: "Setup Development Environment",
        },
      ],
    },
  ],

  // Supervaize Studio sidebar
  supervaizeStudioSidebar: [
    {
      type: "category",
      label: "Supervaize Studio",
      link: {
        type: "generated-index",
        title: "Supervaize Studio Documentation",
        description: "Documentation for Supervaize Studio",
      },
      items: [
        {
          type: "doc",
          id: "supervaize-studio/intro",
          label: "Introduction",
        },
      ],
    },
  ],
};

export default sidebars;
