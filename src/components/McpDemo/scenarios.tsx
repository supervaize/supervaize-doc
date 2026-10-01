/** Fictional conversations played by ChatReplay. Tool names are the real connector tools. */

import React, { type ReactNode } from "react";

type Step =
  | { kind: "user"; text: string }
  | { kind: "tool"; name: string }
  | { kind: "assistant"; body: ReactNode };

export interface Scenario {
  id: string;
  title: string;
  steps: Step[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "overview",
    title: "What's running?",
    steps: [
      { kind: "user", text: "What is running in my Supervaize workspace right now?" },
      { kind: "tool", name: "workspace_info" },
      { kind: "tool", name: "mission_list" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              You are connected to <strong>Acme</strong> as an admin. Three
              missions are visible to you:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Mission</th>
                  <th>Status</th>
                  <th>Agent</th>
                  <th>Active jobs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Customer Voice 2026</td>
                  <td>In progress</td>
                  <td>Aidan</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>Onboarding Check-ins</td>
                  <td>In progress</td>
                  <td>Aidan</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>Churn Interviews</td>
                  <td>Draft</td>
                  <td>Aidan</td>
                  <td>0</td>
                </tr>
              </tbody>
            </table>
            <p>Want the numbers for one of them?</p>
          </>
        ),
      },
    ],
  },
  {
    id: "stats",
    title: "How is it going?",
    steps: [
      { kind: "user", text: "How is Customer Voice 2026 doing this month?" },
      { kind: "tool", name: "mission_list" },
      { kind: "tool", name: "mission_stats" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <strong>Customer Voice 2026</strong>, last 30 days:
            </p>
            <ul>
              <li>
                <strong>48 cases</strong>: 39 completed, 6 in progress, 3
                awaiting input
              </li>
              <li>
                <strong>2 jobs</strong> running, none failed
              </li>
              <li>
                Total cost <strong>$41.20</strong>, about $0.86 per case
              </li>
              <li>Busiest day: Tuesday, with 9 cases created</li>
            </ul>
            <p>Three cases are waiting on a human. Shall I list them?</p>
          </>
        ),
      },
    ],
  },
  {
    id: "hitl",
    title: "Unblock an agent",
    steps: [
      { kind: "user", text: "Is any agent waiting on me?" },
      { kind: "tool", name: "case_list" },
      { kind: "tool", name: "case_get" },
      {
        kind: "assistant",
        body: (
          <p>
            Yes, one. In <strong>Customer Voice 2026</strong>, Aidan paused the
            case <em>Interview: J. Rivera</em> and asks:{" "}
            <em>
              "The contact wants to be called back after 6 pm. Reschedule to
              tomorrow 6:30 pm?"
            </em>{" "}
            Options: Approve, Reject.
          </p>
        ),
      },
      { kind: "user", text: "Approve it." },
      { kind: "tool", name: "step_submit" },
      {
        kind: "assistant",
        body: (
          <p>
            Done. Your approval is recorded under your name and Aidan resumed
            the case. The call is rescheduled for tomorrow 6:30 pm.
          </p>
        ),
      },
    ],
  },
  {
    id: "launch",
    title: "Launch a job",
    steps: [
      {
        kind: "user",
        text: "Start a new Aidan job in Onboarding Check-ins for the March cohort.",
      },
      { kind: "tool", name: "agent_list" },
      { kind: "tool", name: "job_setup (preview)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>Here is what I would create. Nothing is started yet:</p>
            <ul>
              <li>
                Mission: <strong>Onboarding Check-ins</strong>
              </li>
              <li>
                Agent: <strong>Aidan</strong> (online)
              </li>
              <li>
                Job name: <strong>March cohort</strong>
              </li>
            </ul>
            <p>Confirm and I will create it.</p>
          </>
        ),
      },
      { kind: "user", text: "Confirmed." },
      { kind: "tool", name: "job_setup (confirm)" },
      {
        kind: "assistant",
        body: (
          <p>
            Job <strong>March cohort</strong> is created in Onboarding
            Check-ins. You can follow it in Studio under Jobs, or ask me for
            its status any time.
          </p>
        ),
      },
    ],
  },
];
