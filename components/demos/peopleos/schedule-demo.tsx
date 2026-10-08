"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  attendanceToday,
  outlets,
  posDays,
  weekShifts,
  type AttendanceRow,
  type PosShift,
  type PosShiftStatus,
} from "@/content/demos/peopleos";
import { PersonName, PosHeader } from "./shell-demo";

const SHIFT_TONE: Record<PosShiftStatus, string> = {
  scheduled: "pos-shift-scheduled",
  published: "pos-shift-published",
  completed: "pos-shift-completed",
  cancelled: "pos-shift-cancelled",
  open: "pos-shift-open",
};

function useElapsed(running: boolean) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    setSecs(0);
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const STATUS_TONE: Record<AttendanceRow["status"], string> = {
  Active: "good",
  "On break": "warn",
  Completed: "neutral",
};

export function ScheduleDemo() {
  const [site, setSite] = useState("This Is Bali");
  const [weekOffset, setWeekOffset] = useState(0);
  const [period, setPeriod] = useState<"Day" | "Week">("Week");
  const [shifts, setShifts] = useState<PosShift[]>(weekShifts);
  const [addOpen, setAddOpen] = useState(false);
  const [addEmp, setAddEmp] = useState("Ayu");
  const [addDay, setAddDay] = useState(1);

  const [ledger, setLedger] = useState<AttendanceRow[]>(attendanceToday);
  const [dept, setDept] = useState("all");
  const [q, setQ] = useState("");
  const [kpi, setKpi] = useState<string | null>(null);
  const [editing, setEditing] = useState<AttendanceRow | null>(null);
  const [editOut, setEditOut] = useState("");
  const [deleting, setDeleting] = useState<AttendanceRow | null>(null);

  const [clockedIn, setClockedIn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [clockInAt, setClockInAt] = useState("");
  const elapsed = useElapsed(clockedIn);

  const drafts = shifts.filter((s) => s.draft).length;
  const publish = () => setShifts((prev) => prev.map((s) => ({ ...s, draft: false, status: s.status === "scheduled" ? "published" : s.status })));

  const addShift = () => {
    setShifts((prev) => [
      ...prev,
      {
        id: `w${Date.now()}`,
        employee: addEmp,
        full: addEmp,
        position: "Server",
        day: addDay,
        start: "13:00",
        end: "21:00",
        status: "scheduled",
        draft: true,
      },
    ]);
    setAddOpen(false);
  };

  const startClock = () => {
    setStarting(true);
    setTimeout(() => {
      const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      setStarting(false);
      setClockedIn(true);
      setClockInAt(now);
      setLedger((prev) => [
        {
          id: `a${Date.now()}`,
          member: "You (demo)",
          full: "Demo Visitor",
          job: "Server",
          dept: "Service",
          scheduled: "—",
          clockIn: now,
          clockOut: "—",
          hours: "0h",
          diff: "—",
          brk: "—",
          location: site,
          status: "Active",
          flags: [],
        },
        ...prev,
      ]);
    }, 900);
  };

  const endClock = () => {
    setClockedIn(false);
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setLedger((prev) =>
      prev.map((r) => (r.member === "You (demo)" && r.status === "Active" ? { ...r, clockOut: now, hours: "0.1h", status: "Completed" as const, flags: ["Edited"] } : r))
    );
  };

  const kpis = useMemo(() => {
    const inSite = ledger.filter((r) => site === "This Is Bali" || r.location === site);
    return [
      { id: "in", label: "Clocked in now", count: inSite.filter((r) => r.status !== "Completed").length },
      { id: "late", label: "Late clock-ins", count: inSite.filter((r) => r.flags.some((x) => x.startsWith("Late"))).length },
      { id: "out", label: "Need to clock out", count: inSite.filter((r) => r.flags.includes("Needs clock out")).length },
      { id: "all", label: "Total attendance", count: inSite.length },
    ];
  }, [ledger, site]);

  const filteredLedger = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ledger.filter(
      (r) =>
        (dept === "all" || r.dept === dept) &&
        (!s || r.member.toLowerCase().includes(s) || r.full.toLowerCase().includes(s)) &&
        (!kpi ||
          (kpi === "in" && r.status !== "Completed") ||
          (kpi === "late" && r.flags.some((x) => x.startsWith("Late"))) ||
          (kpi === "out" && r.flags.includes("Needs clock out")) ||
          kpi === "all")
    );
  }, [ledger, dept, q, kpi]);

  const dayIdx = 1;
  const days = period === "Day" ? [dayIdx] : [0, 1, 2, 3, 4, 5, 6];

  return (
    <div>
      <PosHeader
        eyebrow={`${site} · 13 – 19 Oct 2026`}
        title="Schedule"
        actions={
          <>
            <select className="pos-select" value={site} onChange={(e) => setSite(e.target.value)} aria-label="Outlet">
              {outlets.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <span className="pos-seg" role="group" aria-label="Period">
              {(["Day", "Week"] as const).map((p) => (
                <button key={p} className={cn(period === p && "on")} onClick={() => setPeriod(p)}>
                  {p}
                </button>
              ))}
            </span>
            <button
              className="pos-btn pos-btn-quiet pos-btn-sm"
              aria-label="Previous week"
              onClick={() => setWeekOffset((o) => o - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <b className="text-[13px]">
              {weekOffset === 0 ? "13 – 19 Oct 2026" : weekOffset > 0 ? "Next week" : "Previous week"}
            </b>
            <button
              className="pos-btn pos-btn-quiet pos-btn-sm"
              aria-label="Next week"
              onClick={() => setWeekOffset((o) => o + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {weekOffset !== 0 && (
              <button className="pos-btn pos-btn-text pos-btn-sm" onClick={() => setWeekOffset(0)}>
                Today
              </button>
            )}
            <button className="pos-btn pos-btn-primary pos-btn-sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add shift
            </button>
          </>
        }
      />

      {drafts > 0 && (
        <p className="pos-note pos-note-warn mb-4">
          {drafts} shifts are not published yet. Staff can already see them, but nobody has been
          notified.{" "}
          <button className="pos-btn pos-btn-primary pos-btn-sm ml-2" onClick={publish}>
            Publish {drafts} draft shifts
          </button>
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <section className="pos-card self-start">
          <div className="pos-card-body">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
            >
              {days.map((i) => (
                <div key={i} className="rounded-lg border border-[#1e293b] p-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                    {posDays[i]}
                    {i === dayIdx && <span className="pos-pill ml-1">Today</span>}
                  </p>
                  <div className="mt-2">
                    {shifts
                      .filter((s) => s.day === i)
                      .map((s) => (
                        <div key={s.id} className={cn("pos-shift", SHIFT_TONE[s.status])}>
                          <b>
                            {s.start}–{s.end}
                          </b>
                          <span>
                            {s.employee} · {s.position}
                          </span>{" "}
                          <span className="pos-pill">{s.status}</span>
                        </div>
                      ))}
                    {shifts.filter((s) => s.day === i).length === 0 && (
                      <p className="text-xs italic text-[#475569]">No shifts</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {addOpen && (
              <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-[#334155] p-3">
                <label className="text-[13px] text-[#94a3b8]">
                  <span className="pos-field-label">Employee</span>
                  <select className="pos-select" value={addEmp} onChange={(e) => setAddEmp(e.target.value)}>
                    {["Ayu", "Jonas", "Putri", "Made"].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[13px] text-[#94a3b8]">
                  <span className="pos-field-label">Day</span>
                  <select
                    className="pos-select"
                    value={addDay}
                    onChange={(e) => setAddDay(Number(e.target.value))}
                  >
                    {posDays.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="pos-btn pos-btn-primary pos-btn-sm" onClick={addShift}>
                  Add as draft
                </button>
                <button className="pos-btn pos-btn-quiet pos-btn-sm" onClick={() => setAddOpen(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="pos-card self-start" aria-label="GPS clock-in">
          <div className="pos-card-body">
            <p className="pos-metric-label">GPS clock-in · Time Clock</p>
            {!clockedIn ? (
              <>
                <p className="pos-lead mt-1">Total work hours today</p>
                <p className="font-mono text-2xl font-bold tabular-nums">04:12</p>
                <p className="mt-1 text-[12.5px] text-emerald-300">GPS signal active (±12 m)</p>
                <label className="mt-3 block text-[13px] text-[#94a3b8]">
                  <span className="pos-field-label">Clock-in location</span>
                  <select className="pos-select w-full" value={site} onChange={(e) => setSite(e.target.value)}>
                    {outlets.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <p className="mt-2 text-[13px]">
                  Inside {site} <span className="text-[#94a3b8]">(12m away, radius 100m)</span>
                </p>
                <p className="pos-note pos-note-good mt-2">You&apos;re at {site} — tap to clock in</p>
                <div className="mt-4 flex justify-center">
                  <button className="pos-clock" onClick={startClock} disabled={starting}>
                    {starting ? "Starting…" : "Start shift"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="pos-workcard mt-2">
                  <p className="text-[13px] uppercase tracking-widest opacity-80">Work time on</p>
                  <p className="font-mono text-4xl font-bold tabular-nums" aria-label="Elapsed time">
                    {elapsed}
                  </p>
                  <p className="mt-1 text-[13px] opacity-90">
                    Clocked in at: {site} · {clockInAt}
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="pos-btn pos-btn-quiet flex-1 justify-center">Break</button>
                  <button className="pos-btn pos-btn-primary flex-1 justify-center" onClick={endClock}>
                    End Shift
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="pos-card mt-5">
        <div className="pos-card-body">
          <p className="pos-eyebrow">Clock-in records for the {site} department.</p>
          <h3 className="pos-title" style={{ fontSize: 24 }}>
            Attendance · {site}.<span className="pos-dot" style={{ display: "none" }} />
          </h3>
          <div className="mt-3 flex gap-2" role="tablist" aria-label="Attendance views">
            <button role="tab" aria-selected="true" className="pos-btn pos-btn-quiet pos-btn-sm" style={{ borderColor: "#6366f1", color: "#f1f5f9" }}>
              Today
            </button>
            <button role="tab" aria-selected="false" className="pos-btn pos-btn-quiet pos-btn-sm" disabled title="Mock: one day only">
              Timesheets
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select className="pos-select" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
              <option value="all">All departments</option>
              <option>Service</option>
              <option>Kitchen</option>
              <option>Bar</option>
            </select>
            <input
              className="pos-input min-w-[180px] flex-1"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search team member"
              aria-label="Search team member"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {kpis.map((k) => (
              <button
                key={k.id}
                className="pos-btn pos-btn-quiet pos-btn-sm"
                style={kpi === k.id ? { borderColor: "#6366f1", color: "#f1f5f9" } : undefined}
                onClick={() => setKpi((cur) => (cur === k.id ? null : k.id))}
              >
                {k.label} · <b>{k.count}</b>
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="pos-table min-w-[900px]">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Job</th>
                <th>Scheduled</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Difference</th>
                <th>Break</th>
                <th>Location</th>
                <th>Status</th>
                <th>Flags</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map((r) => (
                <tr key={r.id}>
                  <td>
                    <PersonName nick={r.member} full={r.full} />
                  </td>
                  <td>{r.job}</td>
                  <td className="font-mono text-[12.5px]">{r.scheduled}</td>
                  <td className="font-mono text-[12.5px]">{r.clockIn}</td>
                  <td className="font-mono text-[12.5px]">{r.clockOut}</td>
                  <td>{r.hours}</td>
                  <td className="font-mono text-[12.5px]">{r.diff}</td>
                  <td>{r.brk}</td>
                  <td>{r.location}</td>
                  <td>
                    <span className={cn("pos-tag", `pos-tone-${STATUS_TONE[r.status]}`)}>{r.status}</span>
                  </td>
                  <td className="text-[12px] text-amber-300">{r.flags.join(" · ") || "—"}</td>
                  <td className="whitespace-nowrap">
                    <button
                      className="pos-btn pos-btn-quiet pos-btn-sm mr-1"
                      aria-label={`Edit attendance for ${r.member}`}
                      onClick={() => {
                        setEditing(r);
                        setEditOut(r.clockOut === "—" ? "" : r.clockOut);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="pos-btn pos-btn-quiet pos-btn-sm"
                      aria-label={`Delete attendance for ${r.member}`}
                      onClick={() => setDeleting(r)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLedger.length === 0 && (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-[#475569]">
                    No records match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="pos-drawer-veil" onClick={() => setEditing(null)}>
          <div className="pos-drawer" role="dialog" aria-label="Edit Attendance" onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 100%)" }}>
            <h3 className="text-lg font-semibold">Edit Attendance</h3>
            <p className="pos-lead">{editing.member}</p>
            <label className="mt-4 block text-sm text-[#94a3b8]">
              <span className="pos-field-label">Clock Out (leave empty to keep open)</span>
              <input
                className="pos-input w-full font-mono"
                value={editOut}
                onChange={(e) => setEditOut(e.target.value)}
                placeholder="21:05"
              />
            </label>
            <p className="pos-lead mt-3">
              Saving marks this record as manually edited and records your user id.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="pos-btn pos-btn-quiet" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                className="pos-btn pos-btn-primary"
                onClick={() => {
                  setLedger((prev) =>
                    prev.map((r) =>
                      r.id === editing.id
                        ? { ...r, clockOut: editOut.trim() || "—", flags: Array.from(new Set([...r.flags, "Edited"])) }
                        : r
                    )
                  );
                  setEditing(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="pos-drawer-veil" onClick={() => setDeleting(null)}>
          <div className="pos-drawer" role="alertdialog" aria-label="Delete attendance" onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 100%)" }}>
            <h3 className="text-lg font-semibold">Delete attendance for {deleting.member}?</h3>
            <p className="pos-lead mt-2">
              Delete this clock-in for {deleting.member} ({deleting.clockIn})? This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="pos-btn pos-btn-quiet" onClick={() => setDeleting(null)}>
                Cancel
              </button>
              <button
                className="pos-btn pos-btn-danger"
                onClick={() => {
                  setLedger((prev) => prev.filter((r) => r.id !== deleting.id));
                  setDeleting(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
