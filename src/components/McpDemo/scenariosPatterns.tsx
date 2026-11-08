/**
 * Replays for the usage patterns of the examples page. Same fictional world as
 * scenarios.tsx. Tool and argument names are the real connector ones.
 * Shown only when a page asks for them by id (see ChatReplay `only`).
 */

import React from "react";

import type { Scenario } from "./scenarios";

export const PATTERN_SCENARIOS: Scenario[] = [
  {
    id: "tags",
    title: "Tag a batch",
    steps: [
      {
        kind: "user",
        text: 'Tag the five open Customer Voice cases as "reviewed".',
      },
      { kind: "tool", name: "case_list (mission_id, status)" },
      { kind: "tool", name: "tags_set (mode: add)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              4 of 5 cases are tagged <strong>reviewed</strong>:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Interview: J. Rivera</td>
                  <td>Tagged</td>
                </tr>
                <tr>
                  <td>Interview: P. Okafor</td>
                  <td>Tagged</td>
                </tr>
                <tr>
                  <td>Interview: L. Moreau</td>
                  <td>Tagged</td>
                </tr>
                <tr>
                  <td>Interview: S. Haddad</td>
                  <td>Tagged</td>
                </tr>
                <tr>
                  <td>Interview: M. Chen</td>
                  <td>Not tagged: only a mission manager can change this tag on that case</td>
                </tr>
              </tbody>
            </table>
            <p>Each case is checked on its own, so the other four went through.</p>
          </>
        ),
      },
    ],
  },
  {
    id: "comments",
    title: "Collect comments",
    steps: [
      { kind: "user", text: "Show me every unread comment since Monday." },
      { kind: "tool", name: "comment_list (unread_only, since)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>5 unread comments, newest first within each mission:</p>
            <ul>
              <li>
                <strong>Customer Voice 2026</strong>: 3 comments. On{" "}
                <em>Interview: J. Rivera</em>, Sam asks whether the call
                moved to tomorrow. Two more are on <em>Interview: M. Chen</em>.
              </li>
              <li>
                <strong>Onboarding Check-ins</strong>: 2 comments, both on the
                job <em>March cohort</em>, about the start date.
              </li>
            </ul>
            <p>
              Reading the list does not mark anything as read. Want me to mark
              your threads as read?
            </p>
          </>
        ),
      },
      { kind: "user", text: "Yes, mark them all as read." },
      { kind: "tool", name: "comment_mark_seen" },
      {
        kind: "assistant",
        body: (
          <p>
            Done. Your threads are marked as read. This changes only your own
            read marker; nobody else sees a difference.
          </p>
        ),
      },
    ],
  },
  {
    id: "ratings",
    title: "Ratings",
    steps: [
      { kind: "user", text: "How are the Customer Voice interviews rated?" },
      { kind: "tool", name: "rating_list (mission_id, kind: case)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              Ratings on the <strong>clarity</strong> dimension (1 to 5 stars):
            </p>
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Rated by</th>
                  <th>Clarity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Interview: J. Rivera</td>
                  <td>You</td>
                  <td>4</td>
                </tr>
                <tr>
                  <td>Interview: J. Rivera</td>
                  <td>Sam K.</td>
                  <td>5</td>
                </tr>
                <tr>
                  <td>Interview: P. Okafor</td>
                  <td>You</td>
                  <td>3</td>
                </tr>
              </tbody>
            </table>
            <p>
              You see Sam's ratings because you may view rating results on
              Customer Voice 2026. On a mission where that is off, I would
              only see your own ratings.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "pending",
    title: "What needs me?",
    steps: [
      { kind: "user", text: "What is waiting for my input?" },
      { kind: "tool", name: "pending_actions" },
      {
        kind: "assistant",
        body: (
          <>
            <p>Three cases wait for a human, oldest first:</p>
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Mission</th>
                  <th>You can answer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Interview: J. Rivera</td>
                  <td>Customer Voice 2026</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Welcome call: L. Moreau</td>
                  <td>Onboarding Check-ins</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Exit call: A. Novak</td>
                  <td>Churn Interviews</td>
                  <td>No, view only</td>
                </tr>
              </tbody>
            </table>
            <p>
              The first one asks: <em>"Reschedule to tomorrow 6:30 pm?"</em>
            </p>
          </>
        ),
      },
      { kind: "user", text: "Approve the first one." },
      { kind: "tool", name: "step_submit" },
      {
        kind: "assistant",
        body: (
          <p>
            Done. Your approval is recorded under your name and Aidan resumed
            the case.
          </p>
        ),
      },
    ],
  },
  {
    id: "dashboard",
    title: "Workspace dashboard",
    steps: [
      { kind: "user", text: "How is the workspace doing this month?" },
      { kind: "tool", name: "dashboard" },
      {
        kind: "assistant",
        body: (
          <>
            <p>
              <strong>Acme</strong>, this month, for the missions you can see:
            </p>
            <ul>
              <li>
                <strong>3 missions</strong>, <strong>3 active jobs</strong>
              </li>
              <li>
                <strong>21 cases</strong> of yours in the last 7 days
              </li>
              <li>
                Cost so far <strong>$63.80</strong>. Aidan is the busiest
                agent.
              </li>
            </ul>
            <p>
              No cost is shown for Churn Interviews, because you may not view
              costs there.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "manage",
    title: "Manage work",
    steps: [
      {
        kind: "user",
        text: 'Stop the Onboarding Check-ins job and rename the mission to "Onboarding Check-ins EMEA".',
      },
      { kind: "tool", name: "job_list (mission_id)" },
      { kind: "confirm", tool: "job_stop" },
      { kind: "tool", name: "job_stop" },
      { kind: "tool", name: "mission_update (name)" },
      {
        kind: "assistant",
        body: (
          <>
            <p>Both changes are done:</p>
            <ul>
              <li>
                Job <strong>March cohort</strong> is stopped. Aidan was told to
                stop; work already done is kept.
              </li>
              <li>
                The mission is now <strong>Onboarding Check-ins EMEA</strong>.
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    id: "access",
    title: "Not on the mission",
    steps: [
      {
        kind: "user",
        text: "A colleague sent me this mission id: 01KH7ZMX4QV2R8T5B9C3D6E0FA. Show me the mission.",
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
              I cannot see that mission. I have the same access as you in
              Studio, and a mission you are not on does not show up for me.
            </p>
            <p>Ask a workspace admin to add you to it.</p>
          </>
        ),
      },
    ],
  },
];
