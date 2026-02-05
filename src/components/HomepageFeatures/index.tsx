import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
  link: string;
  linkText: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Supervaizer Controller",
    Svg: () => (
      <img
        src="https://cdn.do.supervaize.com/products/supervaizer.png"
        alt="Supervaizer Controller"
        className={styles.featureSvg}
      />
    ),
    description: (
      <>
        The Supervaizer Controller is a powerful Python-based runtime that lets
        you register, describe, and expose your AI agents to any A2A- or
        ACP-compatible client. It handles lifecycle management, job execution,
        agent cards, health checks, and telemetry—so developers can focus on the
        logic while operations teams gain observability and control.
      </>
    ),
    link: "/docs/category/supervaizer-controller",
    linkText: "Get Started",
  },
  {
    title: "Supervaize Fleet Management",
    Svg: () => (
      <img
        src="https://cdn.do.supervaize.com/products/supervaize-fleet.png"
        alt="Supervaize Fleet Management"
        className={styles.featureSvg}
      />
    ),
    description: (
      <>
        Supervaize is the first platform to enable non-technical teams to
        monitor, control, and support their mission-critical AI agents in real
        time. Think of it as your co-pilot for managing AI-powered operations.
      </>
    ),
    link: "/docs/supervaize-fleet/intro",
    linkText: "Learn More",
  },
  {
    title: "Supervaize Studio",
    Svg: () => (
      <img
        src="https://cdn.do.supervaize.com/products/supervaize-studio.png"
        alt="Supervaize Studio"
        className={styles.featureSvg}
      />
    ),
    description: (
      <>
        Supervaize Studio is the control center that empowers business teams to
        onboard, monitor, and operate AI agents across their organization. With
        built-in dashboards, workflow orchestration, human-in-the-loop controls,
        and compliance-ready audit trails, Studio makes it easy to scale and
        supervise your AI fleet with confidence.
      </>
    ),
    link: "/docs/supervaize-studio/intro",
    linkText: "Explore Studio",
  },
];

function Feature({ title, Svg, description, link, linkText }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
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
