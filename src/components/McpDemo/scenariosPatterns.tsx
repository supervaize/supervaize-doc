/**
 * Replays for the usage patterns of the examples page. Same fictional world as
 * scenarios.tsx. Tool and argument names are the real connector ones.
 * Shown only when a page asks for them by id (see ChatReplay `only`).
 */

import React from "react";
import Translate, { translate } from "@docusaurus/Translate";

import { COL_CASE, COL_MISSION, YES, type Scenario } from "./scenarios";

const TAGGED = translate({ id: "mcpDemo.tags.resultTagged", message: "Tagged" });

export const PATTERN_SCENARIOS: Scenario[] = [
  {
    id: "tags",
    title: translate({ id: "mcpDemo.tags.title", message: "Tag a batch" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.tags.prompt",
          message: 'Tag the five open Customer Voice cases as "reviewed".',
        }),
      },
      { kind: "tool", name: "case_list (mission_id, status)" },
      { kind: "tool", name: "tags_set (mode: add)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate id="mcpDemo.tags.intro" values={{ tag: <strong>reviewed</strong> }}>
                {"4 of 5 cases are tagged {tag}:"}
              </Translate>
            </p>
            <table>
              <thead>
                <tr>
                  <th>{COL_CASE}</th>
                  <th>
                    <Translate id="mcpDemo.tags.colResult">Result</Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Interview: J. Rivera</td>
                  <td>{TAGGED}</td>
                </tr>
                <tr>
                  <td>Interview: P. Okafor</td>
                  <td>{TAGGED}</td>
                </tr>
                <tr>
                  <td>Interview: L. Moreau</td>
                  <td>{TAGGED}</td>
                </tr>
                <tr>
                  <td>Interview: S. Haddad</td>
                  <td>{TAGGED}</td>
                </tr>
                <tr>
                  <td>Interview: M. Chen</td>
                  <td>
                    <Translate id="mcpDemo.tags.resultDenied">
                      {"Not tagged: only a mission manager can change this tag on that case"}
                    </Translate>
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              <Translate id="mcpDemo.tags.note">
                {"Each case is checked on its own, so the other four went through."}
              </Translate>
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "comments",
    title: translate({ id: "mcpDemo.comments.title", message: "Collect comments" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.comments.prompt",
          message: "Show me every unread comment since Monday.",
        }),
      },
      { kind: "tool", name: "comment_list (unread_only, since)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate id="mcpDemo.comments.intro">
                {"5 unread comments, newest first within each mission:"}
              </Translate>
            </p>
            <ul>
              <li>
                <Translate
                  id="mcpDemo.comments.voice"
                  values={{
                    mission: <strong>Customer Voice 2026</strong>,
                    rivera: <em>Interview: J. Rivera</em>,
                    chen: <em>Interview: M. Chen</em>,
                  }}
                >
                  {"{mission}: 3 comments. On {rivera}, Sam asks whether the call moved to tomorrow. Two more are on {chen}."}
                </Translate>
              </li>
              <li>
                <Translate
                  id="mcpDemo.comments.onboarding"
                  values={{
                    mission: <strong>Onboarding Check-ins</strong>,
                    job: <em>March cohort</em>,
                  }}
                >
                  {"{mission}: 2 comments, both on the job {job}, about the start date."}
                </Translate>
              </li>
            </ul>
            <p>
              <Translate id="mcpDemo.comments.followUp">
                {"Reading the list does not mark anything as read. Want me to mark your threads as read?"}
              </Translate>
            </p>
          </>
        ),
      },
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.comments.confirm",
          message: "Yes, mark them all as read.",
        }),
      },
      { kind: "tool", name: "comment_mark_seen" },
      {
        kind: "assistant",
        body: (
          <p>
            <Translate id="mcpDemo.comments.done">
              {"Done. Your threads are marked as read. This changes only your own read marker; nobody else sees a difference."}
            </Translate>
          </p>
        ),
      },
    ],
  },
  {
    id: "ratings",
    title: translate({ id: "mcpDemo.ratings.title", message: "Ratings" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.ratings.prompt",
          message: "How are the Customer Voice interviews rated?",
        }),
      },
      { kind: "tool", name: "rating_list (mission_id, kind: case)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate
                id="mcpDemo.ratings.intro"
                values={{ dimension: <strong>clarity</strong> }}
              >
                {"Ratings on the {dimension} dimension (1 to 5 stars):"}
              </Translate>
            </p>
            <table>
              <thead>
                <tr>
                  <th>{COL_CASE}</th>
                  <th>
                    <Translate id="mcpDemo.ratings.colRatedBy">Rated by</Translate>
                  </th>
                  <th>Clarity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Interview: J. Rivera</td>
                  <td>
                    <Translate id="mcpDemo.ratings.you">You</Translate>
                  </td>
                  <td>4</td>
                </tr>
                <tr>
                  <td>Interview: J. Rivera</td>
                  <td>Sam K.</td>
                  <td>5</td>
                </tr>
                <tr>
                  <td>Interview: P. Okafor</td>
                  <td>
                    <Translate id="mcpDemo.ratings.you">You</Translate>
                  </td>
                  <td>3</td>
                </tr>
              </tbody>
            </table>
            <p>
              <Translate id="mcpDemo.ratings.note">
                {"You see Sam's ratings because you may view rating results on Customer Voice 2026. On a mission where that is off, I would only see your own ratings."}
              </Translate>
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "pending",
    title: translate({ id: "mcpDemo.pending.title", message: "What needs me?" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.pending.prompt",
          message: "What is waiting for my input?",
        }),
      },
      { kind: "tool", name: "pending_actions" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate id="mcpDemo.pending.intro">
                {"Three cases wait for a human, oldest first:"}
              </Translate>
            </p>
            <table>
              <thead>
                <tr>
                  <th>{COL_CASE}</th>
                  <th>{COL_MISSION}</th>
                  <th>
                    <Translate id="mcpDemo.pending.colCanAnswer">You can answer</Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Interview: J. Rivera</td>
                  <td>Customer Voice 2026</td>
                  <td>{YES}</td>
                </tr>
                <tr>
                  <td>Welcome call: L. Moreau</td>
                  <td>Onboarding Check-ins</td>
                  <td>{YES}</td>
                </tr>
                <tr>
                  <td>Exit call: A. Novak</td>
                  <td>Churn Interviews</td>
                  <td>
                    <Translate id="mcpDemo.pending.viewOnly">No, view only</Translate>
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              <Translate
                id="mcpDemo.pending.question"
                values={{
                  question: (
                    <em>
                      {translate({
                        id: "mcpDemo.pending.questionText",
                        message: '"Reschedule to tomorrow 6:30 pm?"',
                      })}
                    </em>
                  ),
                }}
              >
                {"The first one asks: {question}"}
              </Translate>
            </p>
          </>
        ),
      },
      {
        kind: "user",
        text: translate({ id: "mcpDemo.pending.approve", message: "Approve the first one." }),
      },
      { kind: "tool", name: "step_submit" },
      {
        kind: "assistant",
        body: (
          <p>
            <Translate id="mcpDemo.pending.done">
              {"Done. Your approval is recorded under your name and Aidan resumed the case."}
            </Translate>
          </p>
        ),
      },
    ],
  },
  {
    id: "dashboard",
    title: translate({ id: "mcpDemo.dashboard.title", message: "Workspace dashboard" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.dashboard.prompt",
          message: "How is the workspace doing this month?",
        }),
      },
      { kind: "tool", name: "dashboard" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate id="mcpDemo.dashboard.intro" values={{ workspace: <strong>Acme</strong> }}>
                {"{workspace}, this month, for the missions you can see:"}
              </Translate>
            </p>
            <ul>
              <li>
                <Translate
                  id="mcpDemo.dashboard.totals"
                  values={{
                    missions: (
                      <strong>
                        {translate({ id: "mcpDemo.dashboard.missionsBold", message: "3 missions" })}
                      </strong>
                    ),
                    jobs: (
                      <strong>
                        {translate({
                          id: "mcpDemo.dashboard.jobsBold",
                          message: "3 active jobs",
                        })}
                      </strong>
                    ),
                  }}
                >
                  {"{missions}, {jobs}"}
                </Translate>
              </li>
              <li>
                <Translate
                  id="mcpDemo.dashboard.cases"
                  values={{
                    cases: (
                      <strong>
                        {translate({ id: "mcpDemo.dashboard.casesBold", message: "21 cases" })}
                      </strong>
                    ),
                  }}
                >
                  {"{cases} of yours in the last 7 days"}
                </Translate>
              </li>
              <li>
                <Translate id="mcpDemo.dashboard.cost" values={{ cost: <strong>$63.80</strong> }}>
                  {"Cost so far {cost}. Aidan is the busiest agent."}
                </Translate>
              </li>
            </ul>
            <p>
              <Translate id="mcpDemo.dashboard.note">
                {"No cost is shown for Churn Interviews, because you may not view costs there."}
              </Translate>
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "manage",
    title: translate({ id: "mcpDemo.manage.title", message: "Manage work" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.manage.prompt",
          message:
            'Stop the Onboarding Check-ins job and rename the mission to "Onboarding Check-ins EMEA".',
        }),
      },
      { kind: "tool", name: "job_list (mission_id)" },
      { kind: "confirm", tool: "job_stop" },
      { kind: "tool", name: "job_stop" },
      { kind: "tool", name: "mission_update (name)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate id="mcpDemo.manage.intro">Both changes are done:</Translate>
            </p>
            <ul>
              <li>
                <Translate id="mcpDemo.manage.stopped" values={{ job: <strong>March cohort</strong> }}>
                  {"Job {job} is stopped. Aidan was told to stop; work already done is kept."}
                </Translate>
              </li>
              <li>
                <Translate
                  id="mcpDemo.manage.renamed"
                  values={{ mission: <strong>Onboarding Check-ins EMEA</strong> }}
                >
                  {"The mission is now {mission}."}
                </Translate>
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    id: "access",
    title: translate({ id: "mcpDemo.access.title", message: "Not on the mission" }),
    steps: [
      {
        kind: "user",
        text: translate({
          id: "mcpDemo.access.prompt",
          message:
            "A colleague sent me this mission id: 01KH7ZMX4QV2R8T5B9C3D6E0FA. Show me the mission.",
        }),
      },
      {
        kind: "tool",
        name: "mission_get",
        note: "Requested entity not found",
      },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <Translate id="mcpDemo.access.cannotSee">
                {"I cannot see that mission. I have the same access as you in Studio, and a mission you are not on does not show up for me."}
              </Translate>
            </p>
            <p>
              <Translate id="mcpDemo.access.askAdmin">
                Ask a workspace admin to add you to it.
              </Translate>
            </p>
          </>
        ),
      },
    ],
  },
];
