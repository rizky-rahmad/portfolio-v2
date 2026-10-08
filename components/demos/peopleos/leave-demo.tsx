"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileText, Inbox, RefreshCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  initialApprovals,
  kindLabel,
  outlets,
  stepLabel,
  type Approval,
  type ApprovalKind,
  type ApprovalStatus,
} from "@/content/demos/peopleos";
import { Avatar, PersonName, PosHeader, Tag } from "./shell-demo";

const toneOf = (s: ApprovalStatus) =>
  s === "approved" ? "good" : s === "rejected" ? "bad" : "warn";

function StepIcon({ status }: { status: ApprovalStatus }) {
  const Icon = status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : Clock3;
  return (
    <span
      className={cn(
        "inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full",
        status === "approved" && "bg-emerald-500/15 text-emerald-300",
        status === "rejected" && "bg-rose-500/15 text-rose-300",
        status === "pending" && "bg-amber-500/15 text-amber-300"
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function LeaveDemo() {
  const [view, setView] = useState<"inbox" | "schedule">("inbox");
  const [rows, setRows] = useState<Approval[]>(initialApprovals);
  const [kind, setKind] = useState<ApprovalKind | "">("");
  const [status, setStatus] = useState("pending");
  const [outlet, setOutlet] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>("APR-201");
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState("");
  const [railQ, setRailQ] = useState("");

  const queue = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!kind || r.kind === kind) &&
          (status === "all" || r.status === status) &&
          (outlet === "all" || r.outlet === outlet)
      ),
    [rows, kind, status, outlet]
  );
  const selected = queue.find((r) => r.id === selectedId) ?? queue[0] ?? null;

  const rail = useMemo(() => {
    const s = railQ.trim().toLowerCase();
    const list = rows.filter((r) => outlet === "all" || r.outlet === outlet);
    const f = (l: Approval[]) =>
      s ? l.filter((r) => r.nickname.toLowerCase().includes(s) || r.typeLabel.toLowerCase().includes(s)) : l;
    return {
      pending: f(list.filter((r) => r.status === "pending")),
      history: f(list.filter((r) => r.status !== "pending")),
    };
  }, [rows, railQ, outlet]);

  const railSelected =
    rail.pending.concat(rail.history).find((r) => r.id === selectedId) ??
    rail.pending[0] ??
    rail.history[0] ??
    null;

  const decide = (id: string, decision: "approved" | "rejected") => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const step = r.reviewAs === "leader" ? "leader" : "pc";
        const afterStep = {
          ...r[step],
          status: decision as ApprovalStatus,
          reviewerName: r.reviewAs === "leader" ? "You (leader)" : "You (PC)",
          reviewedAt: "just now",
          note: note.trim() || undefined,
        };
        if (decision === "rejected")
          return { ...r, status: "rejected" as ApprovalStatus, needsYou: false, [step]: afterStep };
        if (r.reviewAs === "leader")
          return { ...r, leader: afterStep, reviewAs: "pc" as const, needsYou: true };
        return { ...r, pc: afterStep, status: "approved" as ApprovalStatus, needsYou: false };
      })
    );
    setNote("");
    const wasLeader = selected?.reviewAs === "leader";
    setFlash(
      decision === "rejected"
        ? "Request rejected."
        : wasLeader
          ? "Your approval is saved. The request is still waiting for the other approver."
          : "Request fully approved."
    );
  };

  return (
    <div>
      <PosHeader
        eyebrow={`${outlet === "all" ? "All outlets" : outlet} · 06 – 12 Oct 2026`}
        title="Requests"
        actions={
          <>
            <select
              className="pos-select"
              value={outlet}
              onChange={(e) => setOutlet(e.target.value)}
              title="Filter by outlet"
              aria-label="Filter by outlet"
            >
              <option value="all">All outlets</option>
              {outlets.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <button
              className="pos-btn pos-btn-quiet pos-btn-sm"
              onClick={() => {
                setRows(initialApprovals);
                setNote("");
                setFlash("");
              }}
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
          </>
        }
      />

      <div className="pos-tabs" role="tablist" aria-label="Request views">
        <button
          role="tab"
          aria-selected={view === "inbox"}
          className={cn("pos-tab", view === "inbox" && "pos-tab-on")}
          onClick={() => setView("inbox")}
        >
          Approval inbox
        </button>
        <button
          role="tab"
          aria-selected={view === "schedule"}
          className={cn("pos-tab", view === "schedule" && "pos-tab-on")}
          onClick={() => setView("schedule")}
        >
          Shift requests &amp; leave history
        </button>
      </div>

      {view === "inbox" && (
        <>
          <p className="pos-lead" style={{ marginBottom: 12 }}>
            Review leave, attendance corrections and overtime within your access.
          </p>
          <div className="mb-4 flex flex-wrap gap-3">
            <label className="text-[13px] text-[#94a3b8]">
              <span className="pos-field-label">Request type</span>
              <select
                className="pos-select"
                value={kind}
                onChange={(e) => setKind(e.target.value as ApprovalKind | "")}
                aria-label="Request type"
              >
                <option value="">All types</option>
                <option value="leave">Leave</option>
                <option value="correction">Correction</option>
                <option value="overtime">Overtime</option>
              </select>
            </label>
            <label className="text-[13px] text-[#94a3b8]">
              <span className="pos-field-label">Status</span>
              <select
                className="pos-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label="Status"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All statuses</option>
              </select>
            </label>
          </div>

          {queue.length === 0 ? (
            <div className="pos-card">
              <div className="pos-card-body p-10 text-center">
                <Inbox className="mx-auto h-8 w-8 text-[#475569]" />
                <p className="mt-2 font-semibold">Nothing here.</p>
                <p className="pos-lead mx-auto">No requests match this view.</p>
              </div>
            </div>
          ) : (
            <ul className="pos-card pos-card-flush divide-y divide-[#1e293b] overflow-hidden">
              {queue.map((r) => (
                <li key={r.id}>
                  <button
                    className={cn("pos-row", selected?.id === r.id && "pos-row-sel")}
                    onClick={() => {
                      setSelectedId(r.id);
                      setNote("");
                      setFlash("");
                    }}
                  >
                    <Avatar name={r.nickname} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="pos-row-title">
                        {r.needsYou && r.status === "pending" && <span className="pos-unread-dot" />}
                        <PersonName nick={r.nickname} full={`${r.employee} · ${r.department}`} />
                      </span>
                      <span className="pos-row-sub">
                        {kindLabel[r.kind]} · {r.typeLabel} · {r.outlet} · {r.dates}
                      </span>
                      <span className="pos-row-sub">
                        Leader: {stepLabel[r.leader.status]} · PC: {stepLabel[r.pc.status]}{" "}
                        {r.needsYou && r.status === "pending" && (
                          <b className="text-[#a5b4fc]">· Awaiting your review</b>
                        )}
                      </span>
                    </span>
                    <span className="pos-row-val">
                      <Tag tone={toneOf(r.status)}>{stepLabel[r.status]}</Tag>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selected && (
            <article className="pos-card mt-5" aria-label="Request details">
              <div className="pos-card-body">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{selected.nickname}</h3>
                    <p className="mt-0.5 text-[13px] text-[#94a3b8]">
                      {selected.employee} · {selected.department} · {selected.outlet}
                    </p>
                  </div>
                  <Tag tone={toneOf(selected.status)}>{stepLabel[selected.status]}</Tag>
                </header>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[#94a3b8]">Request type</dt>
                    <dd className="mt-1 font-medium">
                      {kindLabel[selected.kind]} · {selected.typeLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#94a3b8]">Submitted</dt>
                    <dd className="mt-1 font-medium">{selected.submitted}</dd>
                  </div>
                  <div>
                    <dt className="text-[#94a3b8]">Period</dt>
                    <dd className="mt-1 font-medium">{selected.dates}</dd>
                  </div>
                  {selected.duration && (
                    <div>
                      <dt className="text-[#94a3b8]">Duration</dt>
                      <dd className="mt-1 font-medium">{selected.duration}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-3">
                  <h4 className="text-sm font-semibold">Reason</h4>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[#cbd5e1]">“{selected.reason}”</p>
                </div>

                {selected.attachment && (
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold">Attachments</h4>
                    <p className="mt-1 flex items-center gap-2 text-sm text-[#a5b4fc]">
                      <FileText className="h-4 w-4" /> {selected.attachment}
                    </p>
                  </div>
                )}

                <section aria-label="Approval progress" className="mt-4 border-t border-[#1e293b] pt-3">
                  <p className="text-[13px] text-[#94a3b8]">
                    Requires approval from a leader and a selected PC admin.
                  </p>
                  <ol className="mt-1">
                    {(
                      [
                        { label: "Leader (manager)", step: selected.leader },
                        { label: "PC (selected admin)", step: selected.pc },
                      ] as const
                    ).map(({ label, step }) => (
                      <li key={label} className="flex gap-3 border-b border-[#1e293b]/60 py-3 last:border-0">
                        <StepIcon status={step.status} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{label}</span>
                            <Tag tone={toneOf(step.status)}>{stepLabel[step.status]}</Tag>
                          </div>
                          {step.reviewerName && (
                            <p className="mt-0.5 text-xs text-[#94a3b8]">
                              {step.reviewerName} · {step.reviewedAt}
                            </p>
                          )}
                          {step.note && <p className="mt-1 text-sm text-[#cbd5e1]">“{step.note}”</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                {flash && (
                  <p role="status" className={cn("pos-note mt-3", flash.includes("reject") ? "pos-note-bad" : "pos-note-good")}>
                    {flash}
                  </p>
                )}

                {selected.needsYou && selected.status === "pending" ? (
                  <div className="mt-3 space-y-3 border-t border-[#1e293b] pt-4">
                    <p className="text-sm font-semibold">
                      Your decision as {selected.reviewAs === "leader" ? "Leader (manager)" : "PC (selected admin)"}
                    </p>
                    <label className="block text-sm text-[#94a3b8]" htmlFor="pos-review-note">
                      Reviewer note (optional)
                    </label>
                    <textarea
                      id="pos-review-note"
                      rows={2}
                      maxLength={2000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="pos-area w-full"
                      placeholder="Context for the team…"
                    />
                    <div className="flex flex-wrap justify-end gap-2">
                      <button className="pos-btn pos-btn-danger" onClick={() => decide(selected.id, "rejected")}>
                        Reject
                      </button>
                      <button className="pos-btn pos-btn-primary" onClick={() => decide(selected.id, "approved")}>
                        Approve
                      </button>
                    </div>
                  </div>
                ) : (
                  selected.status === "pending" && (
                    <p className="pos-note mt-3 bg-[#1e293b]/60 text-[#94a3b8]">
                      Waiting on the {selected.reviewAs === "leader" ? "leader" : "PC admin"} — nothing for you to do.
                    </p>
                  )
                )}
              </div>
            </article>
          )}
        </>
      )}

      {view === "schedule" && (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="pos-card pos-card-flush self-start">
            <div className="px-[18px] pt-3">
              <input
                className="pos-input w-full"
                value={railQ}
                onChange={(e) => setRailQ(e.target.value)}
                placeholder="Search name or type…"
                aria-label="Search requests"
              />
            </div>
            <p className="pos-metric-label px-[18px] pb-1.5 pt-3.5">Pending</p>
            {rail.pending.length === 0 && (
              <p className="px-[18px] pb-3 text-[13px] text-[#94a3b8]">No pending requests.</p>
            )}
            {rail.pending.map((r) => (
              <button
                key={r.id}
                className={cn("pos-row", railSelected?.id === r.id && "pos-row-sel")}
                onClick={() => setSelectedId(r.id)}
              >
                <Avatar name={r.nickname} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="pos-row-title">
                    <span className="pos-unread-dot" />
                    {r.nickname} · {r.outlet}
                  </span>
                  <span className="pos-row-sub">
                    {r.typeLabel} · {r.dates}
                  </span>
                </span>
              </button>
            ))}
            <p className="pos-metric-label px-[18px] pb-1.5 pt-3.5">History</p>
            {rail.history.length === 0 && (
              <p className="px-[18px] pb-3 text-[13px] text-[#94a3b8]">No history yet.</p>
            )}
            {rail.history.map((r) => (
              <button
                key={r.id}
                className={cn("pos-row", railSelected?.id === r.id && "pos-row-sel")}
                onClick={() => setSelectedId(r.id)}
              >
                <Avatar name={r.nickname} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="pos-row-title">
                    {r.nickname} · {r.outlet}
                  </span>
                  <span className="pos-row-sub">
                    {r.typeLabel} · {r.dates}
                  </span>
                </span>
                <span className="pos-row-val">
                  <Tag tone={toneOf(r.status)}>{stepLabel[r.status]}</Tag>
                </span>
              </button>
            ))}
          </div>

          <div className="pos-card min-w-0 self-start">
            <div className="pos-card-body">
              {railSelected ? (
                <>
                  <p className="pos-eyebrow">
                    {railSelected.typeLabel} · sent {railSelected.submitted}
                  </p>
                  <h3 className="pos-title" style={{ fontSize: 24 }}>
                    {railSelected.nickname}
                    <span className="pos-dot">.</span>
                  </h3>
                  <p className="pos-lead">
                    {railSelected.employee} · {railSelected.department}
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm">
                    <div>
                      <p className="text-[#94a3b8]">Period</p>
                      <p className="mt-0.5 font-medium">{railSelected.dates}</p>
                    </div>
                    <div>
                      <p className="text-[#94a3b8]">Status</p>
                      <p className="mt-0.5">
                        <Tag tone={toneOf(railSelected.status)}>{stepLabel[railSelected.status]}</Tag>
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[#94a3b8]">Reason</p>
                      <p className="mt-0.5">“{railSelected.reason}”</p>
                    </div>
                  </div>
                  <section aria-label="Approval progress" className="mt-4">
                    <p className="text-[13px] text-[#94a3b8]">
                      Requires approval from a leader and a selected PC admin.
                    </p>
                    <ol className="mt-1">
                      {(
                        [
                          { label: "Leader (manager)", step: railSelected.leader },
                          { label: "PC (selected admin)", step: railSelected.pc },
                        ] as const
                      ).map(({ label, step }) => (
                        <li key={label} className="flex gap-3 border-b border-[#1e293b]/60 py-3 last:border-0">
                          <StepIcon status={step.status} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-semibold">{label}</span>
                              <Tag tone={toneOf(step.status)}>{stepLabel[step.status]}</Tag>
                            </div>
                            {step.reviewerName && (
                              <p className="mt-0.5 text-xs text-[#94a3b8]">
                                {step.reviewerName} · {step.reviewedAt}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                  <div className="mt-3">
                    <button
                      className="pos-btn pos-btn-text pos-btn-sm"
                      onClick={() => {
                        setView("inbox");
                        setFlash("");
                      }}
                    >
                      View approval progress
                    </button>
                  </div>
                </>
              ) : (
                <p className="p-6 text-center text-sm text-[#64748b]">Pick a request to review.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
