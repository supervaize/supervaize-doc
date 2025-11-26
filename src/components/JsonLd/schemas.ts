/**
 * Common JSON-LD schema helpers for Docusaurus
 */

export interface ArticleSchema {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  author: {
    "@type": "Person" | "Organization";
    name: string;
    url?: string;
  };
  datePublished: string;
  dateModified?: string;
  image?: string | string[];
  publisher: {
    "@type": "Organization";
    name: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
  };
}

export interface TechArticleSchema extends ArticleSchema {
  "@type": "TechArticle";
  proficiencyLevel?: "Beginner" | "Intermediate" | "Expert";
}

export interface HowToSchema {
  "@context": "https://schema.org";
  "@type": "HowTo";
  name: string;
  description: string;
  step: Array<{
    "@type": "HowToStep";
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}

export interface FAQPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

/**
 * Create Article schema for blog posts or documentation pages
 */
export function createArticleSchema({
  title,
  description,
  authorName,
  authorUrl,
  datePublished,
  dateModified,
  image,
  siteUrl,
  siteName,
  logoUrl,
}: {
  title: string;
  description: string;
  authorName: string;
  authorUrl?: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  siteUrl: string;
  siteName: string;
  logoUrl: string;
}): ArticleSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": authorUrl ? "Person" : "Organization",
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    },
    datePublished,
    ...(dateModified && { dateModified }),
    ...(image && { image }),
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
  };
}

/**
 * Create BreadcrumbList schema for navigation
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

