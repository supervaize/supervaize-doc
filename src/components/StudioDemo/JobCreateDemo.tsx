/**
 * Click-through recreation of starting a job in Studio, with fictional
 * "Acme" data. The "Job Parameters" fields are an example: in Studio each
 * agent serves its own form. Nothing here talks to Studio.
 */

import React, { type ReactNode, useState } from "react";
import clsx from "clsx";
import BrowserWindow from "@site/src/components/BrowserWindow";

import base from "../McpDemo/styles.module.css";
import styles from "./styles.module.css";

const MISSION = "Onboarding Check-ins";
const BASE_URL = "studio.supervaize.com/w/acme";

const STEPS = [
  { label: "1. New Job", url: `${BASE_URL}/missions/onboarding-check-ins` },
  { label: "2. Parameters", url: `${BASE_URL}/missions/onboarding-check-ins/agents/aidan/jobs/new` },
  { label: "3. Job page", url: `${BASE_URL}/jobs/job-2041` },
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function JobCreateDemo(): ReactNode {
  const [step, setStep] = useState(0);
  const [agent, setAgent] = useState("Aidan");
  const [mode, setMode] = useState("create");
  const [jobName, setJobName] = useState("");
  const [limitsOpen, setLimitsOpen] = useState(false);
  const defaultName = `${MISSION} - ${agent}`;

  function generate() {
    const d = new Date();
    setJobName(
      `${agent} - ${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`,
    );
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
              <div className={base.cardTitle}>New Job</div>
              <div className={base.muted}>Select the agent for this job.</div>
              <label className={base.muted}>
                Agent *
                <select
                  className={base.field}
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                >
                  <option>Aidan</option>
                  <option>Scout</option>
                </select>
              </label>
              <div className={base.actions}>
                <button
                  type="button"
                  className={clsx(base.btn, base.btnPrimary)}
                  onClick={() => setStep(1)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.split}>
              <div className={clsx(base.card, styles.wide)}>
                <div className={base.cardTitle}>Job Parameters</div>
                <label className={base.muted}>
                  Campaign
                  <select
                    className={base.field}
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="create">Create a new campaign</option>
                    <option value="existing">Use an existing campaign</option>
                  </select>
                </label>
                {mode === "create" ? (
                  <label className={base.muted}>
                    Campaign name
                    <input className={base.field} defaultValue="Q4 new hires" />
                  </label>
                ) : (
                  <label className={base.muted}>
                    Existing campaign
                    <select className={base.field}>
                      <option>Q3 new hires</option>
                      <option>Managers 2026</option>
                    </select>
                  </label>
                )}
                <div className={base.muted}>
                  Example fields. The second field changes with the first: the
                  agent decides what to ask.
                </div>
              </div>

              <div className={styles.col}>
                <div className={clsx(base.card, styles.wide)}>
                  <div className={clsx(styles.row, styles.spread)}>
                    <span className={base.muted}>Name</span>
                    <button type="button" className={base.btn} onClick={generate}>
                      Generate
                    </button>
                  </div>
                  <input
                    className={base.field}
                    value={jobName}
                    placeholder={defaultName}
                    onChange={(e) => setJobName(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.laneHead}
                    aria-expanded={limitsOpen}
                    onClick={() => setLimitsOpen((open) => !open)}
                  >
                    {limitsOpen ? "▾" : "▸"} Execution Limits
                  </button>
                  {limitsOpen && (
                    <>
                      <label className={base.muted}>
                        Max Cases
                        <input className={base.field} placeholder="No limit" />
                      </label>
                      <label className={base.muted}>
                        Max Duration (seconds)
                        <input className={base.field} defaultValue="36000" />
                      </label>
                      <label className={base.muted}>
                        Max Cost (USD)
                        <input className={base.field} placeholder="No limit" />
                      </label>
                    </>
                  )}
                  <div className={base.actions}>
                    <button
                      type="button"
                      className={clsx(base.btn, base.btnPrimary)}
                      onClick={() => setStep(2)}
                    >
                      Start Job
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={base.card}>
              <div className={base.cardTitle}>
                <span className={clsx(styles.chip, styles.chipOn)}>Job</span>{" "}
                {jobName.trim() || defaultName}
              </div>
              <div className={base.muted}>
                In Progress · {MISSION} · {agent}
              </div>
              <div className={base.muted}>
                Studio opens the job page. Cases appear in the{" "}
                <strong>Cases</strong> section as the agent creates them.
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
