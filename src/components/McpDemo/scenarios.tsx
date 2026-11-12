/** Fictional conversations played by ChatReplay. Tool names are the real connector tools. */

import React, { type ReactNode } from "react";
import Translate, { translate } from "@docusaurus/Translate";

type Step =
  | { kind: "user"; text: string }
  | { kind: "tool"; name: string; note?: string }
  | { kind: "confirm"; tool: string }
  | { kind: "assistant"; body: ReactNode };

export interface Scenario {
  id: string;
  title: string;
  steps: Step[];
}

// Shared by scenariosPatterns.tsx. translate() runs at module level: the locale is fixed per build.
export const COL_CASE = translate({ id: "mcpDemo.common.colCase", message: "Case" });
export const COL_MISSION = translate({ id: "mcpDemo.common.colMission", message: "Mission" });
export const YES = translate({ id: "mcpDemo.common.yes", message: "Yes" });
const IN_PROGRESS = translate({ id: "mcpDemo.common.statusInProgress", message: "In progress" });

export const SCENARIOS: Scenario[] = [
  {
    id: "overview",
    title: translate({ id: "mcpDemo.overview.title", message: "What's running?" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.overview.prompt",
          message: "What is running in my Supervaize workspace right now?",
        }),
      },
      { kind: "tool", name: "workspace_info" },
      { kind: "tool", name: "mission_list" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate
                id="mcpDemo.overview.intro"
                values={{ workspace: <strong>Acme</strong> }}
              >
                {"You are connected to {workspace} as an admin. Three missions are visible to you:"}
              </Translate>
            </p>
            <table>
              <thead>
                <tr>
                  <th>{COL_MISSION}</th>
                  <th>
                    <Translate id="mcpDemo.overview.colStatus">Status</Translate>
                  </th>
                  <th>
                    <Translate id="mcpDemo.overview.colAgent">Agent</Translate>
                  </th>
                  <th>
                    <Translate id="mcpDemo.overview.colActiveJobs">Active jobs</Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Customer Voice 2026</td>
                  <td>{IN_PROGRESS}</td>
                  <td>Aidan</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>Onboarding Check-ins</td>
                  <td>{IN_PROGRESS}</td>
                  <td>Aidan</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>Churn Interviews</td>
                  <td>
                    <Translate id="mcpDemo.overview.statusDraft">Draft</Translate>
                  </td>
                  <td>Aidan</td>
                  <td>0</td>
                </tr>
              </tbody>
            </table>
            <p>
              <Translate id="mcpDemo.overview.followUp">Want the numbers for one of them?</Translate>
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "stats",
    title: translate({ id: "mcpDemo.stats.title", message: "How is it going?" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.stats.prompt",
          message: "How is Customer Voice 2026 doing this month?",
        }),
      },
      { kind: "tool", name: "mission_list" },
      { kind: "tool", name: "mission_stats" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate
                id="mcpDemo.stats.intro"
                values={{ mission: <strong>Customer Voice 2026</strong> }}
              >
                {"{mission}, last 30 days:"}
              </Translate>
            </p>
            <ul>
              <li>
                <Translate
                  id="mcpDemo.stats.cases"
                  values={{
                    cases: (
                      <strong>
                        {translate({ id: "mcpDemo.stats.casesBold", message: "48 cases" })}
                      </strong>
                    ),
                  }}
                >
                  {"{cases}: 39 completed, 6 in progress, 3 awaiting input"}
                </Translate>
              </li>
              <li>
                <Translate
                  id="mcpDemo.stats.jobs"
                  values={{
                    jobs: (
                      <strong>
                        {translate({ id: "mcpDemo.stats.jobsBold", message: "2 jobs" })}
                      </strong>
                    ),
                  }}
                >
                  {"{jobs} running, none failed"}
                </Translate>
              </li>
              <li>
                <Translate
                  id="mcpDemo.stats.cost"
                  values={{ cost: <strong>$41.20</strong> }}
                >
                  {"Total cost {cost}, about $0.86 per case"}
                </Translate>
              </li>
              <li>
                <Translate id="mcpDemo.stats.busiest">
                  Busiest day: Tuesday, with 9 cases created
                </Translate>
              </li>
            </ul>
            <p>
              <Translate id="mcpDemo.stats.followUp">
                Three cases are waiting on a human. Shall I list them?
              </Translate>
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "hitl",
    title: translate({ id: "mcpDemo.hitl.title", message: "Unblock an agent" }),
    steps: [
      {
        kind: "user",
        text: translate({ id: "mcpDemo.hitl.prompt", message: "Is any agent waiting on me?" }),
      },
      { kind: "tool", name: "case_list" },
      { kind: "tool", name: "case_get" },
      {
        kind: "assistant",
        body: (
          <p>
            <Translate
              id="mcpDemo.hitl.answer"
              values={{
                mission: <strong>Customer Voice 2026</strong>,
                caseName: <em>Interview: J. Rivera</em>,
                question: (
                  <em>
                    {translate({
                      id: "mcpDemo.hitl.question",
                      message:
                        '"The contact wants to be called back after 6 pm. Reschedule to tomorrow 6:30 pm?"',
                    })}
                  </em>
                ),
              }}
            >
              {"Yes, one. In {mission}, Aidan paused the case {caseName} and asks: {question} Options: Approve, Reject."}
            </Translate>
          </p>
        ),
      },
      {
        kind: "user",
        text: translate({ id: "mcpDemo.hitl.approve", message: "Approve it." }),
      },
      { kind: "tool", name: "step_submit" },
      {
        kind: "assistant",
        body: (
          <p>
            <Translate id="mcpDemo.hitl.done">
              Done. Your approval is recorded under your name and Aidan resumed the case. The call is rescheduled for tomorrow 6:30 pm.
            </Translate>
          </p>
        ),
      },
    ],
  },
  {
    id: "launch",
    title: translate({ id: "mcpDemo.launch.title", message: "Launch a job" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.launch.prompt",
          message: "Start a new Aidan job in Onboarding Check-ins for the March cohort.",
        }),
      },
      { kind: "tool", name: "agent_list" },
      { kind: "tool", name: "job_setup (preview)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate id="mcpDemo.launch.preview">
                Here is what I would create. Nothing is started yet:
              </Translate>
            </p>
            <ul>
              <li>
                <Translate
                  id="mcpDemo.launch.mission"
                  values={{ mission: <strong>Onboarding Check-ins</strong> }}
                >
                  {"Mission: {mission}"}
                </Translate>
              </li>
              <li>
                <Translate id="mcpDemo.launch.agent" values={{ agent: <strong>Aidan</strong> }}>
                  {"Agent: {agent} (online)"}
                </Translate>
              </li>
              <li>
                <Translate
                  id="mcpDemo.launch.jobName"
                  values={{ name: <strong>March cohort</strong> }}
                >
                  {"Job name: {name}"}
                </Translate>
              </li>
            </ul>
            <p>
              <Translate id="mcpDemo.launch.confirmAsk">Confirm and I will create it.</Translate>
            </p>
          </>
        ),
      },
      {
        kind: "user",
        text: translate({ id: "mcpDemo.launch.confirmed", message: "Confirmed." }),
      },
      { kind: "tool", name: "job_setup (confirm)" },
      {
        kind: "assistant",
        body: (
          <p>
            <Translate
              id="mcpDemo.launch.created"
              values={{ job: <strong>March cohort</strong> }}
            >
              {"Job {job} is created in Onboarding Check-ins. You can follow it in Studio under Jobs, or ask me for its status any time."}
            </Translate>
          </p>
        ),
      },
    ],
  },
];
