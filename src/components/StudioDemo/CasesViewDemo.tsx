/**
 * Working miniature of the Cases section of a Studio job page: the Board,
 * List and Calendar views with their display and sort options. Fictional
 * data; the labels, columns and defaults mirror Studio.
 */

import React, { type ReactNode, useState } from "react";
import clsx from "clsx";
import BrowserWindow from "@site/src/components/BrowserWindow";

import base from "../McpDemo/styles.module.css";
import styles from "./styles.module.css";

type View = "Board" | "List" | "Calendar";
type DateField = "created" | "started" | "finished" | "updated";
type SortKey = "name" | "started" | "finished" | "updated";

interface Case {
  name: string;
  lane: string;
  status: string;
  created: string;
  started: string;
  finished: string;
  updated: string;
  steps: number;
  cost: string;
}

const CASES: Case[] = [
  { name: "Import contacts", lane: "Setup", status: "Completed", created: "Oct 5", started: "Oct 5", finished: "Oct 5", updated: "Oct 5", steps: 3, cost: "0.02" },
  { name: "Approve invite email", lane: "Setup", status: "Awaiting", created: "Oct 5", started: "Oct 5", finished: "", updated: "Oct 6", steps: 2, cost: "0.01" },
  { name: "Interview: Ada Park", lane: "Work", status: "Completed", created: "Oct 6", started: "Oct 6", finished: "Oct 6", updated: "Oct 6", steps: 9, cost: "0.41" },
  { name: "Interview: Ben Ortiz", lane: "Work", status: "In Progress", created: "Oct 6", started: "Oct 7", finished: "", updated: "Oct 7", steps: 5, cost: "0.18" },
  { name: "Interview: Chloe Dubois", lane: "Work", status: "Awaiting", created: "Oct 6", started: "Oct 7", finished: "", updated: "Oct 8", steps: 6, cost: "0.22" },
  { name: "Interview: Dev Malik", lane: "Work", status: "Failed", created: "Oct 6", started: "Oct 7", finished: "Oct 7", updated: "Oct 7", steps: 4, cost: "0.09" },
  { name: "Interview: Emma Rossi", lane: "Work", status: "Stopped", created: "Oct 8", started: "", finished: "", updated: "Oct 8", steps: 0, cost: "0.00" },
  { name: "Weekly synthesis", lane: "Deliverable", status: "Stopped", created: "Oct 8", started: "", finished: "", updated: "Oct 8", steps: 0, cost: "0.00" },
];

const LANES = ["Setup", "Work", "Deliverable"];

/** Board column label and the case statuses it gathers, as in Studio. */
const COLUMNS: Array<[string, string[]]> = [
  ["Todo", ["Stopped"]],
  ["In Progress", ["Starting", "In Progress", "Cancelling"]],
  ["Waiting for Input", ["Awaiting"]],
  ["Success", ["Completed"]],
  ["Anomaly", ["Failed", "Cancelled"]],
];

const DAYS = ["Oct 5", "Oct 6", "Oct 7", "Oct 8"];

const SORTS: Array<[SortKey, string]> = [
  ["name", "Case name"],
  ["started", "Start date"],
  ["finished", "End date"],
  ["updated", "Last update date"],
];

const DATE_LABEL: Record<string, string> = {
  started: "Start date",
  finished: "End date",
  updated: "Last update date",
};

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
}): ReactNode {
  return (
    <span className={styles.row}>
      <span className={styles.label}>{label}</span>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          className={clsx(base.tab, option === value && base.tabActive)}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </span>
  );
}

