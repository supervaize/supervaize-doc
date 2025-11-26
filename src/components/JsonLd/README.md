# JSON-LD Usage Guide

This guide shows how to add JSON-LD structured data to your Docusaurus site.

## Setup

The `JsonLd` component is already set up and ready to use. It injects JSON-LD script tags into the page head.

## Usage Examples

### 1. In React Pages (like `src/pages/index.tsx`)

```tsx
import JsonLd from "@site/src/components/JsonLd";

export default function MyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "My Page Title",
    description: "Page description",
  };

  return (
    <Layout>
      <JsonLd data={jsonLd} />
      {/* Your page content */}
    </Layout>
  );
}
```

### 2. In MDX Blog Posts

Add JSON-LD to blog posts using the component:

```mdx
import JsonLd from "@site/src/components/JsonLd";
import { createArticleSchema } from "@site/src/components/JsonLd/schemas";

export const jsonLd = createArticleSchema({
  title: "My Blog Post",
  description: "Post description",
  authorName: "Author Name",
  datePublished: "2025-01-15",
  siteUrl: "https://doc.supervaize.com",
  siteName: "Supervaize Documentation",
  logoUrl: "https://doc.supervaize.com/img/supervaize-black-green.png",
});

<JsonLd data={jsonLd} />

# My Blog Post

Content here...
```

### 3. In MDX Documentation Pages

For documentation pages, you can add breadcrumbs and article schemas:

```mdx
import JsonLd from "@site/src/components/JsonLd";
import {
  createBreadcrumbSchema,
  createArticleSchema,
} from "@site/src/components/JsonLd/schemas";

export const breadcrumbJsonLd = createBreadcrumbSchema([
  { name: "Home", url: "https://doc.supervaize.com" },
  { name: "Docs", url: "https://doc.supervaize.com/docs" },
  { name: "Current Page", url: "https://doc.supervaize.com/docs/current-page" },
]);

export const articleJsonLd = createArticleSchema({
  title: "Documentation Page Title",
  description: "Page description",
  authorName: "Supervaize",
  datePublished: "2025-01-15",
  siteUrl: "https://doc.supervaize.com",
  siteName: "Supervaize Documentation",
  logoUrl: "https://doc.supervaize.com/img/supervaize-black-green.png",
});

<JsonLd data={[breadcrumbJsonLd, articleJsonLd]} />

# Documentation Page Title

Content here...
```

### 4. Global JSON-LD (in `docusaurus.config.ts`)

Global structured data like Organization schema is already configured in `docusaurus.config.ts` using the `headTags` API. This applies to all pages automatically.

## Common Schema Types

### Organization (Global)

Already configured in `docusaurus.config.ts`

### WebSite (Homepage)

Already added to `src/pages/index.tsx`

### Article (Blog Posts)

Use `createArticleSchema()` helper

### BreadcrumbList (Navigation)

Use `createBreadcrumbSchema()` helper

### HowTo (Tutorials)

Create manually or extend the schemas helper

### FAQPage

Create manually or extend the schemas helper

## Testing

1. Build your site: `npm run build`
2. Use Google's [Rich Results Test](https://search.google.com/test/rich-results)
3. Or use [Schema.org Validator](https://validator.schema.org/)

## Resources

- [Schema.org Documentation](https://schema.org/)
- [Google Structured Data Guide](https://developers.google.com/search/docs/appearance/structured-data)
- [Docusaurus headTags API](https://docusaurus.io/docs/api/docusaurus-config#headtags)
