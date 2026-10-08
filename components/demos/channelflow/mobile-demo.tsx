"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  EyeOff,
  List,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STATUS_LABEL,
  TONES,
  cardTone,
  mobileBookings,
  mobileDays,
  type MobileBooking,
  type MobileStatus,
} from "@/content/demos/mobile";
import "./mobile.css";

type ViewMode = "list" | "day" | "month";

const TABS: { value: ViewMode; short: string; icon: typeof List }[] = [
  { value: "list", short: "List", icon: List },
  { value: "day", short: "Day", icon: Clock3 },
  { value: "month", short: "Month", icon: CalendarDays },
];

const ACTION_TONE: Record<string, string> = {
  confirmed: "#3A7C34",
  completed: "#3E2008",
  cancelled: "#A93B2A",
};

const STATUS_VERB: Record<string, string> = {
  confirmed: "Confirm",
  completed: "Guest arrived",
  cancelled: "Cancel",
};

function nextStatuses(s: MobileStatus): MobileStatus[] {
  if (s === "not_confirmed") return ["confirmed", "completed", "cancelled"];
  if (s === "confirmed") return ["completed", "cancelled"];
  if (s === "no_show") return ["completed"];
  return [];
}

const canArrive = (s: MobileStatus) => s !== "completed" && s !== "cancelled" && s !== "no_show";

function hourOf(t: string) {
  return Number(t.split(":")[0]);
}

export function MobileDemo() {
  const [view, setView] = useState<ViewMode>("day");
  const [bookings, setBookings] = useState<MobileBooking[]>(mobileBookings);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [dayIdx, setDayIdx] = useState(0);
  const [monthSel, setMonthSel] = useState(mobileDays[0].day);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [formInit, setFormInit] = useState<Partial<MobileBooking> | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const patch = (id: string, fn: (b: MobileBooking) => MobileBooking) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? fn(b) : b)));

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2600);
  };

  const arrive = (id: string) => {
    patch(id, (b) => ({ ...b, status: "completed" }));
    flash("Marked arrived — the card leaves the List and Day boards at once.");
  };

  const needle = q.trim().toLowerCase();
  const matchQ = (b: MobileBooking) =>
    !needle ||
    b.customerName.toLowerCase().includes(needle) ||
    (b.customerPhone ?? "").toLowerCase().includes(needle) ||
    b.referenceCode.toLowerCase().includes(needle);

  const operational = (b: MobileBooking) =>
    !hidden.has(b.id) && b.status !== "completed" && b.status !== "cancelled" && b.status !== "no_show";

  const detail = bookings.find((b) => b.id === detailId) ?? null;
  const thread = bookings.find((b) => b.id === threadId) ?? null;

  return (
    <div className="demo-mobile overflow-hidden rounded-2xl border border-[#E8D9C3]">
      {/* Header: tabs + account share one row — the app has no other header */}
      <div className="flex items-center border-b border-[#E8D9C3] bg-[#FCF4E9]">
        <div className="flex flex-1" role="tablist" aria-label="Board views">
          {TABS.map((t) => {
            const active = view === t.value;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={active}
                aria-label={t.short === "List" ? "List View" : t.short === "Day" ? "Day by Hour" : "Month Summary"}
                onClick={() => setView(t.value)}
                className="flex min-h-11 flex-1 flex-col items-center pt-3"
              >
                <span className="flex items-center gap-2 pb-3">
                  <t.icon size={18} color={active ? "#3E2008" : "#96806C"} />
                  <span className={cn("text-[13px] font-bold", active ? "text-[#3E2008]" : "text-[#96806C]")}>
                    {t.short}
                  </span>
                </span>
                <span className={cn("h-0.5 w-full rounded", active ? "bg-[#3E2008]" : "bg-transparent")} />
              </button>
            );
          })}
        </div>
        <span
          title="Rizky · staff"
          className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3E2008] text-sm font-bold text-white"
        >
          R
        </span>
      </div>

      {notice && (
        <p className="border-b border-[#E8D9C3] bg-[#FFFBF3] px-4 py-2 text-center text-[13px] font-medium text-[#6A5240]">
          {notice}
        </p>
      )}

      <div className="min-h-[560px] p-3 sm:p-4">
        {view === "list" && (
          <ListPane
            bookings={bookings.filter((b) => operational(b) && matchQ(b))}
            q={q}
            setQ={setQ}
            total={bookings.length}
            onOpen={setDetailId}
            onEdit={(b) => setFormInit({ ...b })}
            onArrive={arrive}
            onRemoveAsk={setRemoveId}
            removeId={removeId}
            onRemoveDo={(id) => { setHidden((s) => new Set(s).add(id)); setRemoveId(null); }}
            onRemoveCancel={() => setRemoveId(null)}
            onThread={setThreadId}
            onNew={() => setFormInit({})}
          />
        )}
        {view === "day" && (
          <DayPane
            bookings={bookings.filter(operational)}
            dayIdx={dayIdx}
            setDayIdx={setDayIdx}
            onOpen={setDetailId}
            onThread={setThreadId}
          />
        )}
        {view === "month" && (
          <MonthPane
            bookings={bookings.filter((b) => !hidden.has(b.id) && matchQ(b))}
            monthSel={monthSel}
            setMonthSel={setMonthSel}
            onOpen={setDetailId}
            onEdit={(b) => setFormInit({ ...b })}
            onArrive={arrive}
            onRemoveAsk={setRemoveId}
            removeId={removeId}
            onRemoveDo={(id) => { setHidden((s) => new Set(s).add(id)); setRemoveId(null); }}
            onRemoveCancel={() => setRemoveId(null)}
            onThread={setThreadId}
          />
        )}
      </div>

      {detail && (
        <DetailSheet
          booking={detail}
          onClose={() => setDetailId(null)}
          onChange={(s, reason) => {
            patch(detail.id, (b) => ({ ...b, status: s }));
            setDetailId(null);
            if (s === "completed") flash("Marked arrived — the card leaves the List and Day boards at once.");
            if (reason) flash("Cancellation reason saved — the guest reads it.");
          }}
          onEdit={() => { setFormInit({ ...detail }); setDetailId(null); }}
          onHide={(id) => { setHidden((s) => new Set(s).add(id)); setDetailId(null); }}
          onThread={(id) => { setDetailId(null); setThreadId(id); }}
        />
      )}

      {formInit !== null && (
        <BookingFormSheet
          initial={formInit}
          onClose={() => setFormInit(null)}
          onSave={(b) => {
            if (formInit.id) patch(formInit.id, () => b as MobileBooking);
            else setBookings((prev) => [...prev, { ...(b as MobileBooking), id: `TIB-${Math.floor(2000 + Math.random() * 8000)}`, referenceCode: `TIB-${Math.floor(2000 + Math.random() * 8000)}`, source: "Staff" }]);
            setFormInit(null);
            flash(formInit.id ? "Booking updated." : "Booking created.");
          }}
        />
      )}

      {thread && <ThreadSheet booking={thread} onClose={() => setThreadId(null)} />}
    </div>
  );
}

