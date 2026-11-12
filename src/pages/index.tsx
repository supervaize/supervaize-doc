import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import JsonLd from "@site/src/components/JsonLd";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner, styles.heroRunwaize)}>
      <div className={clsx("container", styles.heroContainer)}>
        <Heading as="h1" className={clsx("hero__title", styles.heroTitle)}>
          <span className={styles.heroTitleMobile}>
            <Translate id="homepage.hero.title.mobile">Runwaize Docs</Translate>
          </span>
          <span className={styles.heroTitleDesktop}>
            Runwaize{" "}
            <span className={styles.heroTitleGreen}>
              <Translate id="homepage.hero.title.desktop">Documentation</Translate>
            </span>
          </span>
        </Heading>
        <p className="hero__subtitle">
          {/* Same text as siteConfig.tagline: Translate needs a static string */}
          <Translate id="homepage.tagline">AI Agents with confidence</Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx("button button--secondary button--lg", styles.gettingStartedButton)}
            to="/docs/supervaizer-controller/quickstart"
          >
            <span className={styles.gettingStartedLabelMobile}>
              <Translate id="homepage.hero.cta.mobile">Getting started · 10 min</Translate>
            </span>
            <span className={styles.gettingStartedLabelDesktop}>
              <Translate id="homepage.hero.cta.desktop">
                Getting Started with Supervaizer Controller - 10min ⏱️
              </Translate>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  // JSON-LD structured data for the homepage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.title,
    description: siteConfig.tagline,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Layout
      title={translate(
        { id: "homepage.meta.title", message: "{title} Documentation" },
        { title: siteConfig.title },
      )}
      description={translate({
        id: "homepage.meta.description",
        message: "Documentation for Runwaize",
      })}
    >
      <JsonLd data={jsonLd} />
      <HomepageHeader />
      <main className={styles.homeMain}>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
