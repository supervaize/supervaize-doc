import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";

import styles from "./styles.module.css";

const GITHUB_REPO_URL = "https://github.com/runwaize/supervaize_hello_world";
const GITHUB_REFERENCE = `${GITHUB_REPO_URL}/blob/main/supervaizer_control.py#L1-L20`;

export default function HomepageGitHubPreview(): ReactNode {
  return (
    <section className={styles.githubPreview} aria-label="Hello World example on GitHub">
      <div className={clsx("container", styles.githubPreviewContainer)}>
        <Link
          className={clsx(styles.githubMobileCard, styles.githubMobileOnly)}
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={styles.githubMobileCardTitle}>View on GitHub →</span>
          <span className={styles.githubMobileCardSub}>runwaize/supervaize_hello_world</span>
        </Link>

        <div className={clsx(styles.githubDesktopOnly, styles.githubDesktopPreview)}>
          <CodeBlock
            reference
            language="python"
            title="Hello World controller supervaizer_control.py"
            customStyling
            metastring='reference title="Hello World controller supervaizer_control.py" customStyling referenceLinkText="View on GitHub →"'
          >
            {GITHUB_REFERENCE}
          </CodeBlock>
        </div>
      </div>
    </section>
  );
}
