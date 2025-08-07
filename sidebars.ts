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
      label: "Supervaize SaaS",
      items: [
        "Supervaize SaaS/intro",
        // Add more items here when Supervaize SaaS docs are created
      ],
    },
    {
      type: "category",
      label: "Internal",
      items: [
        "Internal/intro",
        {
          type: "category",
          label: "Tutorial Basics",
          items: [
            "Internal/tutorial-basics/create-a-document",
            "Internal/tutorial-basics/create-a-page",
            "Internal/tutorial-basics/create-a-blog-post",
            "Internal/tutorial-basics/markdown-features",
            "Internal/tutorial-basics/deploy-your-site",
            "Internal/tutorial-basics/congratulations",
          ],
        },
        {
          type: "category",
          label: "Tutorial Extras",
          items: [
            "Internal/tutorial-extras/manage-docs-versions",
            "Internal/tutorial-extras/translate-your-site",
          ],
        },
      ],
    },
  ],
};

export default sidebars;
