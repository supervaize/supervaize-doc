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
      items: [
        "Supervaizer Controller/intro",
        "Supervaizer Controller/model_reference",
        "Supervaizer Controller/API_REFERENCE",
        "Supervaizer Controller/REST_API",
        "Supervaizer Controller/CLI",
        "Supervaizer Controller/PROTOCOLS",
        "Supervaizer Controller/PERSISTENCE",
        "Supervaizer Controller/CHANGELOG",
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