export default function CasesViewDemo(): ReactNode {
  const [view, setView] = useState<View>("Board");
  const [density, setDensity] = useState<"Full" | "Compact">("Compact");
  const [grouped, setGrouped] = useState(false);
  const [calendarDate, setCalendarDate] = useState<DateField>("created");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [descending, setDescending] = useState(true);
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const sorted = [...CASES].sort(
    (a, b) => a[sortKey].localeCompare(b[sortKey]) * (descending ? -1 : 1),
  );
  // Sorting by case name keeps the "Last update date" column, as in Studio.
  const dateField: DateField = sortKey === "name" ? "updated" : sortKey;
  const lanes = LANES.map((lane) => ({
    lane,
    cases: sorted.filter((c) => c.lane === lane),
  }));

  function toggleLane(lane: string) {
    setCollapsed((prev) =>
      prev.includes(lane) ? prev.filter((l) => l !== lane) : [...prev, lane],
    );
  }

  function card(c: Case): ReactNode {
    return (
      <div key={c.name} className={styles.caseCard}>
        <div className={styles.caseName}>{c.name}</div>
        <span className={styles.chip}>{c.status}</span>
        {density === "Full" && (
          <div className={base.muted}>
            {c.steps} steps{c.cost !== "0.00" && ` · $${c.cost}`}
            <br />
            {c[dateField] || "--"}
          </div>
        )}
      </div>
    );
  }

  function table(cases: Case[]): ReactNode {
    return (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Lane</th>
            <th>{DATE_LABEL[dateField]}</th>
            <th>Cost</th>
            <th>Steps</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.name}>
              <td>{c.name}</td>
              <td>
                <span className={styles.chip}>{c.status}</span>
              </td>
              <td>{c.lane}</td>
              <td>{c[dateField] || "--"}</td>
              <td>${c.cost}</td>
              <td>{c.steps}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function swimlanes(body: (cases: Case[]) => ReactNode): ReactNode {
    return lanes.map(({ lane, cases }) => (
      <div key={lane} className={styles.lane}>
        <button
          type="button"
          className={styles.laneHead}
          aria-expanded={!collapsed.includes(lane)}
          onClick={() => toggleLane(lane)}
        >
          {collapsed.includes(lane) ? "▸" : "▾"} {lane}
          <span className={styles.chip}>{cases.length}</span>
        </button>
        {!collapsed.includes(lane) && body(cases)}
      </div>
    ));
  }

  return (
    <div className={base.demo}>
      <div className={clsx(styles.row, base.tabs)}>
        <Segmented label="View" options={["Board", "List", "Calendar"]} value={view} onChange={setView} />
        {view !== "List" && (
          <Segmented label="Cards" options={["Full", "Compact"]} value={density} onChange={setDensity} />
        )}
        {view === "List" && (
          <label className={styles.row}>
            <input
              type="checkbox"
              checked={grouped}
              onChange={(e) => setGrouped(e.target.checked)}
            />
            Group by swimlane
          </label>
        )}
        {view === "Calendar" && (
          <label className={styles.row}>
            <span className={styles.label}>Calendar date</span>
            <select
              className={base.btn}
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value as DateField)}
            >
              <option value="created">Created date</option>
              <option value="started">Started date</option>
              <option value="finished">Finished date</option>
            </select>
          </label>
        )}
        <label className={styles.row}>
          <span className={styles.label}>Sort by</span>
          <select
            className={base.btn}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={base.btn}
            aria-label={descending ? "Descending" : "Ascending"}
            onClick={() => setDescending((d) => !d)}
          >
            {descending ? "↓" : "↑"}
          </button>
        </label>
      </div>

      <BrowserWindow url="https://studio.supervaize.com/w/acme/jobs/job-2041" bodyStyle={{ padding: 0 }}>
        <div className={base.screen}>
          <div className={base.cardTitle}>Cases</div>

          {view === "Board" &&
            swimlanes((cases) => (
              <div className={styles.columns}>
                {COLUMNS.map(([label, statuses]) => {
                  const inColumn = cases.filter((c) => statuses.includes(c.status));
                  return (
                    <div key={label} className={styles.col}>
                      <span className={styles.label}>
                        {label} {inColumn.length}
                      </span>
                      {inColumn.map(card)}
                    </div>
                  );
                })}
              </div>
            ))}

          {view === "List" && (grouped ? swimlanes(table) : table(sorted))}

          {view === "Calendar" && (
            <div className={styles.days}>
              {[...DAYS, "No date"].map((day) => {
                const key = day === "No date" ? "" : day;
                const onDay = sorted.filter((c) => c[calendarDate] === key);
                if (day === "No date" && onDay.length === 0) return null;
                return (
                  <div key={day} className={clsx(styles.lane, styles.col)}>
                    <span className={styles.laneHead}>
                      {day} <span className={styles.chip}>{onDay.length}</span>
                    </span>
                    {onDay.length === 0 ? (
                      <span className={base.muted}>&nbsp; No cases</span>
                    ) : (
                      onDay.map(card)
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BrowserWindow>
      <p className={base.caption}>
        Working miniature with fictional cases. In Studio these options live in
        the Display and Sort menus of the Cases section.
      </p>
    </div>
  );
}
