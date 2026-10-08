"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  hrBirthdays,
  hrByBrand,
  hrByDept,
  hrBySite,
  hrGlance,
  hrHighByPosition,
  hrProbation,
  hrReadiness,
  hrTotal,
  hrVacant,
} from "@/content/demos/peopleos";
import { Avatar, Bar, BRAND_COLOR, HBars, PersonName, PosHeader, PosSection, StackBar, Tag } from "./shell-demo";

type Tab = "overview" | "headcount" | "readiness";

function Card({
  label,
  figure,
  unit,
  delta,
  q,
  warn,
  span,
  children,
}: {
  label: string;
  figure?: React.ReactNode;
  unit?: string;
  delta?: React.ReactNode;
  q?: string;
  warn?: boolean;
  span?: string;
  children?: React.ReactNode;
}) {
  return (
    <article
      className={cn("pos-card", span ?? "col-span-12 md:col-span-6 lg:col-span-3")}
      style={warn ? { borderColor: "#b45309" } : undefined}
    >
      <div className="pos-card-body">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="pos-metric-label">{label}</span>
          {q && (
            <button type="button" title={q} aria-label="Definition not agreed yet" className="pos-q">
              ?
            </button>
          )}
        </div>
        {figure != null && (
          <div className="pos-metric-figure">
            {figure}
            {unit && <small>{unit}</small>}
          </div>
        )}
        {children}
        {delta && <p className="pos-metric-delta">{delta}</p>}
      </div>
    </article>
  );
}

function bdayTag(diff: number) {
  if (diff > 0) return <Tag tone="ink">In {diff} days</Tag>;
  if (diff === 0) return <Tag tone="good">Today</Tag>;
  if (diff === -1) return <Tag>Yesterday</Tag>;
  return <Tag>Passed</Tag>;
}

