/**
 * Click-through recreation of the four connection screens, with fictional
 * "Acme" data. Nothing here talks to Studio: it only mirrors what users see.
 */

import React, { type ReactNode, useState } from "react";
import clsx from "clsx";
import BrowserWindow from "@site/src/components/BrowserWindow";

import styles from "./styles.module.css";

const MCP_URL = "https://app.supervaize.com/mcp/acme";

const STEPS = [
  { label: "1. Copy the URL", url: "studio.supervaize.com/w/acme/chat-connectors" },
  { label: "2. Add it in Claude", url: "claude.ai/settings/connectors" },
  { label: "3. Approve", url: "studio.supervaize.com/oauth/consent" },
  { label: "4. Manage", url: "studio.supervaize.com/profile/developer" },
];

export default function ConnectFlow(): ReactNode {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [write, setWrite] = useState(true);
  // null = not decided yet on the consent screen
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [connected, setConnected] = useState(true);

  function copy() {
    void navigator.clipboard?.writeText(MCP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function decide(allow: boolean) {
    setAllowed(allow);
    setConnected(allow);
    if (allow) setStep(3);
  }

  const scopes = write ? "read, write" : "read";

  return (
    <div className={styles.demo}>
      <div className={styles.tabs} role="tablist">
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="tab"
            aria-selected={i === step}
            className={clsx(styles.tab, i === step && styles.tabActive)}
            onClick={() => setStep(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <BrowserWindow url={`https://${STEPS[step].url}`} bodyStyle={{ padding: 0 }}>
        <div className={styles.screen}>
          {step === 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>1. Copy this workspace URL</div>
              <div className={styles.urlRow}>
                <span className={styles.url}>{MCP_URL}</span>
                <button type="button" className={styles.btn} onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={clsx(styles.btn, styles.btnPrimary)}
                  onClick={() => setStep(1)}
                >
                  Next: add it in Claude
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Add custom connector</div>
              <label className={styles.muted}>
                Name
                <input className={styles.field} readOnly value="Supervaize" />
              </label>
              <label className={styles.muted}>
                Remote MCP server URL
                <input className={styles.field} readOnly value={MCP_URL} />
              </label>
              <div className={styles.muted}>
                No client ID, no secret, no headers. Claude signs you in next.
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={clsx(styles.btn, styles.btnPrimary)}
                  onClick={() => setStep(2)}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Connect Claude to Supervaize</div>
              <label className={styles.muted}>
                Workspace
                <select className={styles.field} disabled>
                  <option>Acme (admin)</option>
                </select>
              </label>
              <div className={styles.muted}>
                The connection is bound to this workspace.
              </div>
              <label className={styles.check}>
                <input type="checkbox" checked disabled />
                <span>
                  <strong>Read</strong>
                  <br />
                  Browse missions, jobs, cases and their steps as you see them
                  in Studio.
                </span>
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={write}
                  onChange={(e) => setWrite(e.target.checked)}
                />
                <span>
                  <strong>Write</strong>
                  <br />
                  Create missions and jobs, answer agent questions and invoke
                  agent actions on your behalf.
                </span>
              </label>
              {allowed === false && (
                <div className={styles.muted}>
                  Denied. Nothing was created; Claude stays disconnected.
                </div>
              )}
              <div className={styles.actions}>
                <button type="button" className={styles.btn} onClick={() => decide(false)}>
                  Deny
                </button>
                <button
                  type="button"
                  className={clsx(styles.btn, styles.btnPrimary)}
                  onClick={() => decide(true)}
                >
                  Allow
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Connected apps</div>
              {connected && allowed !== false ? (
                <div className={styles.urlRow}>
                  <span>
                    <strong>Claude</strong>
                    <br />
                    <span className={styles.muted}>
                      Acme · {scopes} · last used today
                    </span>
                  </span>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => setConnected(false)}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className={styles.muted}>
                  No connected app. The next call from Claude fails until you
                  connect again.{" "}
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => {
                      setAllowed(null);
                      setStep(2);
                    }}
                  >
                    Reconnect
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </BrowserWindow>
      <p className={styles.caption}>
        Interactive walkthrough with a fictional workspace. Click the buttons.
      </p>
    </div>
  );
}
