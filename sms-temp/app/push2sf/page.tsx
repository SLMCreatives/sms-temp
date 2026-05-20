/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import {
  Engagement,
  SalesforceTask,
  mapEngagementToSFTask
} from "@/lib/sf-mapping";
import styles from "./page.module.css";

type FilterState = {
  date_from: string;
  date_to: string;
  sst_id: string;
  search: string;
  outcomes: string[];
};

const OUTCOME_OPTIONS = [
  "Contacted",
  "Responded",
  "No Response",
  "In Progress",
  "Resolved",
  "Escalated",
  "At Risk",
];

const SST_NAMES: Record<number, string> = {
  1: "Amirul",
  2: "Farzana",
  3: "Najwa",
  4: "Ayu",
  6: "Miru"
};

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: "#16a34a",
  Neutral: "#b45309",
  Negative: "#dc2626"
};

const STATUS_COLORS: Record<string, string> = {
  Successful: "#16a34a",
  "Not Started": "#b45309",
  "No Reply": "#4b5563",
  "Not Interested": "#dc2626",
};

const OUTCOME_LABELS: Record<string, string> = {
  no_response: "No Response",
  no_issue: "No Issue",
  "followup-ro": "Follow-up (RO)",
  "followup-sales": "Follow-up (Sales)",
  withdrawn: "Withdrawn",
  deferred: "Deferred",
};

