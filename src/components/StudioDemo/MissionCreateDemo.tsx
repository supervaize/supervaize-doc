/**
 * Click-through recreation of creating a mission in Studio, with fictional
 * "Acme" data. Nothing here talks to Studio: it only mirrors what users see.
 */

import React, { type ReactNode, useState } from "react";
import clsx from "clsx";
import BrowserWindow from "@site/src/components/BrowserWindow";

import base from "../McpDemo/styles.module.css";
import styles from "./styles.module.css";

const STEPS = [
  { label: "1. Missions", url: "studio.supervaize.com/w/acme/missions" },
  { label: "2. New Mission", url: "studio.supervaize.com/w/acme/missions" },
  { label: "3. Mission page", url: "studio.supervaize.com/w/acme/missions/q4-check-ins" },
];

const AGENTS = ["Aidan", "Scout"];

export default function MissionCreateDemo(): ReactNode {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Q4 Check-ins");
  const [agents, setAgents] = useState<string[]>(["Aidan"]);
  const [error, setError] = useState(false);

  function toggleAgent(agent: string) {
    setAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent],
    );
  }

  function create() {
    // Name is the only required field, as in Studio.
    if (!name.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setStep(2);
  }

  return (
    <div className={base.demo}>
      <div className={base.tabs} role="tablist">
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="tab"
            aria-selected={i === step}
            className={clsx(base.tab, i === step && base.tabActive)}
            onClick={() => setStep(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <BrowserWindow url={`https://${STEPS[step].url}`} bodyStyle={{ padding: 0 }}>
        <div className={base.screen}>
          {step === 0 && (
            <div className={base.card}>
              <div className={clsx(styles.row, styles.spread)}>
                <div className={base.cardTitle}>Missions</div>
                <button
                  type="button"
                  className={clsx(base.btn, base.btnPrimary)}
                  onClick={() => setStep(1)}
                >
                  + New Mission
                </button>
              </div>
              <div className={base.urlRow}>
                <span>
                  <strong>Onboarding Check-ins</strong>
                  <br />
                  <span className={base.muted}>In Progress · Aidan · 2 jobs</span>
                </span>
              </div>
              <div className={base.urlRow}>
                <span>
                  <strong>Customer Voice</strong>
                  <br />
                  <span className={base.muted}>In Progress · Scout · 5 jobs</span>
                </span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={base.card}>
              <div className={base.cardTitle}>New Mission</div>
              <label className={base.muted}>
                Name *
                <input
                  className={base.field}
                  value={name}
                  placeholder="Mission name"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              {error && <div className={base.muted}>Mission name is required.</div>}
              <div className={styles.grid2}>
                <label className={base.muted}>
                  Status
                  <select className={base.field} defaultValue="Draft">
                    <option>Draft</option>
                    <option>In Progress</option>
                    <option>On Hold</option>
                  </select>
                </label>
                <label className={base.muted}>
                  Priority
                  <select className={base.field} defaultValue="Low">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>
              <div className={base.muted}>Agents</div>
              <div className={styles.row}>
                {AGENTS.map((agent) => (
                  <button
                    key={agent}
                    type="button"
                    aria-pressed={agents.includes(agent)}
                    className={clsx(base.tab, agents.includes(agent) && base.tabActive)}
                    onClick={() => toggleAgent(agent)}
                  >
                    {agent}
                  </button>
                ))}
              </div>
              <div className={base.actions}>
                <button type="button" className={base.btn} onClick={() => setStep(0)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={clsx(base.btn, base.btnPrimary)}
                  onClick={create}
                >
                  Create Mission
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={base.card}>
              <div className={clsx(styles.row, styles.spread)}>
                <div className={base.cardTitle}>
                  <span className={clsx(styles.chip, styles.chipOn)}>Mission</span>{" "}
                  {name.trim() || "Q4 Check-ins"}
                </div>
                <button type="button" className={clsx(base.btn, base.btnPrimary)}>
                  + New Job
                </button>
              </div>
              <div className={base.muted}>
                Draft · Low priority ·{" "}
                {agents.length > 0 ? agents.join(", ") : "no agent yet"}
              </div>
              <div className={base.muted}>
                Studio opens the new mission. Next: start a job with{" "}
                <strong>New Job</strong>.
              </div>
            </div>
          )}
        </div>
      </BrowserWindow>
      <p className={base.caption}>
        Interactive walkthrough with a fictional workspace. Click the buttons.
      </p>
    </div>
  );
}
