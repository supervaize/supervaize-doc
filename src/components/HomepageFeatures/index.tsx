import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
  link: string;
  linkText: string;
  githubMobileFallback?: {
    href: string;
    sub: string;
  };
};

const FeatureList: FeatureItem[] = [
  {
    title: translate({
      id: "homepage.features.controller.title",
      message: "Supervaizer Controller",
    }),
    Svg: () => (
      <img
        src="https://cdn.do.supervaize.com/products/supervaizer.png"
        alt="Supervaizer Controller"
        className={styles.featureSvg}
      />
    ),
    githubMobileFallback: {
      href: "https://github.com/supervaize/supervaizer",
      sub: "supervaize/supervaizer",
    },
    description: (
      <Translate id="homepage.features.controller.description">
        The Supervaizer Controller is a Python-based runtime that lets you
        register, describe, and expose your AI agents to any A2A compatible
        client. It is the too used for managing and operating AI agents in the
        Supervaize Studio platform.
      </Translate>
    ),
    link: "/docs/category/supervaizer-controller",
    linkText: translate({
      id: "homepage.features.controller.link",
      message: "Get Started",
    }),
  },
  {
    title: translate({
      id: "homepage.features.studio.title",
      message: "Supervaize Studio Management",
    }),
    Svg: () => (
      <img
        src="https://cdn.do.supervaize.com/products/supervaize-fleet.png"
        alt="Supervaize Studio "
        className={styles.featureSvg}
      />
    ),
    description: (
      <Translate id="homepage.features.studio.description">
        Supervaize is the first platform to enable non-technical teams to
        monitor, control, and support their mission-critical AI agents in real
        time. Think of it as your co-pilot for managing AI-powered operations.
      </Translate>
    ),
    link: "/docs/supervaize-fleet/intro",
    linkText: translate({
      id: "homepage.features.studio.link",
      message: "Learn More",
    }),
  },
  {
    title: translate({
      id: "homepage.features.integrations.title",
      message: "Third Party Integrations",
    }),
    Svg: () => (
      <img
        src="https://cdn.do.supervaize.com/products/supervaize-studio.png"
        alt={translate({
          id: "homepage.features.integrations.title",
          message: "Third Party Integrations",
        })}
        className={styles.featureSvg}
      />
    ),
    description: (
      <Translate id="homepage.features.integrations.description">
        Third Party Integrations are the control center that lets business
        teams integrate with third party applications and services. Discover
        integration with n8n, slack, and more.
      </Translate>
    ),
    link: "/docs/integrations/intro",
    linkText: translate({
      id: "homepage.features.integrations.link",
      message: "Explore Integrations",
    }),
  },
];

function Feature({
  title,
  Svg,
  description,
  link,
  linkText,
  githubMobileFallback,
}: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        {githubMobileFallback ? (
          <>
            <Link
              className={styles.githubMobileCard}
              href={githubMobileFallback.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.githubMobileCardTitle}>
                <Translate id="homepage.features.viewOnGithub">View on GitHub →</Translate>
              </span>
              <span className={styles.githubMobileCardSub}>{githubMobileFallback.sub}</span>
            </Link>
            <div className={styles.featureDesktopImage}>
              <Svg className={styles.featureSvg} role="img" />
            </div>
          </>
        ) : (
          <Svg className={styles.featureSvg} role="img" />
        )}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link className="button button--primary button--lg" to={link}>
          {linkText}
        </Link>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