/* ------------------------------- shared bits ------------------------------ */

function StatusBadge({ status, tone }: { status: MobileStatus; tone: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 self-start rounded-full border bg-[#FFFBF3] px-2 py-[3px]"
      style={{ borderColor: tone + "66" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      <span className="text-[11px] font-bold uppercase tracking-[0.4px]" style={{ color: tone }}>
        {STATUS_LABEL[status]}
      </span>
    </span>
  );
}

type CardActions = {
  onOpen: (id: string) => void;
  onEdit: (b: MobileBooking) => void;
  onArrive: (id: string) => void;
  onRemoveAsk: (id: string) => void;
  removeId: string | null;
  onRemoveDo: (id: string) => void;
  onRemoveCancel: () => void;
  onThread: (id: string) => void;
};

type CardProps = CardActions & {
  booking: MobileBooking;
};

function BookingCard({ booking: b, onOpen, onEdit, onArrive, onRemoveAsk, removeId, onRemoveDo, onRemoveCancel, onThread }: CardProps) {
  const tone = TONES[cardTone(b)];
  return (
    <div className="mb-2 flex min-h-[228px] items-stretch overflow-hidden rounded-xl border" style={{ borderColor: tone.color + "55" }}>
      <button
        onClick={() => onOpen(b.id)}
        className="flex w-[92px] shrink-0 items-start justify-center pt-2.5 text-[23px] font-extrabold tabular-nums text-white"
        style={{ background: tone.color }}
        aria-label={`Open ${b.customerName}'s booking`}
      >
        {b.reservationTime}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-2.5" style={{ background: tone.body }}>
        <div className="flex items-start gap-1.5">
          <div className="min-w-0 flex-1">
            <p className="min-h-10 text-[15px] font-bold leading-5 text-[#2E1B0D]">{b.customerName}</p>
            {b.customerPhone && (
              <p className="truncate text-[12.5px] font-semibold text-[#764C1D]">{b.customerPhone}</p>
            )}
          </div>
          <button
            onClick={() => onThread(b.id)}
            aria-label={`Open chat with ${b.customerName}`}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border bg-[#FFFBF3]"
            style={{ borderColor: "#3E200833" }}
          >
            <MessageCircle size={17} color="#8A5A22" />
          </button>
          <StatusBadge status={b.status} tone={tone.color} />
        </div>
        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
          <span className="inline-flex items-center gap-1 text-[12.5px] text-[#69513F]">
            <Users size={13} /> {b.partySize} {b.partySize === 1 ? "guest" : "guests"}
          </span>
          <span className="inline-flex items-center gap-1 text-[12.5px] text-[#69513F]">
            <Tag size={13} /> {b.source}
          </span>
        </div>
        <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg px-2 py-1.5", b.specialRequests && "border border-[#E8D9C3] bg-[#FFFBF3]")}>
          <span className="text-[9.5px] font-bold tracking-[0.5px] text-[#816C59]">SPECIAL REQUEST</span>
          {b.specialRequests && <span className="min-w-[120px] flex-1 text-[12.5px] text-[#2E1B0D]">{b.specialRequests}</span>}
        </div>
        {removeId === b.id ? (
          <div className="mt-auto rounded-lg bg-[#FFFBF3] p-2 text-[12.5px]">
            <p className="font-semibold text-[#2E1B0D]">Remove booking</p>
            <p className="text-[#69513F]">Hide {b.customerName}&apos;s booking from this view? It stays active on the server.</p>
            <div className="mt-1.5 flex gap-1.5">
              <button onClick={onRemoveCancel} className="flex-1 rounded-lg border border-[#E8D9C3] py-1.5 text-[12.5px] font-bold">Cancel</button>
              <button onClick={() => onRemoveDo(b.id)} className="flex-1 rounded-lg bg-[#A93B2A] py-1.5 text-[12.5px] font-bold text-white">Remove</button>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex flex-wrap gap-1.5">
            <button onClick={() => onEdit(b)} className="inline-flex flex-[1_1_47%] items-center justify-center gap-1 rounded-lg border bg-[#FFFBF3] py-[7px] text-[12.5px] font-bold text-[#8A5A22]" style={{ borderColor: "#3E200833" }}>
              <Pencil size={13} /> Modify
            </button>
            {canArrive(b.status) && (
              <button onClick={() => onArrive(b.id)} className="inline-flex flex-[1_1_47%] items-center justify-center gap-1 rounded-lg border border-[#3E2008] bg-[#3E2008] py-[7px] text-[12.5px] font-bold text-white">
                <Check size={15} /> Guest arrived
              </button>
            )}
            <button onClick={() => onRemoveAsk(b.id)} className="inline-flex flex-[1_1_47%] flex-grow items-center justify-center gap-1 rounded-lg border border-[#A93B2A] bg-[#A93B2A] py-[7px] text-[12.5px] font-bold text-white">
              <EyeOff size={13} /> Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- List ---------------------------------- */

function ListPane(props: CardActions & {
  bookings: MobileBooking[];
  q: string;
  setQ: (v: string) => void;
  total: number;
  onNew: () => void;
}) {
  const { bookings, q, setQ, onNew } = props;
  const groups = mobileDays
    .map((d) => ({ ...d, items: bookings.filter((b) => b.day === d.day) }))
    .filter((g) => g.items.length > 0);
  const emptyMsg = props.total === 0 ? "No upcoming bookings." : "No bookings match your search.";
  return (
    <div>
      <div className="flex items-center gap-2 pb-3">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#E8D9C3] bg-[#FFFBF3] px-3 py-2">
          <Search size={16} color="#96806C" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, code"
            aria-label="Search bookings"
            className="w-full bg-transparent text-[15px] text-[#2E1B0D] placeholder:text-[#96806C] focus:outline-none"
          />
        </label>
        <button
          onClick={onNew}
          aria-label="New booking"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8D9C3] bg-[#FFFBF3]"
        >
          <Plus size={22} color="#3E2008" />
        </button>
      </div>
      {groups.length === 0 && (
        <p className="py-10 text-center text-[14px] text-[#6A5240]">{emptyMsg}</p>
      )}
      {groups.map((g) => (
        <div key={g.day} className="mb-2">
          <p className="px-1 pb-1.5 text-[13px] font-bold text-[#2E1B0D]">
            {g.label} · {g.items.length} {g.items.length === 1 ? "booking" : "bookings"}
          </p>
          {g.items.map((b) => (
            <BookingCard key={b.id} booking={b} {...props} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- Day ----------------------------------- */

function DayPane({ bookings, dayIdx, setDayIdx, onOpen, onThread }: {
  bookings: MobileBooking[];
  dayIdx: number;
  setDayIdx: (i: number) => void;
  onOpen: (id: string) => void;
  onThread: (id: string) => void;
}) {
  const day = mobileDays[dayIdx];
  const items = bookings.filter((b) => b.day === day.day).sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));
  const hours = useMemo(() => {
    const map = new Map<number, MobileBooking[]>();
    items.forEach((b) => {
      const h = hourOf(b.reservationTime);
      map.set(h, [...(map.get(h) ?? []), b]);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [bookings, dayIdx]);
  return (
    <div>
      <div className="flex items-center pb-3">
        <button onClick={() => setDayIdx(Math.max(0, dayIdx - 1))} aria-label="Previous day" className="p-2">
          <ChevronLeft size={20} color="#2E1B0D" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-[15px] font-bold">{day.label}</p>
          {dayIdx === 0 ? (
            <p className="text-[12px] font-semibold text-[#8A5A22]">Today · {items.length} bookings</p>
          ) : (
            <button onClick={() => setDayIdx(0)} className="text-[12px] font-semibold text-[#8A5A22] underline">
              Jump to today
            </button>
          )}
        </div>
        <button onClick={() => setDayIdx(Math.min(mobileDays.length - 1, dayIdx + 1))} aria-label="Next day" className="p-2">
          <ChevronRight size={20} color="#2E1B0D" />
        </button>
      </div>
      {items.length === 0 && <p className="py-10 text-center text-[14px] text-[#6A5240]">No bookings on this day.</p>}
      {hours.map(([h, list], ri) => (
        <div key={h} className={cn("py-2", ri > 0 && "border-t border-[#E8D9C3]")}>
          <p className="cf-mono pb-1.5 text-[12px] font-bold tabular-nums text-[#6A5240]">
            {String(h).padStart(2, "0")}:00
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {list.map((b) => {
              const tone = TONES[cardTone(b)];
              const group = b.partySize >= 6;
              return (
                <button
                  key={b.id}
                  onClick={() => onOpen(b.id)}
                  aria-label={`${b.customerName}, ${STATUS_LABEL[b.status]}, ${b.partySize} guests, ${b.reservationTime}`}
                  className="rounded-xl p-2.5 text-left text-white"
                  style={{ background: tone.color }}
                >
                  <span className="flex items-start justify-between gap-1">
                    <span className="text-[13.5px] font-bold leading-snug">{b.customerName}</span>
                    {b.specialRequests && <Star size={13} className="mt-0.5 shrink-0" fill="currentColor" />}
                  </span>
                  <span className="cf-mono mt-0.5 block text-[12px] tabular-nums">{b.reservationTime} · {b.partySize} guests</span>
                  <span className="mt-0.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide">{STATUS_LABEL[b.status]}</span>
                    {group && <Users size={13} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="pt-1 text-[12px] text-[#96806C]">Tap a tile to open the booking. Chat opens from a card via the message button.</p>
    </div>
  );
}

/* --------------------------------- Month ---------------------------------- */

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function MonthPane(props: CardActions & {
  bookings: MobileBooking[];
  monthSel: string;
  setMonthSel: (d: string) => void;
}) {
  const { bookings, monthSel, setMonthSel } = props;
  // October 2026: Oct 1 = Thursday. Days 10/11/12 -> Sat/Sun/Mon.
  const cells: (null | { n: number; day: string })[] = [
    null, null, null, null,
    ...Array.from({ length: 31 }, (_, i) => {
      const n = i + 1;
      const key = n === 10 ? "Sat 10" : n === 11 ? "Sun 11" : n === 12 ? "Mon 12" : "";
      return { n, day: key };
    }),
  ];
  const guestsOn = (day: string) => bookings.filter((b) => b.day === day).reduce((s, b) => s + b.partySize, 0);
  const sel = bookings.filter((b) => b.day === monthSel);
  const selLabel = mobileDays.find((d) => d.day === monthSel)?.label ?? monthSel;
  return (
    <div>
      <p className="text-[17px] font-bold">October 2026</p>
      <p className="text-[12.5px] text-[#6A5240]">{bookings.length} bookings this month</p>
      <p className="pt-1 text-[12px] text-[#96806C]">Each day shows the total guests booked.</p>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <p key={w} className="pb-1 text-center text-[11px] font-bold text-[#96806C]">{w}</p>
        ))}
        {cells.map((c, i) => {
          if (!c) return <span key={`b${i}`} />;
          const g = c.day ? guestsOn(c.day) : 0;
          const isToday = c.day === "Sat 10";
          const selected = c.day !== "" && c.day === monthSel;
          return (
            <button
              key={c.n}
              disabled={!c.day}
              onClick={() => c.day && setMonthSel(c.day)}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center rounded-lg border px-0.5 py-1",
                selected ? "border-[#3E2008] bg-[#3E2008]" : "border-[#E8D9C3] bg-[#FFFBF3]"
              )}
            >
              <span className={cn("text-[12px] font-bold", selected ? "text-white" : isToday ? "text-[#8A5A22]" : "text-[#2E1B0D]")}>
                {c.n}
              </span>
              {g > 0 && (
                <span className={cn("cf-mono mt-0.5 rounded-full px-1.5 text-[11px] font-extrabold tabular-nums", selected ? "bg-white/25 text-white" : "bg-[#3E2008] text-white")}>
                  {g}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[14px] font-bold">{selLabel}</p>
      {sel.length === 0 ? (
        <p className="py-6 text-center text-[14px] text-[#6A5240]">No bookings on this day.</p>
      ) : (
        <div className="mt-1.5">
          {sel.map((b) => (
            <BookingCard key={b.id} booking={b} {...props} />
          ))}
        </div>
      )}
      <p className="pt-1 text-[12px] text-[#96806C]">Tap any day to see the bookings on it.</p>
    </div>
  );
}

/* ------------------------------ Detail sheet ------------------------------ */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-[#E8D9C3] py-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#96806C]">{label}</p>
      <p className="mt-0.5 text-[15px] text-[#2E1B0D]">{value}</p>
    </div>
  );
}

function DetailSheet({ booking: b, onClose, onChange, onEdit, onHide, onThread }: {
  booking: MobileBooking;
  onClose: () => void;
  onChange: (s: MobileStatus, reason?: string) => void;
  onEdit: () => void;
  onHide: (id: string) => void;
  onThread: (id: string) => void;
}) {
  const [cancelPrompt, setCancelPrompt] = useState(false);
  const [reason, setReason] = useState("");
  const [removeAsk, setRemoveAsk] = useState(false);
  const tone = TONES[cardTone(b)];
  const actions = nextStatuses(b.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`${b.customerName}'s booking`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="demo-mobile relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[#F6EBDA] p-4 pb-6 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[19px] font-bold leading-snug">{b.customerName}</p>
          <button onClick={onClose} aria-label="Close details" className="rounded-lg p-1.5 hover:bg-[#E8D9C3]">
            <X size={18} color="#2E1B0D" />
          </button>
        </div>
        <div className="mt-1"><StatusBadge status={b.status} tone={tone.color} /></div>
        <p className="mt-1 text-[14px] font-semibold text-[#6A5240]">{b.dateLabel} · {b.reservationTime}</p>

        <div className="mt-2">
          <Field label="Party size" value={`${b.partySize} ${b.partySize === 1 ? "guest" : "guests"}`} />
          {b.customerPhone && <Field label="Phone" value={b.customerPhone} />}
          {b.customerEmail && <Field label="Email" value={b.customerEmail} />}
          <button onClick={() => onThread(b.id)} className="flex w-full items-center gap-3 border-t border-[#E8D9C3] py-2 text-left">
            <MessageCircle size={16} color="#6A5240" />
            <span className="flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-[0.5px] text-[#96806C]">Recent chats</span>
              <span className="mt-0.5 block text-[15px] text-[#2E1B0D]">Open the conversation</span>
            </span>
            <ChevronRight size={18} color="#96806C" />
          </button>
          <Field label="Reference" value={b.referenceCode} />
          {b.occasion && <Field label="Occasion" value={b.occasion} />}
          {b.dietary && <Field label="Dietary" value={b.dietary} />}
          <Field label="Source" value={b.source} />
          {b.specialRequests && <Field label="Special requests" value={b.specialRequests} />}
        </div>

        <div className="mt-2 flex gap-1.5">
          <button onClick={onEdit} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border bg-[#FFFBF3] py-2 text-[12.5px] font-bold text-[#8A5A22]" style={{ borderColor: "#3E200833" }}>
            <Pencil size={13} /> Modify
          </button>
          <button
            onClick={() => (removeAsk ? onHide(b.id) : setRemoveAsk(true))}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#A93B2A] bg-[#A93B2A] py-2 text-[12.5px] font-bold text-white"
          >
            <EyeOff size={13} /> {removeAsk ? "Confirm remove" : "Remove"}
          </button>
        </div>
        {removeAsk && (
          <p className="mt-1.5 text-[12.5px] text-[#69513F]">
            Hide {b.customerName}&apos;s booking from this view? It stays active on the server.
            <button onClick={() => setRemoveAsk(false)} className="ml-2 font-bold text-[#8A5A22] underline">Keep it</button>
          </p>
        )}

        {actions.length > 0 && !cancelPrompt && (
          <div className="mt-2 flex gap-1.5">
            {actions.map((t) => (
              <button
                key={t}
                onClick={() => (t === "cancelled" ? setCancelPrompt(true) : onChange(t))}
                className="flex-1 rounded-lg border py-2 text-[13px] font-bold text-white"
                style={{ borderColor: ACTION_TONE[t], background: ACTION_TONE[t] }}
              >
                {STATUS_VERB[t]}
              </button>
            ))}
          </div>
        )}

        {cancelPrompt && (
          <div className="mt-2 rounded-xl border border-[#E8D9C3] bg-[#FFFBF3] p-3">
            <p className="text-[12.5px] font-bold">Reason — the guest reads this (optional)</p>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. a pipe burst in the kitchen"
              className="mt-1.5 w-full rounded-lg border border-[#E8D9C3] bg-white px-3 py-2 text-[14px] placeholder:text-[#96806C] focus:outline-none"
            />
            <div className="mt-2 flex gap-1.5">
              <button onClick={() => { setCancelPrompt(false); setReason(""); }} className="flex-1 rounded-lg border border-[#E8D9C3] py-2 text-[13px] font-bold">
                Back
              </button>
              <button onClick={() => onChange("cancelled", reason)} className="flex-1 rounded-lg border border-[#A93B2A] py-2 text-[13px] font-bold text-[#A93B2A]">
                Confirm cancellation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Form sheet ------------------------------- */

function BookingFormSheet({ initial, onClose, onSave }: {
  initial: Partial<MobileBooking>;
  onClose: () => void;
  onSave: (b: Partial<MobileBooking>) => void;
}) {
  const [name, setName] = useState(initial.customerName ?? "");
  const [phone, setPhone] = useState(initial.customerPhone ?? "");
  const [party, setParty] = useState(initial.partySize ?? 2);
  const [day, setDay] = useState(initial.day ?? mobileDays[0].day);
  const [time, setTime] = useState(initial.reservationTime ?? "19:00");
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    if (!name.trim()) { setErr("Please enter the guest name."); return; }
    if (!time.match(/^\d{2}:\d{2}$/)) { setErr("Time must look like 19:00."); return; }
    onSave({ ...initial, customerName: name.trim(), customerPhone: phone.trim() || undefined, partySize: party, day, dateLabel: mobileDays.find((d) => d.day === day)?.label ?? day, reservationTime: time, status: initial.status ?? "not_confirmed", source: initial.source ?? "Staff" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={initial.id ? "Modify booking" : "New booking"}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="demo-mobile relative w-full max-w-lg rounded-t-2xl bg-[#F6EBDA] p-4 pb-6 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <p className="text-[17px] font-bold">{initial.id ? "Modify booking" : "New booking"}</p>
          <button onClick={onClose} aria-label="Close form" className="rounded-lg p-1.5 hover:bg-[#E8D9C3]">
            <X size={18} color="#2E1B0D" />
          </button>
        </div>
        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-[13px] font-bold" htmlFor="mf-name">Guest name</label>
            <input id="mf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sofia" className="w-full rounded-xl border border-[#E8D9C3] bg-[#FFFBF3] px-3 py-2.5 text-[15px] placeholder:text-[#96806C] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-bold" htmlFor="mf-phone">Phone</label>
            <input id="mf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 …" className="w-full rounded-xl border border-[#E8D9C3] bg-[#FFFBF3] px-3 py-2.5 text-[15px] placeholder:text-[#96806C] focus:outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold">Party size</span>
            <button onClick={() => setParty(Math.max(1, party - 1))} aria-label="Fewer guests" className="h-9 w-9 rounded-full border border-[#E8D9C3] bg-[#FFFBF3] text-lg font-bold">−</button>
            <span className="w-8 text-center text-[16px] font-bold tabular-nums">{party}</span>
            <button onClick={() => setParty(Math.min(20, party + 1))} aria-label="More guests" className="h-9 w-9 rounded-full bg-[#3E2008] text-lg font-bold text-white">+</button>
            {party >= 6 && <span className="text-[12px] font-semibold text-[#8A5A22]">Group (shared table)</span>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[13px] font-bold" htmlFor="mf-day">Day</label>
              <select id="mf-day" value={day} onChange={(e) => setDay(e.target.value)} className="w-full rounded-xl border border-[#E8D9C3] bg-[#FFFBF3] px-3 py-2.5 text-[15px]">
                {mobileDays.map((d) => <option key={d.day} value={d.day}>{d.label}</option>)}
              </select>
            </div>
            <div className="w-28">
              <label className="mb-1 block text-[13px] font-bold" htmlFor="mf-time">Time</label>
              <input id="mf-time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="19:00" className="w-full rounded-xl border border-[#E8D9C3] bg-[#FFFBF3] px-3 py-2.5 text-[15px] tabular-nums placeholder:text-[#96806C] focus:outline-none" />
            </div>
          </div>
        </div>
        {err && <p className="mt-2 rounded-lg bg-[#F5D2CA] px-3 py-2 text-[13px] font-semibold text-[#78281B]">{err}</p>}
        <button onClick={save} className="mt-4 w-full rounded-xl bg-[#3E2008] py-3 text-[15px] font-bold text-white">
          {initial.id ? "Save changes" : "Create booking"}
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Read-only thread ----------------------------- */

const THREAD_LINES: Record<string, { from: "guest" | "ai"; text: string; time: string }[]> = {
  "TIB-2042": [
    { from: "guest", text: "Hi! Do you have a table for 14 people this Saturday?", time: "2:12 PM" },
    { from: "ai", text: "Hi Sofia! Yes — for groups above 5 we arrange a shared long table. What time were you thinking?", time: "2:13 PM" },
    { from: "guest", text: "Around 7pm. Two of us are vegetarian, is that ok?", time: "2:30 PM" },
  ],
  "TIB-2041": [
    { from: "guest", text: "Hello, I need to move my booking TIB-2041 from Friday to Sunday, same time.", time: "11:02 AM" },
    { from: "ai", text: "Hi Daniel! I can move TIB-2041 to Sunday at the same time. Just to confirm — should I go ahead?", time: "11:03 AM" },
  ],
};

function ThreadSheet({ booking: b, onClose }: { booking: MobileBooking; onClose: () => void }) {
  const lines = THREAD_LINES[b.id] ?? [
    { from: "guest", text: `Hi, confirming our booking ${b.referenceCode} for ${b.partySize} guests.`, time: "10:00 AM" },
    { from: "ai", text: "You're all set! Show your reference code when you arrive.", time: "10:01 AM" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`Chat with ${b.customerName}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="demo-mobile relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[#FCF4E9] p-4 pb-6 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <p className="text-[17px] font-bold">{b.customerName}</p>
          <button onClick={onClose} aria-label="Close chat" className="rounded-lg p-1.5 hover:bg-[#E8D9C3]">
            <X size={18} color="#2E1B0D" />
          </button>
        </div>
        <p className="mt-2 rounded-xl border border-[#E8D9C3] bg-[#FFFBF3] px-3 py-2 text-[12.5px] text-[#6A5240]">
          Read-only by design — replying lives in the web dashboard. This screen is for reading the chat on the floor.
        </p>
        <div className="mt-3 space-y-2">
          {lines.map((m, i) => (
            <div key={i} className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed", m.from === "guest" ? "rounded-bl-md border border-[#E8D9C3] bg-[#FFFBF3]" : "ml-auto rounded-br-md bg-[#3E2008] text-white")}>
              {m.text}
              <span className={cn("mt-0.5 block text-[10px] tabular-nums", m.from === "guest" ? "text-[#96806C]" : "text-white/70")}>{m.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
