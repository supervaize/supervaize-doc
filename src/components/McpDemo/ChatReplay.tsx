/**
 * Scripted replay of a chat that uses the Supervaize connector: the prompt,
 * the tools called, then the answer. All data is fictional.
 */

import React, { type ReactNode, useEffect, useState } from "react";
import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import BrowserWindow from "@site/src/components/BrowserWindow";

import { SCENARIOS } from "./scenarios";
import { PATTERN_SCENARIOS } from "./scenariosPatterns";
import styles from "./styles.module.css";

const STEP_MS = 1100;

/** No `only`: the four overview replays. `only`: the replays with these ids, in the order given. */
export default function ChatReplay({ only }: { only?: string | string[] }): ReactNode {
  const ids = only === undefined ? undefined : [only].flat();
  const all = [...SCENARIOS, ...PATTERN_SCENARIOS];
  const scenarios = ids
    ? ids.map((id) => all.find((s) => s.id === id)).filter((s) => s !== undefined)
    : SCENARIOS;
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(1);
  const steps = scenarios[active].steps;

  useEffect(() => {
    if (shown >= steps.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(steps.length);
      return;
    }
    const timer = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [shown, steps.length]);

  function play(index: number) {
    setActive(index);
    setShown(1);
  }

  return (
    <div className={styles.demo}>
      <div className={styles.tabs} role="tablist">
        {scenarios.length > 1 &&
          scenarios.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={clsx(styles.tab, i === active && styles.tabActive)}
              onClick={() => play(i)}
            >
              {s.title}
            </button>
          ))}
        <button type="button" className={styles.tab} onClick={() => play(active)}>
          <Translate id="mcpDemo.ui.replay">{"↻ Replay"}</Translate>
        </button>
      </div>

      <BrowserWindow url="https://claude.ai" bodyStyle={{ padding: 0 }}>
        <div className={styles.chat} aria-live="polite">
          {steps.slice(0, shown).map((step, i) => {
            if (step.kind === "user")
              return (
                <div key={i} className={styles.user}>
                  {step.text}
                </div>
              );
            if (step.kind === "tool")
              return (
                <div key={i} className={styles.tool}>
                  <span className={styles.dot} />
                  Supervaize · {step.name}
                  {step.note && <span className={styles.toolNote}>→ {step.note}</span>}
                </div>
              );
            if (step.kind === "confirm")
              return (
                <div key={i} className={styles.confirm}>
                  <span>
                    <Translate
                      id="mcpDemo.ui.confirmAsk"
                      values={{ tool: <code>{step.tool}</code> }}
                    >
                      {"Claude asks to run {tool} on Supervaize"}
                    </Translate>
                  </span>
                  <span className={styles.confirmButtons}>
                    <span className={styles.confirmDeny}>Deny</span>
                    <span className={styles.confirmAllow}>Allow</span>
                  </span>
                </div>
              );
            return (
              <div key={i} className={styles.assistant}>
                {step.body}
              </div>
            );
          })}
          {shown < steps.length && <div className={styles.typing}>
              <Translate id="mcpDemo.ui.working">{"Claude is working…"}</Translate>
            </div>}
        </div>
      </BrowserWindow>
      <p className={styles.caption}>
        <Translate id="mcpDemo.ui.replayCaption">
          {"Illustrative replay with fictional data. Wording varies between chats; the tools are the real ones."}
        </Translate>
      </p>
    </div>
  );
}
