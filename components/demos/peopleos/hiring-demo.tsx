"use client";

import { useMemo, useState } from "react";
import { Plus, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  hireJobs,
  hireStageLabel,
  hireStages,
  initialHireCandidates,
  type HireCandidate,
  type HireStage,
} from "@/content/demos/peopleos";
import { Avatar, PersonName, PosHeader, Tag } from "./shell-demo";

const STAGE_TONE: Record<HireStage, string> = {
  applied: "neutral",
  screening: "info",
  trial: "teal",
  interview: "ink",
  offer: "warn",
  hired: "good",
  rejected: "bad",
};

function Stars({ value, onRate, label }: { value: number; onRate: (v: number) => void; label: string }) {
  return (
    <span role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          className={cn("pos-star", s <= value && "pos-star-on")}
          onClick={() => onRate(s === value ? 0 : s)}
          aria-label={`${label}: ${s} star${s > 1 ? "s" : ""}`}
        >
          <Star className="h-3.5 w-3.5" fill={s <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </span>
  );
}

type SortBy = "createdAt" | "name" | "rating";
const PAGE_SIZE = 5;

export function HiringDemo() {
  const [rows, setRows] = useState<HireCandidate[]>(initialHireCandidates);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<HireStage | "all">("all");
  const [job, setJob] = useState("all");
  const [waOnly, setWaOnly] = useState(false);
  const [sort, setSort] = useState<SortBy>("createdAt");
  const [view, setView] = useState<"table" | "cards">("table");
  const [page, setPage] = useState(0);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<"assessment" | "cv" | "whatsapp">("assessment");
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newJob, setNewJob] = useState("Server");
  const [deleting, setDeleting] = useState<HireCandidate | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = rows.filter(
      (c) =>
        (stage === "all" || c.stage === stage) &&
        (job === "all" || c.job === job) &&
        (!waOnly || c.wa) &&
        (!s ||
          c.name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.phone.includes(s) ||
          c.job.toLowerCase().includes(s))
    );
    return [...list].sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : sort === "rating" ? b.rating - a.rating : 0
    );
  }, [rows, q, stage, job, waOnly, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const move = (id: string, next: HireStage) =>
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, stage: next } : c)));
  const rate = (id: string, v: number) =>
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, rating: v } : c)));

  const add = () => {
    const n = name.trim();
    if (!n) return;
    setRows((prev) => [
      {
        id: `h${Date.now()}`,
        name: n,
        email: email.trim() || `${n.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: "+62 812 0099",
        job: newJob,
        dept: newJob === "Kitchen" ? "Kitchen" : newJob === "Barista" ? "Bar" : "Service",
        stage: "applied",
        source: "WA",
        score: null,
        rating: 0,
        wa: false,
        applied: "just now",
        video: false,
        cv: "New application — CV under review.",
      },
      ...prev,
    ]);
    setName("");
    setEmail("");
    setFormOpen(false);
    setPage(0);
  };

  const drawer = rows.find((c) => c.id === drawerId) ?? null;
  const stageIdx = drawer ? hireStages.indexOf(drawer.stage) : -1;

  const stats = [
    { label: "Total candidates", value: rows.length },
    { label: "Completed applications", value: rows.filter((c) => c.wa).length },
    { label: "In progress", value: rows.filter((c) => !["hired", "rejected"].includes(c.stage)).length },
    { label: "Last 24 hours", value: 3 },
  ];

  return (
    <div>
      <PosHeader
        eyebrow="All jobs"
        title="Candidates"
        actions={
          <>
            <button className="pos-btn pos-btn-quiet pos-btn-sm" onClick={() => setRows(initialHireCandidates)}>
              Refresh
            </button>
            <button className="pos-btn pos-btn-primary pos-btn-sm" onClick={() => setFormOpen((o) => !o)}>
              <Plus className="h-4 w-4" /> Add candidate
            </button>
          </>
        }
      />

      {formOpen && (
        <div className="pos-card mb-4">
          <div className="pos-card-body">
            <h3 className="text-base font-semibold">Add candidate</h3>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="text-[13px] text-[#94a3b8]">
                <span className="pos-field-label">Job</span>
                <select className="pos-select" value={newJob} onChange={(e) => setNewJob(e.target.value)} aria-label="Job">
                  <option value="">Select a job…</option>
                  {hireJobs.map((j) => (
                    <option key={j}>{j}</option>
                  ))}
                </select>
              </label>
              <label className="text-[13px] text-[#94a3b8]">
                <span className="pos-field-label">Full name</span>
                <input className="pos-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-label="Full name" />
              </label>
              <label className="text-[13px] text-[#94a3b8]">
                <span className="pos-field-label">Email</span>
                <input className="pos-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" />
              </label>
              <label className="text-[13px] text-[#94a3b8]">
                <span className="pos-field-label">Phone</span>
                <input className="pos-input" value="+62 812 0099" disabled aria-label="Phone" />
              </label>
              <label className="text-[13px] text-[#94a3b8]">
                <span className="pos-field-label">Source</span>
                <input className="pos-input" value="WA" disabled aria-label="Source" />
              </label>
              <button className="pos-btn pos-btn-primary pos-btn-sm" onClick={add} disabled={!name.trim() || !newJob}>
                Add candidate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="pos-card">
            <div className="pos-card-body">
              <p className="pos-metric-label">{s.label}</p>
              <p className="pos-metric-figure">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="pos-input min-w-[220px] flex-1"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Search by name, email, phone, job or stage…"
          aria-label="Search candidates"
        />
        <select
          className="pos-select"
          value={stage}
          onChange={(e) => {
            setStage(e.target.value as HireStage | "all");
            setPage(0);
          }}
          aria-label="Stage filter"
        >
          <option value="all">All stages</option>
          {hireStages.map((s) => (
            <option key={s} value={s}>
              {hireStageLabel[s]}
            </option>
          ))}
        </select>
        <select
          className="pos-select"
          value={job}
          onChange={(e) => {
            setJob(e.target.value);
            setPage(0);
          }}
          aria-label="Job filter"
        >
          <option value="all">All jobs</option>
          {hireJobs.map((j) => (
            <option key={j}>{j}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[13px] text-[#94a3b8]">
          <input
            type="checkbox"
            checked={waOnly}
            onChange={(e) => {
              setWaOnly(e.target.checked);
              setPage(0);
            }}
          />
          WhatsApp verified only
        </label>
        <button
          className="pos-btn pos-btn-quiet pos-btn-sm"
          onClick={() => setSort((s) => (s === "createdAt" ? "name" : s === "name" ? "rating" : "createdAt"))}
        >
          Sort: {sort === "createdAt" ? "Newest" : sort === "name" ? "Name" : "Rating"}
        </button>
        <span className="pos-seg" role="group" aria-label="View">
          {(["table", "cards"] as const).map((v) => (
            <button key={v} className={cn(view === v && "on")} onClick={() => setView(v)}>
              {v === "table" ? "Table" : "Cards"}
            </button>
          ))}
        </span>
      </div>

      {view === "table" ? (
        <div className="pos-card pos-card-flush mt-3 overflow-x-auto">
          <table className="pos-table min-w-[920px]">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Stage</th>
                <th>Source</th>
                <th>Score</th>
                <th>Rating</th>
                <th>Applied</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {paged.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="flex items-center gap-2">
                      <Avatar name={c.name} size={30} />
                      <span>
                        <b className="block">{c.name}</b>
                        <span className="text-xs text-[#94a3b8]">{c.email}</span>
                      </span>
                      {c.wa && (
                        <Tag tone="good">
                          <span title="WhatsApp verified">WA</span>
                        </Tag>
                      )}
                    </span>
                  </td>
                  <td>
                    <b className="block">{c.job}</b>
                    <span className="text-xs text-[#94a3b8]">{c.dept}</span>
                  </td>
                  <td>
                    <Tag tone={STAGE_TONE[c.stage]}>{hireStageLabel[c.stage]}</Tag>
                  </td>
                  <td>
                    <span className="pos-source">{c.source}</span>
                  </td>
                  <td>{c.score == null ? <span className="text-[#475569]">No score</span> : `${c.score}%`}</td>
                  <td>
                    {c.rating === 0 ? (
                      <span className="mr-1 text-xs text-[#475569]">Not rated</span>
                    ) : (
                      <span className="mr-1 text-xs">{c.rating}/5</span>
                    )}
                    <Stars value={c.rating} onRate={(v) => rate(c.id, v)} label={`Rate ${c.name}`} />
                  </td>
                  <td className="whitespace-nowrap text-[#94a3b8]">{c.applied}</td>
                  <td className="whitespace-nowrap">
                    <button
                      className="pos-btn pos-btn-quiet pos-btn-sm mr-1"
                      onClick={() => {
                        setDrawerId(c.id);
                        setDrawerTab("assessment");
                      }}
                    >
                      View details
                    </button>
                    <button
                      className="pos-btn pos-btn-quiet pos-btn-sm"
                      onClick={() => setDeleting(c)}
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#475569]">
                    No candidates match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {paged.map((c) => (
            <div key={c.id} className="pos-card">
              <div className="pos-card-body">
                <span className="flex items-center gap-2">
                  <Avatar name={c.name} size={30} />
                  <PersonName nick={c.name} full={c.email} />
                </span>
                <p className="mt-2 text-[13px] text-[#94a3b8]">{c.job}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Tag tone={STAGE_TONE[c.stage]}>{hireStageLabel[c.stage]}</Tag>
                  <Stars value={c.rating} onRate={(v) => rate(c.id, v)} label={`Rate ${c.name}`} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="pos-source">{c.source}</span>
                  <span className="text-xs text-[#94a3b8]">{c.applied}</span>
                  <span className="flex-1" />
                  <button
                    className="pos-btn pos-btn-quiet pos-btn-sm"
                    onClick={() => {
                      setDrawerId(c.id);
                      setDrawerTab("assessment");
                    }}
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          ))}
          {paged.length === 0 && (
            <p className="pos-card pos-card-body text-[#475569]">No candidates match.</p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-[#94a3b8]">
        <span>
          Showing {filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1}–
          {Math.min(filtered.length, safePage * PAGE_SIZE + PAGE_SIZE)} of {filtered.length}
        </span>
        <span className="flex-1" />
        <button
          className="pos-btn pos-btn-quiet pos-btn-sm"
          disabled={safePage === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>
          Page {safePage + 1} of {pages}
        </span>
        <button
          className="pos-btn pos-btn-quiet pos-btn-sm"
          disabled={safePage >= pages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {drawer && (
        <div className="pos-drawer-veil" onClick={() => setDrawerId(null)}>
          <div
            className="pos-drawer"
            role="dialog"
            aria-label={`Candidate ${drawer.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-3">
                <Avatar name={drawer.name} size={40} />
                <span>
                  <b className="block text-[16px]">{drawer.name}</b>
                  <span className="text-xs text-[#94a3b8]">
                    {drawer.job} · {drawer.dept} · {drawer.email} · {drawer.phone}
                  </span>
                </span>
              </span>
              <button className="pos-btn pos-btn-quiet pos-btn-sm" aria-label="Close" onClick={() => setDrawerId(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label className="text-[13px] text-[#94a3b8]">
                <span className="pos-field-label">Stage</span>
                <select
                  className="pos-select"
                  value={drawer.stage}
                  onChange={(e) => move(drawer.id, e.target.value as HireStage)}
                  aria-label={`Move ${drawer.name} to stage`}
                >
                  {hireStages.map((s) => (
                    <option key={s} value={s}>
                      {hireStageLabel[s]}
                    </option>
                  ))}
                </select>
              </label>
              <span className="flex-1" />
              <button
                className="pos-btn pos-btn-danger pos-btn-sm"
                onClick={() => move(drawer.id, "rejected")}
                disabled={drawer.stage === "rejected"}
              >
                Reject
              </button>
              <button
                className="pos-btn pos-btn-quiet pos-btn-sm"
                onClick={() => {
                  setDeleting(drawer);
                }}
              >
                Delete candidate
              </button>
            </div>

            <div className="pos-stage-pills mt-3" aria-label="Pipeline">
              {hireStages.map((s, i) => (
                <span
                  key={s}
                  className={cn(
                    "pos-stage-pill",
                    i < stageIdx && "done",
                    i === stageIdx && "now"
                  )}
                >
                  {hireStageLabel[s]}
                </span>
              ))}
            </div>

            <div className="pos-tabs mt-4" role="tablist" aria-label="Candidate detail">
              {(["assessment", "cv", "whatsapp"] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={drawerTab === t}
                  className={cn("pos-tab", drawerTab === t && "pos-tab-on")}
                  onClick={() => setDrawerTab(t)}
                >
                  {t === "assessment" ? "Assessment" : t === "cv" ? "CV" : "WhatsApp"}
                </button>
              ))}
            </div>

            {drawerTab === "assessment" && (
              <div>
                <p className="text-sm">
                  Average score:{" "}
                  <b>{drawer.score == null ? "No score" : `${drawer.score}%`}</b>
                </p>
                <div className="mt-2">
                  <div className="h-2.5 overflow-hidden rounded bg-[#1e293b]">
                    <div
                      className="h-full rounded bg-indigo-500"
                      style={{ width: `${drawer.score ?? 0}%` }}
                    />
                  </div>
                </div>
                <p className="pos-lead mt-3">
                  Rating:{" "}
                  <Stars value={drawer.rating} onRate={(v) => rate(drawer.id, v)} label={`Rate ${drawer.name}`} />
                </p>
                {!drawer.video && (
                  <p className="pos-note pos-note-warn mt-3">No video yet.</p>
                )}
              </div>
            )}
            {drawerTab === "cv" && <p className="text-sm leading-relaxed text-[#cbd5e1]">{drawer.cv}</p>}
            {drawerTab === "whatsapp" && (
              <div>
                <div className="rounded-lg border border-[#1e293b] p-3 text-sm">
                  <p className="text-[#94a3b8]">
                    {drawer.name}: Halo, saya tertarik dengan lowongan {drawer.job}.
                  </p>
                  <p className="mt-2 text-right text-[#c7d2fe]">
                    Terima kasih! Berikut link aplikasi Anda… ✓✓ Read
                  </p>
                </div>
                <p className="pos-lead mt-2">reply window open · official messages only</p>
              </div>
            )}
          </div>
        </div>
      )}

      {deleting && (
        <div className="pos-drawer-veil" onClick={() => setDeleting(null)}>
          <div
            className="pos-drawer"
            role="alertdialog"
            aria-label="Delete candidate"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(440px, 100%)" }}
          >
            <h3 className="text-lg font-semibold">Delete candidate {deleting.name}?</h3>
            <p className="pos-lead mt-2">This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="pos-btn pos-btn-quiet" onClick={() => setDeleting(null)}>
                Cancel
              </button>
              <button
                className="pos-btn pos-btn-danger"
                onClick={() => {
                  setRows((prev) => prev.filter((c) => c.id !== deleting.id));
                  if (drawerId === deleting.id) setDrawerId(null);
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
