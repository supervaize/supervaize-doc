import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Manual sidebar configuration
  docs: [
    // Internal Documentation

    // Supervaizer Controller Documentation
    {
      type: "category",
      label: "Supervaizer Controller",
      link: {
        type: "generated-index",
        slug: "supervaizer-controller",
      },
      items: [
        {
          type: "doc",
          id: "supervaizer-controller/intro",
          label: "Introduction",
        },
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

    // Supervaize SaaS Documentation
    {
      type: "category",
      label: "Supervaize Fleet Management",
      items: [
        "Supervaize Fleet/intro",
        // Add more items here when Supervaize SaaS docs are created
      ],
    },
    // Supervaize SaaS Documentation
    {
      type: "category",
      label: "Supervaize Studio",
      items: [
        "Supervaize Studio/intro",
        // Add more items here when Supervaize SaaS docs are created
      ],
    },
  ],
};

export default sidebars;
