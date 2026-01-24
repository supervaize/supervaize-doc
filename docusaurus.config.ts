import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Supervaize Documentation",
  tagline: "AI Agents with confidence",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://doc.supervaize.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "supervaize", // Usually your GitHub org/user name.
  projectName: "supervaize-docs", // Usually your repo name.

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  themes: ["@saucelabs/theme-github-codeblock"],
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/supervaize/supervaize-doc/blob/main/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        gtag: {
          trackingID: "G-M9NW32J04D",
          anonymizeIP: false,
        },
      } satisfies Preset.Options,
    ],
  ],

  // Global JSON-LD structured data (Organization schema)
  headTags: [
    {
      tagName: "script",
      attributes: {
        type: "application/ld+json",
      },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Supervaize",
        url: "https://supervaize.com",
        logo: "https://doc.supervaize.com/img/supervaize-black-green.png",
        sameAs: [
          "https://github.com/supervaize",
          "https://www.linkedin.com/company/supervaize",
        ],
      }),
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/supervaize-black-green.png",
    navbar: {
      title: "supervaize",
      logo: {
        alt: "Supervaize Logo",
        src: "img/logo.svg",
        srcDark: "img/logo-dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "supervaizerControllerSidebar",
          position: "left",
          label: "Supervaizer Controller",
          activeBasePath: "/supervaizer-controller",
        },
        {
          type: "docSidebar",
          sidebarId: "supervaizeFleetSidebar",
          position: "left",
          label: "Supervaize Fleet",
          activeBasePath: "/supervaize-fleet",
        },
        {
          type: "docSidebar",
          sidebarId: "supervaizeStudioSidebar",
          position: "left",
          label: "Supervaize Studio",
          activeBasePath: "/supervaize-studio",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://github.com/supervaize",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Supervaizer Quickstart",
              to: "/docs/supervaizer-controller/quickstart",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Slack",
              href: "https://supervaize.com/join-slack",
              icon: "slack",
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/company/supervaize",
              icon: "linkedin",
            },
          ],
        },
        {
          title: "Supervaize",
          items: [
            {
              label: "Supervaize",
              href: "https://supervaize.com",
            },
          ],
        },

        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/supervaize",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Supervaize.<br> <i>Built with Docusaurus - ${new Date().toISOString()}</i>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    algolia: {
      // The application ID provided by Algolia
      appId: "4P8XL0U5MJ",

      // Public API key: it is safe to commit it
      apiKey: "5e131e92feae81bf3e2c6dda983a85e9",

      indexName: "Supervaize Doc search",
      // Optional: see doc section below
      contextualSearch: true,

      // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
      externalUrlRegex: "supervaize\\.com",

      // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
      replaceSearchResultPathname: {
        from: "/docs/", // or as RegExp: /\/docs\//
        to: "/",
      },

      // Optional: Algolia search parameters
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: "search",

      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false,

      //... other Algolia params
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
