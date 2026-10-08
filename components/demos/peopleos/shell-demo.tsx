"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./peopleos.css";

export type PosModule = "dashboard" | "approvals" | "schedule" | "candidates";

const NAV: { group: string; items: { id: PosModule | null; label: string; note?: string }[] }[] = [
  {
    group: "Overview",
    items: [
      { id: "dashboard", label: "HR Overview" },
      { id: "approvals", label: "Approvals" },
    ],
  },
  {
    group: "Workforce",
    items: [
      { id: "schedule", label: "Schedule & Attendance" },
      { id: null, label: "Time Clock Lobby", note: "Not in demo" },
      { id: null, label: "Tasks", note: "Not in demo" },
    ],
  },
  {
    group: "Recruitment",
    items: [
      { id: "candidates", label: "Candidates" },
      { id: null, label: "Jobs", note: "Not in demo" },
      { id: null, label: "Analytics", note: "Not in demo" },
    ],
  },
];

export function PosShell({
  active,
  onNav,
  children,
}: {
  active: PosModule;
  onNav: (m: PosModule) => void;
  children: ReactNode;
}) {
  return (
    <div className="pos">
      <div className="pos-shell">
        <nav className="pos-side" aria-label="PeopleOS modules">
          <div className="pos-side-brand">
            <span className="mark">P</span> PeopleOS
          </div>
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="pos-side-group">{g.group}</p>
              {g.items.map((it) =>
                it.id ? (
                  <button
                    key={it.label}
                    className={cn("pos-side-item", active === it.id && "on")}
                    aria-current={active === it.id ? "page" : undefined}
                    onClick={() => onNav(it.id as PosModule)}
                  >
                    {it.label}
                  </button>
                ) : (
                  <span key={it.label} className="pos-side-item off" title={it.note}>
                    {it.label}
                  </span>
                )
              )}
            </div>
          ))}
          <p className="pos-side-group">Account</p>
          <span className="pos-side-item off" title="Not in demo">
            R. Rizki · Admin
          </span>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function PosHeader({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow?: ReactNode;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
      <div className="min-w-0">
        {eyebrow && <p className="pos-eyebrow">{eyebrow}</p>}
        <h2 className="pos-title">
          {title}
          <span className="pos-dot">.</span>
        </h2>
        {lead && <p className="pos-lead">{lead}</p>}
      </div>
      {actions && <div className="flex flex-none flex-wrap items-center gap-2 pb-0.5">{actions}</div>}
    </header>
  );
}

export function PosSection({ meta, children }: { meta?: string; children: ReactNode }) {
  return (
    <h3 className="pos-sec-title">
      {children}
      {meta && <small>{meta}</small>}
    </h3>
  );
}

export function Tag({ tone, children }: { tone?: string; children: ReactNode }) {
  return <span className={cn("pos-tag", `pos-tone-${tone ?? "neutral"}`)}>{children}</span>;
}

export function initialsOf(name: string) {
  return name
    .split(" ")
    .filter((w) => !/^(Ni|I)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  return (
    <span className="pos-avatar" style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}>
      {initialsOf(name)}
    </span>
  );
}

export function PersonName({ nick, full }: { nick: string; full?: string }) {
  return (
    <span className="pos-person">
      <span className="font-semibold">{nick}</span>
      {full && <span>{full}</span>}
    </span>
  );
}

/* Port verbatim dari packages/frontend/src/components/charts/index.tsx
   (HBars, StackBar, Bar). Warna default CHART_COLORS[0] = rgb(var(--primary))
   yang di dark mode = #e6e0d5 (global.css .dark). */
export const CHART_COLORS = [
  "#e6e0d5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#999999",
];
export const BRAND_COLOR = ["#f59e0b", "#059669", "#4f46e5", "#999999"];

export function HBars({
  items,
  max,
  format = (n: number) => String(n),
}: {
  items: { label: React.ReactNode; value: number; color?: string; key?: string }[];
  max?: number;
  format?: (n: number) => string;
}) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => (
        <div key={it.key ?? i} className="flex items-center gap-3">
          <span className="w-[38%] min-w-0 truncate text-[13px] text-slate-300">{it.label}</span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-[3px] bg-slate-800">
            <i
              className="block h-full rounded-[3px]"
              style={{
                width: `${Math.round((it.value / top) * 100)}%`,
                backgroundColor: it.color || CHART_COLORS[0],
              }}
            />
          </span>
          <span className="w-12 text-right text-[12.5px] tabular-nums text-slate-400">
            {format(it.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StackBar({ parts }: { parts: { label: React.ReactNode; value: number; color?: string }[] }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  return (
    <div>
      <div className="flex w-full overflow-hidden rounded-[3px] bg-slate-800" style={{ height: 10 }}>
        {parts.map((p, i) => (
          <i
            key={i}
            style={{ width: `${(p.value / total) * 100}%`, backgroundColor: p.color || CHART_COLORS[i % CHART_COLORS.length] }}
            title={`${String(p.label)}: ${p.value}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-slate-400">
        {parts.map((p, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-sm" style={{ backgroundColor: p.color || CHART_COLORS[i % CHART_COLORS.length] }} />
            {p.label} <b className="tabular-nums text-slate-100">{p.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Bar({ value, tone }: { value: number; tone: "good" | "warn" }) {
  return (
    <div className="h-2.5 overflow-hidden rounded bg-slate-800">
      <div
        className={cn("h-full rounded", tone === "good" ? "bg-emerald-500" : "bg-amber-500")}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
