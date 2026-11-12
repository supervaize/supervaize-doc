import React from "react";
import Admonition from "@theme/Admonition";
import CodeBlock from "@theme/CodeBlock";
import Link from "@docusaurus/Link";

// One wording for every guide, so the skill pitch stays the same everywhere.
export default function SkillTip({ prompt }: { prompt: string }) {
  return (
    <Admonition type="tip" title="Let a coding agent do it">
      <p>
        Install the{" "}
        <Link to="/docs/integrations/skills/supervaizer-integration">
          Supervaizer integration skill
        </Link>{" "}
        in your coding agent, open your agent project and ask:
      </p>
      <CodeBlock language="text">{prompt}</CodeBlock>
      <p>
        The skill asks you the design questions, then follows this guide and
        the Hello World example, with tests. The rest of this page is what it
        reads.
      </p>
    </Admonition>
  );
}