export function DashboardDemo() {
  const [range, setRange] = useState("30d");
  const [tab, setTab] = useState<Tab>("overview");

  const ready = useMemo(() => {
    const n = (s: string) => hrReadiness.filter((r) => r.status === s).length;
    return { ok: n("ok"), warn: n("warn"), block: n("block") };
  }, []);

  return (
    <div>
      <PosHeader
        eyebrow="Team composition and movement as of 08 Oct 2026"
        title="HR Overview"
        actions={
          <>
            <span className="pos-seg" role="group" aria-label="Date range">
              {(["7d", "30d", "90d", "ytd"] as const).map((r) => (
                <button key={r} className={cn(range === r && "on")} onClick={() => setRange(r)}>
                  {r === "ytd" ? "YTD" : r}
                </button>
              ))}
            </span>
            <span className="text-[12.5px] tabular-nums text-[#94a3b8]">
              08 Sep 2026 – 08 Oct 2026
            </span>
          </>
        }
      />

      <div className="pos-tabs" role="tablist" aria-label="HR overview sections">
        {(
          [
            { id: "overview", label: "Overview" },
            { id: "headcount", label: "Headcount", count: 4 },
            { id: "readiness", label: "Data readiness", count: hrReadiness.length },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={cn("pos-tab", tab === t.id && "pos-tab-on")}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {"count" in t && t.count != null && <span className="pos-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="pos-card">
            <div className="pos-card-body grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
              <div className="flex items-baseline gap-3">
                <span className="text-[44px] font-semibold leading-none tracking-[-1.5px] tabular-nums">
                  {hrTotal.all}
                </span>
                <div>
                  <div className="text-sm font-semibold">Employees</div>
                  <div className="text-[12.5px] text-[#94a3b8]">
                    {hrTotal.active} active · {hrTotal.leave} on leave · {hrTotal.inactive} inactive
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-1.5 pos-metric-label">By brand</div>
                <StackBar
                  parts={hrByBrand.map((b, i) => ({
                    label: (
                      <>
                        {b.name}{" "}
                        <small className="text-[11px]">
                          {Math.round((b.count / hrTotal.all) * 100)}%
                        </small>
                      </>
                    ),
                    value: b.count,
                    color: BRAND_COLOR[i % BRAND_COLOR.length],
                  }))}
                />
              </div>
            </div>
          </div>

          <PosSection meta="The four numbers HR leadership usually checks first.">
            This period at a glance
          </PosSection>
          <div className="grid grid-cols-12 gap-4">
            <Card
              label={`New hires · ${hrGlance.days} days`}
              figure={hrGlance.newHires}
              delta={
                <>
                  <b className="text-emerald-300">+{hrGlance.newHiresDelta}</b> vs previous{" "}
                  {hrGlance.days} days
                </>
              }
            />
            <Card
              label="Average tenure"
              figure={hrGlance.tenureAvg}
              unit="yrs"
              delta={`Median ${hrGlance.tenureMedian} yrs`}
            />
            <Card
              label="Average age"
              figure={hrGlance.ageAvg}
              unit="yrs"
              delta={`${hrGlance.ageFilled} of ${hrGlance.ageTotal} filled in`}
            />
            <Card
              label="Training completion"
              figure={hrGlance.trainingPct}
              unit="%"
              delta={`${hrGlance.trainingDone} of ${hrGlance.trainingTotal} assignments · ${hrGlance.trainingOverdue} overdue`}
            >
              <Bar value={hrGlance.trainingPct} tone={hrGlance.trainingPct >= 75 ? "good" : "warn"} />
            </Card>
          </div>

          <PosSection meta="Main distribution. Full detail in the Headcount tab.">
            Where people are
          </PosSection>
          <div className="grid grid-cols-12 gap-4">
            <Card label="Headcount by department" span="col-span-12 lg:col-span-6">
              <HBars items={hrByDept} />
            </Card>
            <Card
              label="Headcount by outlet (physical site)"
              span="col-span-12 lg:col-span-6"
              warn
              q='"Outlet" needs a definition first: here outlet means brand, while this chart counts physical workplaces.'
              delta="Physical workplace. Not to be confused with brand."
            >
              <HBars items={hrBySite} />
            </Card>
          </div>

          <PosSection meta="What usually turns into an HR action this week.">
            Needs attention
          </PosSection>
          <div className="grid grid-cols-12 gap-4">
            <Card
              label="Probation"
              figure={hrProbation.length}
              warn
              q="Derived from the join date, not an HR-managed status."
              delta="1 ending within 14 days"
            />
            <Card
              label="Vacant positions"
              figure={hrVacant.length}
              warn
              q="Positions with nobody assigned, not a budget quota."
              delta="In 3 departments"
            />
            <Card
              label="High performers"
              figure={13}
              unit={`/${hrTotal.all}`}
              warn
              q="Scheduling-priority marker (Star), not a formal performance review."
              delta="20.3% of the team"
            >
              <HBars items={hrHighByPosition} />
            </Card>
            <Card
              label="Upcoming birthdays"
              figure={hrBirthdays.filter((b) => b.diff >= 0).length}
              delta="Next: Ariani, 11 Oct"
            />
          </div>

          <PosSection meta="The Celebrations feature already computes and sends this list.">
            Birthdays this month — October 2026
          </PosSection>
          <div className="pos-card pos-card-flush">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Brand</th>
                  <th>Date</th>
                  <th className="pos-num">Age</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {hrBirthdays.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="flex items-center gap-2">
                        <Avatar name={b.name} size={28} />
                        <PersonName nick={b.name} full={b.full} />
                      </span>
                    </td>
                    <td>{b.department}</td>
                    <td>{b.brand}</td>
                    <td className="whitespace-nowrap tabular-nums">{b.day} Oct</td>
                    <td className="pos-num">{b.age}</td>
                    <td>{bdayTag(b.diff)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-2.5 text-[12px] text-[#64748b]">
              the Celebrations cron already sends this list via WhatsApp
            </p>
          </div>
        </>
      )}

      {tab === "headcount" && (
        <>
          <PosSection meta={`Four cuts of the same ${hrTotal.all} people.`}>Composition</PosSection>
          <div className="grid grid-cols-12 gap-4">
            <Card label="By brand" span="col-span-12 md:col-span-6 lg:col-span-4">
              <HBars
                items={hrByBrand.map((b, i) => ({
                  label: b.name,
                  value: b.count,
                  color: BRAND_COLOR[i % BRAND_COLOR.length],
                }))}
                format={(n) => `${n} · ${Math.round((n / hrTotal.all) * 100)}%`}
              />
            </Card>
            <Card label="By department" span="col-span-12 md:col-span-6 lg:col-span-4">
              <HBars items={hrByDept} />
            </Card>
            <Card
              label="By outlet (physical site)"
              span="col-span-12 md:col-span-6 lg:col-span-4"
              warn
              q='"Outlet" needs a definition first: here outlet means brand, while this chart counts physical workplaces.'
            >
              <HBars items={hrBySite} />
            </Card>
            <div className="pos-card col-span-12 lg:col-span-8">
              <div className="pos-card-head">
                <b>Department × brand</b>
              </div>
              <table className="pos-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th className="pos-num">This Is Bali</th>
                    <th className="pos-num">Acai Queen</th>
                    <th className="pos-num">HQ</th>
                    <th className="pos-num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { d: "Kitchen", c: [7, 6, 1] },
                    { d: "Service", c: [9, 7, 0] },
                    { d: "Bar", c: [4, 5, 0] },
                    { d: "Warehouse", c: [3, 1, 2] },
                    { d: "Finance", c: [1, 1, 3] },
                    { d: "Other", c: [4, 4, 6] },
                  ].map((r) => (
                    <tr key={r.d}>
                      <td>
                        <b>{r.d}</b>
                      </td>
                      {r.c.map((n, i) => (
                        <td key={i} className="pos-num">
                          {n || <span className="text-[#475569]">—</span>}
                        </td>
                      ))}
                      <td className="pos-num">
                        <b>{r.c.reduce((a, b) => a + b, 0)}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "readiness" && (
        <>
          <PosSection meta="The Filled column is counted from the database on every load, not assessed once and written down.">
            Every metric, measured against the data that actually exists
          </PosSection>
          <div className="pos-card">
            <div className="pos-card-body">
              <div className="flex h-2.5 overflow-hidden rounded-[3px] bg-[#1e293b]">
                <span style={{ width: `${(ready.ok / hrReadiness.length) * 100}%` }} className="bg-emerald-600" />
                <span style={{ width: `${(ready.warn / hrReadiness.length) * 100}%` }} className="bg-amber-500" />
                <span style={{ width: `${(ready.block / hrReadiness.length) * 100}%` }} className="bg-slate-500" />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-emerald-600" />
                  <b>{ready.ok} ready</b> — column filled for at least 90%
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-amber-500" />
                  <b>{ready.warn} partly filled</b> — column exists, some employees left blank
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-slate-500" />
                  <b>{ready.block} unavailable</b> — column entirely empty, or not permitted
                </span>
              </div>
            </div>
          </div>
          <div className="pos-card pos-card-flush mt-4">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Status</th>
                  <th className="pos-num">Filled</th>
                  <th>How to complete</th>
                </tr>
              </thead>
              <tbody>
                {hrReadiness.map((r) => (
                  <tr key={r.key}>
                    <td>
                      <b>{r.metric}</b>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                        <i
                          className={cn(
                            "h-2 w-2 rounded-full",
                            r.status === "ok" && "bg-emerald-600",
                            r.status === "warn" && "bg-amber-500",
                            r.status === "block" && "bg-slate-500"
                          )}
                        />
                        {r.status === "ok" ? "Ready" : r.status === "warn" ? "Partly filled" : r.status === "block" && r.filled === "Needs permission" ? "Needs permission" : "Unavailable"}
                      </span>
                    </td>
                    <td className="pos-num tabular-nums">{r.filled}</td>
                    <td className="text-[12.5px] text-[#94a3b8]">{r.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pos-lead mt-4">
            The period filter affects new hires, turnover and promotions and their comparisons; other
            metrics are a snapshot of today. Unavailable metrics deliberately carry no number.
          </p>
        </>
      )}
    </div>
  );
}