export default function HomePage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    date_from: "",
    date_to: "",
    sst_id: "",
    search: "",
    outcomes: []
  });
  const [exported, setExported] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [outcomeDropdownOpen, setOutcomeDropdownOpen] = useState(false);
  const outcomeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (outcomeRef.current && !outcomeRef.current.contains(e.target as Node)) {
        setOutcomeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/push2sf/api/engagements");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setEngagements(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = engagements.filter((e) => {
    if (filters.date_from) {
      const from = new Date(filters.date_from);
      from.setHours(0, 0, 0, 0);
      if (new Date(e.created_at) < from) return false;
    }
    if (filters.date_to) {
      const to = new Date(filters.date_to);
      to.setHours(23, 59, 59, 999);
      if (new Date(e.created_at) > to) return false;
    }
    if (filters.sst_id && String(e.sst_id) !== filters.sst_id) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !e.student_name?.toLowerCase().includes(q) &&
        !e.matric_no?.toLowerCase().includes(q) &&
        !e.student_email?.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.outcomes.length > 0) {
      const label = e.outcome ? (OUTCOME_LABELS[e.outcome] ?? e.outcome) : "";
      if (!filters.outcomes.includes(label)) return false;
    }
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((e) => e.id)));
    }
  };

  const exportSelected = () => {
    const toExport = engagements
      .filter((e) => selected.has(e.id))
      .map(mapEngagementToSFTask);

    const blob = new Blob([JSON.stringify(toExport, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sf_tasks_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const getSFStatus = (outcome: string | null) => {
    const map: Record<string, string> = {
      // current outcome values
      Contacted: "Successful",
      Responded: "Successful",
      "No Response": "No Reply",
      "In Progress": "Successful",
      Resolved: "Successful",
      Escalated: "Successful",
      "At Risk": "Not Interested",
      // legacy DB values
      no_response: "No Reply",
      no_issue: "Successful",
      "followup-ro": "Not Started",
      "followup-sales": "Not Started",
      withdrawn: "Not Interested",
      deferred: "Not Interested",
    };
    return outcome ? (map[outcome] ?? "Not Started") : "—";
  };

  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>⬡</span>
          <div>
            <h1 className={styles.title}>Engagement Uploader</h1>
            <p className={styles.subtitle}>
              Supabase → Salesforce SST Activity
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{engagements.length}</span>
            <span className={styles.statLabel}>total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{filtered.length}</span>
            <span className={styles.statLabel}>filtered</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: "var(--accent)" }}>
              {selected.size}
            </span>
            <span className={styles.statLabel}>selected</span>
          </div>
          <button
            className={styles.refreshBtn}
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? "↻" : "↺"} Refresh
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <input
            className={styles.search}
            placeholder="Search name, matric, email…"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
          />
          <label className={styles.dateLabel}>
            From
            <input
              type="date"
              className={styles.select}
              value={filters.date_from}
              onChange={(e) =>
                setFilters((f) => ({ ...f, date_from: e.target.value }))
              }
            />
          </label>
          <label className={styles.dateLabel}>
            To
            <input
              type="date"
              className={styles.select}
              value={filters.date_to}
              onChange={(e) =>
                setFilters((f) => ({ ...f, date_to: e.target.value }))
              }
            />
          </label>
          <select
            className={styles.select}
            value={filters.sst_id}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sst_id: e.target.value }))
            }
          >
            <option value="">All SST</option>
            {Object.entries(SST_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <div className={styles.outcomeDropdown} ref={outcomeRef}>
            <button
              className={`${styles.select} ${styles.outcomeBtn} ${filters.outcomes.length > 0 ? styles.outcomeBtnActive : ""}`}
              onClick={() => setOutcomeDropdownOpen((o) => !o)}
              type="button"
            >
              {filters.outcomes.length === 0
                ? "Outcome"
                : `Outcome (${filters.outcomes.length})`}
              <span className={styles.outcomeChevron}>{outcomeDropdownOpen ? "▲" : "▼"}</span>
            </button>
            {outcomeDropdownOpen && (
              <div className={styles.outcomePanel}>
                {OUTCOME_OPTIONS.map((opt) => {
                  const checked = filters.outcomes.includes(opt);
                  return (
                    <label key={opt} className={styles.outcomeOption}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setFilters((f) => ({
                            ...f,
                            outcomes: checked
                              ? f.outcomes.filter((o) => o !== opt)
                              : [...f.outcomes, opt]
                          }))
                        }
                        className={styles.checkbox}
                      />
                      {opt}
                    </label>
                  );
                })}
                {filters.outcomes.length > 0 && (
                  <button
                    className={styles.outcomeClear}
                    onClick={() => setFilters((f) => ({ ...f, outcomes: [] }))}
                  >
                    Clear selection
                  </button>
                )}
              </div>
            )}
          </div>
          {(filters.date_from ||
            filters.date_to ||
            filters.sst_id ||
            filters.search ||
            filters.outcomes.length > 0) && (
            <button
              className={styles.clearBtn}
              onClick={() =>
                setFilters({
                  date_from: "",
                  date_to: "",
                  sst_id: "",
                  search: "",
                  outcomes: []
                })
              }
            >
              Clear
            </button>
          )}
        </div>
        <div className={styles.actions}>
          <button className={styles.selectAllBtn} onClick={selectAll}>
            {selected.size === filtered.length && filtered.length > 0
              ? "Deselect All"
              : `Select All (${filtered.length})`}
          </button>
          <button
            className={styles.exportBtn}
            onClick={exportSelected}
            disabled={selected.size === 0}
          >
            {exported ? "✓ Exported!" : `Export ${selected.size} to JSON`}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠ {error}</span>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingDots}>
              <span />
              <span />
              <span />
            </div>
            <p>Fetching engagements…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No records match your filters.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkCol}>
                  <input
                    type="checkbox"
                    checked={
                      selected.size === filtered.length && filtered.length > 0
                    }
                    onChange={selectAll}
                    className={styles.checkbox}
                  />
                </th>
                <th>Student</th>
                <th>Matric No</th>
                <th>Channel / Topic</th>
                <th>Outcome → SF Status</th>
                <th>Sentiment</th>
                <th>SST</th>
                <th>Follow-up</th>
                <th>Date</th>
                <th className={styles.expandCol}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const sfStatus = getSFStatus(e.outcome);
                const isSelected = selected.has(e.id);
                const isExpanded = expandedRow === e.id;
                return (
                  <Fragment key={e.id}>
                    <tr
                      className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
                      onClick={() => toggleSelect(e.id)}
                    >
                      <td
                        className={styles.checkCol}
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(e.id)}
                          className={styles.checkbox}
                        />
                      </td>
                      <td>
                        <div className={styles.studentName}>
                          {e.student_name || "—"}
                        </div>
                        <div className={styles.studentEmail}>
                          {e.student_email || ""}
                        </div>
                      </td>
                      <td>
                        <span className={styles.mono}>{e.matric_no}</span>
                      </td>
                      <td>
                        <div className={styles.channel}>{e.channel || "—"}</div>
                        <div className={styles.topic}>{e.topic || ""}</div>
                      </td>
                      <td>
                        <div className={styles.outcomeWrap}>
                          <span className={styles.outcome}>
                            {e.outcome ? (OUTCOME_LABELS[e.outcome] ?? e.outcome) : "—"}
                          </span>
                          {e.outcome && (
                            <>
                              <span className={styles.arrow}>→</span>
                              <span
                                className={styles.sfStatus}
                                style={{
                                  color:
                                    STATUS_COLORS[sfStatus] ??
                                    "var(--text-muted)"
                                }}
                              >
                                {sfStatus}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        {e.sentiment ? (
                          <span
                            className={styles.sentiment}
                            style={{
                              color:
                                SENTIMENT_COLORS[e.sentiment] ??
                                "var(--text-muted)"
                            }}
                          >
                            {e.sentiment}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className={styles.sstName}>{e.sst_id ? (SST_NAMES[e.sst_id] ?? e.sst_id) : "—"}</td>
                      <td className={styles.mono}>
                        {e.next_followup_date || "—"}
                      </td>
                      <td className={styles.mono}>
                        {e.created_at
                          ? new Date(e.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className={styles.expandCol}>
                        <button
                          className={styles.expandBtn}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setExpandedRow(isExpanded ? null : e.id);
                          }}
                        >
                          {isExpanded ? "▲" : "▼"}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${e.id}-detail`} className={styles.detailRow}>
                        <td colSpan={10}>
                          <div className={styles.detailGrid}>
                            <div className={styles.detailSection}>
                              <div className={styles.detailLabel}>Remarks</div>
                              <div className={styles.detailValue}>
                                {e.remarks || "—"}
                              </div>
                            </div>
                            <div className={styles.detailSection}>
                              <div className={styles.detailLabel}>
                                Other Remarks
                              </div>
                              <div className={styles.detailValue}>
                                {e.topic_other_remarks || "—"}
                              </div>
                            </div>
                            <div className={styles.detailSection}>
                              <div className={styles.detailLabel}>Phone</div>
                              <div className={styles.detailValue}>
                                {e.student_phone || "—"}
                              </div>
                            </div>
                            <div className={styles.detailSection}>
                              <div className={styles.detailLabel}>
                                SF Comments Preview
                              </div>
                              <div className={styles.detailValue}>
                                <pre className={styles.commentPreview}>
                                  {e.remarks || "—"}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.mono} style={{ color: "var(--text-dim)" }}>
          Export produces sf_tasks_[date].json · Feed to Claude in Chrome to
          upload to Salesforce
        </span>
      </footer>
    </div>
  );
}
