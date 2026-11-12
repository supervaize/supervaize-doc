/**
 * Click-through recreation of the four connection screens, with fictional
 * "Acme" data. Nothing here talks to Studio: it only mirrors what users see.
 */

import React, { type ReactNode, useState } from "react";
import clsx from "clsx";
import Translate, { translate } from "@docusaurus/Translate";
import BrowserWindow from "@site/src/components/BrowserWindow";

import styles from "./styles.module.css";

const MCP_URL = "https://app.supervaize.com/mcp/acme";

const STEPS = [
  { label: translate({ id: "mcpDemo.connect.tab1", message: "1. Copy the URL" }), url: "studio.supervaize.com/w/acme/chat-connectors" },
  { label: translate({ id: "mcpDemo.connect.tab2", message: "2. Add it in Claude" }), url: "claude.ai/settings/connectors" },
  { label: translate({ id: "mcpDemo.connect.tab3", message: "3. Approve" }), url: "studio.supervaize.com/oauth/consent" },
  { label: translate({ id: "mcpDemo.connect.tab4", message: "4. Manage" }), url: "studio.supervaize.com/profile/developer" },
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
              <div className={styles.cardTitle}><Translate id="mcpDemo.connect.copyTitle">{"1. Copy this workspace URL"}</Translate></div>
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
                  <Translate id="mcpDemo.connect.next">{"Next: add it in Claude"}</Translate>
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
                <Translate id="mcpDemo.connect.noSecret">
                  {"No client ID, no secret, no headers. Claude signs you in next."}
                </Translate>
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
                <Translate id="mcpDemo.connect.bound">
                  {"The connection is bound to this workspace."}
                </Translate>
              </div>
              <label className={styles.check}>
                <input type="checkbox" checked disabled />
                <span>
                  <strong>Read</strong>
                  <br />
                  <Translate id="mcpDemo.connect.readDesc">
                    {"Browse missions, jobs, cases and their steps as you see them in Studio."}
                  </Translate>
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
                  <Translate id="mcpDemo.connect.writeDesc">
                    {"Create missions and jobs, answer agent questions and invoke agent actions on your behalf."}
                  </Translate>
                </span>
              </label>
              {allowed === false && (
                <div className={styles.muted}>
                  <Translate id="mcpDemo.connect.denied">
                    {"Denied. Nothing was created; Claude stays disconnected."}
                  </Translate>
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
                      <Translate id="mcpDemo.connect.lastUsed" values={{ scopes }}>
                        {"Acme · {scopes} · last used today"}
                      </Translate>
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
                  <Translate id="mcpDemo.connect.noApp">
                    {"No connected app. The next call from Claude fails until you connect again."}
                  </Translate>{" "}
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
        <Translate id="mcpDemo.connect.caption">
          {"Interactive walkthrough with a fictional workspace. Click the buttons."}
        </Translate>
      </p>
    </div>
  );
}
